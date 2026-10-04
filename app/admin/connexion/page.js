"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabaseNavigateur } from "@/lib/supabase-navigateur";
import { journaliserConnexion } from "./actions";

/**
 * Connexion à l'administration, en deux temps.
 *
 * 1. Mot de passe — vérifié par Supabase, jamais par nous. L'application
 *    ne le stocke nulle part et ne le compare à rien.
 * 2. Second facteur, si un authentificateur est activé sur le compte :
 *    un code à six chiffres qui change toutes les trente secondes.
 *
 * Le second temps n'est pas décoratif : c'est ce qui fait qu'un mot de
 * passe volé ne suffit plus. Sans le téléphone, on n'entre pas.
 *
 * Le compte se crée dans Supabase → Authentication → Users. Il n'y a
 * volontairement aucune page d'inscription : ce site a un seul
 * administrateur, et une inscription ouverte serait une porte de plus.
 */
// Variables recopiées dans le code à la compilation : si elles manquent
// ici, c'est que le déploiement a été construit sans elles.
const SUPABASE_CONFIGURE = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// « Failed to fetch », « NetworkError », « fetch failed » : la requête n'a
// même pas obtenu de réponse. Sur un projet Supabase gratuit, la cause
// presque systématique est la mise en pause après une période sans visite.
function estErreurReseau(message) {
  const brut = String(message || "").toLowerCase();
  return (
    brut.includes("failed to fetch") ||
    brut.includes("networkerror") ||
    brut.includes("fetch failed") ||
    brut.includes("load failed") ||
    brut.includes("network request failed")
  );
}

const MESSAGE_SUPABASE_EN_PAUSE =
  "Supabase ne répond pas. Le projet est très probablement en pause (les projets gratuits " +
  "s'endorment après quelques jours sans visite). Va sur supabase.com → projet « portfolio » → " +
  "« Restore project », attends deux ou trois minutes, puis réessaie.";

const MESSAGE_CONFIGURATION =
  "Ce déploiement a été construit sans les variables NEXT_PUBLIC_SUPABASE_URL et " +
  "NEXT_PUBLIC_SUPABASE_ANON_KEY. Ajoute-les dans Vercel → Settings → Environment Variables, " +
  "puis Deployments → ⋯ → Redeploy en décochant « Use existing Build Cache ».";

function FormulaireConnexion() {
  const router = useRouter();
  const parametres = useSearchParams();
  const raison = parametres.get("raison");

  const [etape, setEtape] = useState("mot-de-passe");
  const [email, setEmail] = useState("");
  const [motDePasse, setMotDePasse] = useState("");
  const [code, setCode] = useState("");
  const [defi, setDefi] = useState(null); // { factorId, challengeId }
  const [erreur, setErreur] = useState("");
  const [enCours, setEnCours] = useState(false);
  const [succes, setSucces] = useState("");

  function messageDeRaison() {
    if (raison === "second-facteur") return "Ta session s'est arrêtée avant le second facteur. Reconnecte-toi.";
    if (raison === "configuration" || !SUPABASE_CONFIGURE) return MESSAGE_CONFIGURATION;
    if (raison === "mot-de-passe-change") return "Mot de passe modifié. Connecte-toi avec le nouveau.";
    if (raison === "lien-invalide")
      return "Le lien de réinitialisation a expiré ou a déjà servi. Redemande-en un.";
    return null;
  }

  async function entrer(supabase) {
    await journaliserConnexion({ email: email.trim(), reussie: true, motif: null });
    router.push("/admin");
    // refresh() force le serveur à relire le cookie tout neuf, sinon la
    // page suivante croirait encore que personne n'est connecté.
    router.refresh();
  }

  async function soumettreMotDePasse(evenement) {
    evenement.preventDefault();
    setErreur("");
    setSucces("");
    if (!SUPABASE_CONFIGURE) {
      setErreur(MESSAGE_CONFIGURATION);
      return;
    }
    setEnCours(true);

    try {
      const supabase = supabaseNavigateur();
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: motDePasse,
      });

      if (error) {
        const brut = (error.message || "").toLowerCase();
        await journaliserConnexion({ email: email.trim(), reussie: false, motif: error.message });

        if (estErreurReseau(error.message) || error.status === 0) {
          setErreur(MESSAGE_SUPABASE_EN_PAUSE);
        } else if (brut.includes("not confirmed")) {
          setErreur(
            "Ce compte existe mais n'est pas confirmé. Dans Supabase → Authentication → " +
              "Users, ouvre l'utilisateur et confirme-le."
          );
        } else if (brut.includes("invalid login")) {
          setErreur(
            "Email ou mot de passe incorrect. Mot de passe oublié ? Utilise le lien sous le bouton."
          );
        } else {
          setErreur(`Connexion refusée par Supabase : ${error.message}`);
        }
        setEnCours(false);
        return;
      }

      // Un second facteur est-il attendu sur ce compte ?
      const { data: niveau } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();

      if (niveau?.nextLevel === "aal2" && niveau.nextLevel !== niveau.currentLevel) {
        const { data: facteurs, error: erreurFacteurs } = await supabase.auth.mfa.listFactors();
        if (erreurFacteurs) throw erreurFacteurs;

        const totp = (facteurs?.totp || []).find((f) => f.status === "verified");
        if (!totp) {
          // Situation improbable : niveau attendu mais aucun facteur
          // vérifié. On laisse entrer plutôt que de bloquer.
          await entrer(supabase);
          return;
        }

        const { data: challenge, error: erreurDefi } = await supabase.auth.mfa.challenge({
          factorId: totp.id,
        });
        if (erreurDefi) throw erreurDefi;

        setDefi({ factorId: totp.id, challengeId: challenge.id });
        setEtape("code");
        setEnCours(false);
        return;
      }

      await entrer(supabase);
    } catch (probleme) {
      if (estErreurReseau(probleme?.message)) {
        setErreur(MESSAGE_SUPABASE_EN_PAUSE);
        console.error(probleme);
        setEnCours(false);
        return;
      }
      setErreur(
        `La requête n'a pas atteint Supabase (${probleme?.message || "cause inconnue"}). ` +
          "Vérifie que les variables NEXT_PUBLIC_SUPABASE_URL et NEXT_PUBLIC_SUPABASE_ANON_KEY " +
          "sont bien renseignées, noms compris — et sur le site en ligne, qu'un redéploiement a " +
          "suivi leur modification."
      );
      console.error(probleme);
      setEnCours(false);
    }
  }

  // Mot de passe oublié : Supabase envoie un lien à l'adresse saisie.
  // Le lien ramène sur /admin/nouveau-mot-de-passe, où l'on choisit le
  // nouveau mot de passe. Par sécurité, le message affiché est le même
  // que l'adresse existe ou non.
  async function motDePasseOublie() {
    setErreur("");
    setSucces("");
    const adresse = email.trim();
    if (!adresse) {
      setErreur("Saisis d'abord ton email dans le champ ci-dessus, puis reclique sur le lien.");
      return;
    }
    if (!SUPABASE_CONFIGURE) {
      setErreur(MESSAGE_CONFIGURATION);
      return;
    }
    setEnCours(true);
    try {
      const supabase = supabaseNavigateur();
      const { error } = await supabase.auth.resetPasswordForEmail(adresse, {
        redirectTo: `${window.location.origin}/admin/nouveau-mot-de-passe`,
      });
      if (error) {
        if (estErreurReseau(error.message) || error.status === 0) setErreur(MESSAGE_SUPABASE_EN_PAUSE);
        else if (error.status === 429)
          setErreur("Trop de demandes rapprochées. Attends quelques minutes avant de réessayer.");
        else setErreur(`Envoi impossible : ${error.message}`);
      } else {
        setSucces(
          "Si ce compte existe, un email de réinitialisation vient d'être envoyé. " +
            "Pense à regarder dans les spams."
        );
      }
    } catch (probleme) {
      setErreur(
        estErreurReseau(probleme?.message)
          ? MESSAGE_SUPABASE_EN_PAUSE
          : `Envoi impossible : ${probleme?.message || "cause inconnue"}`
      );
    }
    setEnCours(false);
  }

  async function soumettreCode(evenement) {
    evenement.preventDefault();
    setErreur("");
    setEnCours(true);

    try {
      const supabase = supabaseNavigateur();
      const { error } = await supabase.auth.mfa.verify({
        factorId: defi.factorId,
        challengeId: defi.challengeId,
        code: code.trim(),
      });

      if (error) {
        await journaliserConnexion({
          email: email.trim(),
          reussie: false,
          motif: `second facteur refusé : ${error.message}`,
        });
        setErreur("Code incorrect ou expiré. Un code ne vaut que trente secondes — réessaie avec le suivant.");
        setCode("");
        setEnCours(false);
        return;
      }

      await entrer(supabase);
    } catch (probleme) {
      setErreur(`Vérification impossible : ${probleme?.message || "cause inconnue"}`);
      setEnCours(false);
    }
  }

  const info = messageDeRaison();

  return (
    <div className="connexion-page">
      <div className="connexion-boite">
        <h1>Administration</h1>
        <p className="intro">
          {etape === "code"
            ? "Ouvre ton application d'authentification et saisis le code à six chiffres."
            : "Réservé à Yves. Connecte-toi pour modifier le site."}
        </p>

        {info && !erreur && !succes ? <div className="message info">{info}</div> : null}
        {succes ? <div className="message succes">{succes}</div> : null}
        {erreur ? <div className="message erreur">{erreur}</div> : null}

        {etape === "mot-de-passe" ? (
          <form onSubmit={soumettreMotDePasse}>
            <div className="champ">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="username"
                required
              />
            </div>

            <div className="champ">
              <label htmlFor="mdp">Mot de passe</label>
              <input
                id="mdp"
                type="password"
                value={motDePasse}
                onChange={(e) => setMotDePasse(e.target.value)}
                autoComplete="current-password"
                required
              />
            </div>

            <button type="submit" className="bouton" disabled={enCours} style={{ width: "100%" }}>
              {enCours ? "Connexion…" : "Se connecter"}
            </button>

            <button
              type="button"
              className="bouton-discret"
              style={{ marginTop: 14, display: "block", marginInline: "auto" }}
              onClick={motDePasseOublie}
              disabled={enCours}
            >
              Mot de passe oublié ?
            </button>
          </form>
        ) : (
          <form onSubmit={soumettreCode}>
            <div className="champ">
              <label htmlFor="code">Code à six chiffres</label>
              <input
                id="code"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                pattern="[0-9]*"
                maxLength={6}
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                autoFocus
                required
                style={{ letterSpacing: "0.4em", fontSize: 18, textAlign: "center" }}
              />
            </div>

            <button type="submit" className="bouton" disabled={enCours} style={{ width: "100%" }}>
              {enCours ? "Vérification…" : "Valider"}
            </button>

            <button
              type="button"
              className="bouton-discret"
              style={{ marginTop: 12 }}
              onClick={() => {
                setEtape("mot-de-passe");
                setCode("");
                setDefi(null);
                setErreur("");
              }}
            >
              ← Revenir en arrière
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

/**
 * useSearchParams() oblige à une frontière Suspense : sans elle, Next.js
 * refuse de compiler la page, parce qu'il ne peut pas la pré-rendre sans
 * connaître l'adresse demandée.
 */
export default function PageConnexion() {
  return (
    <Suspense
      fallback={
        <div className="connexion-page">
          <div className="connexion-boite">
            <h1>Administration</h1>
            <p className="intro">Chargement…</p>
          </div>
        </div>
      }
    >
      <FormulaireConnexion />
    </Suspense>
  );
}
