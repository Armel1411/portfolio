"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabaseNavigateur } from "@/lib/supabase-navigateur";

/**
 * Choix d'un nouveau mot de passe.
 *
 * On arrive ici depuis le lien de l'email « Mot de passe oublié ». Le
 * client Supabase lit tout seul le code présent dans l'adresse et ouvre
 * une session temporaire de récupération : il ne reste qu'à saisir le
 * nouveau mot de passe.
 *
 * Si la double authentification est activée sur le compte, Supabase
 * exige le code à six chiffres avant d'accepter le changement : sinon,
 * quelqu'un qui aurait accès à ta boîte mail pourrait prendre le compte
 * sans ton téléphone. L'écran le demande alors automatiquement.
 *
 * Pour que le lien fonctionne, l'adresse de cette page doit figurer dans
 * Supabase → Authentication → URL Configuration → Redirect URLs.
 */
export default function PageNouveauMotDePasse() {
  const router = useRouter();
  const [etat, setEtat] = useState("verification"); // verification | formulaire | code | invalide
  const [motDePasse, setMotDePasse] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [code, setCode] = useState("");
  const [erreur, setErreur] = useState("");
  const [enCours, setEnCours] = useState(false);

  // Au chargement : la session de récupération est-elle bien ouverte ?
  useEffect(() => {
    let annule = false;

    async function verifier() {
      try {
        const supabase = supabaseNavigateur();
        const parametres = new URLSearchParams(window.location.search);
        const erreurLien = parametres.get("error_description");

        // getSession() attend que le client ait fini de lire le code de
        // l'adresse : c'est lui qui transforme le lien en session.
        const { data } = await supabase.auth.getSession();
        if (annule) return;

        if (data?.session && !erreurLien) {
          // On retire le code de l'adresse : il ne sert qu'une fois.
          window.history.replaceState(null, "", window.location.pathname);
          setEtat("formulaire");
        } else {
          setEtat("invalide");
        }
      } catch {
        if (!annule) setEtat("invalide");
      }
    }

    verifier();
    return () => {
      annule = true;
    };
  }, []);

  async function changerMotDePasse(supabase) {
    const { error } = await supabase.auth.updateUser({ password: motDePasse });
    if (!error) {
      await supabase.auth.signOut();
      router.replace("/admin/connexion?raison=mot-de-passe-change");
      return true;
    }

    const brut = (error.message || "").toLowerCase();
    if (brut.includes("aal2") || error.code === "insufficient_aal") {
      setEtat("code");
      return false;
    }
    if (error.code === "same_password" || brut.includes("different from the old")) {
      setErreur("Le nouveau mot de passe doit être différent de l'ancien.");
    } else if (error.code === "weak_password" || brut.includes("weak") || brut.includes("pwned")) {
      setErreur(
        "Mot de passe refusé : trop faible ou déjà apparu dans une fuite de données. " +
          "Choisis-en un plus long et unique."
      );
    } else {
      setErreur(`Changement refusé : ${error.message}`);
    }
    return false;
  }

  async function soumettre(evenement) {
    evenement.preventDefault();
    setErreur("");

    if (motDePasse.length < 10) {
      setErreur("Au moins 10 caractères, s'il te plaît.");
      return;
    }
    if (motDePasse !== confirmation) {
      setErreur("Les deux mots de passe ne sont pas identiques.");
      return;
    }

    setEnCours(true);
    try {
      await changerMotDePasse(supabaseNavigateur());
    } catch (probleme) {
      setErreur(`Changement impossible : ${probleme?.message || "cause inconnue"}`);
    }
    setEnCours(false);
  }

  // Second facteur exigé : on vérifie le code, puis on refait le changement.
  async function soumettreCode(evenement) {
    evenement.preventDefault();
    setErreur("");
    setEnCours(true);

    try {
      const supabase = supabaseNavigateur();
      const { data: facteurs, error: erreurFacteurs } = await supabase.auth.mfa.listFactors();
      if (erreurFacteurs) throw erreurFacteurs;

      const totp = (facteurs?.totp || []).find((f) => f.status === "verified");
      if (!totp) throw new Error("aucun authentificateur actif sur ce compte");

      const { error } = await supabase.auth.mfa.challengeAndVerify({
        factorId: totp.id,
        code: code.trim(),
      });
      if (error) {
        setErreur("Code incorrect ou expiré. Réessaie avec le suivant.");
        setCode("");
        setEnCours(false);
        return;
      }

      await changerMotDePasse(supabase);
    } catch (probleme) {
      setErreur(`Vérification impossible : ${probleme?.message || "cause inconnue"}`);
    }
    setEnCours(false);
  }

  return (
    <div className="connexion-page">
      <div className="connexion-boite">
        <h1>Nouveau mot de passe</h1>

        {etat === "verification" ? <p className="intro">Vérification du lien…</p> : null}

        {etat === "invalide" ? (
          <>
            <p className="intro">
              Ce lien a expiré, a déjà servi, ou a été ouvert dans un autre navigateur que celui
              où tu l&apos;as demandé.
            </p>
            <a href="/admin/connexion" className="bouton" style={{ display: "block", textAlign: "center" }}>
              Redemander un lien
            </a>
          </>
        ) : null}

        {erreur ? <div className="message erreur">{erreur}</div> : null}

        {etat === "formulaire" ? (
          <form onSubmit={soumettre}>
            <p className="intro">Choisis un mot de passe d&apos;au moins 10 caractères.</p>
            <div className="champ">
              <label htmlFor="nouveau">Nouveau mot de passe</label>
              <input
                id="nouveau"
                type="password"
                value={motDePasse}
                onChange={(e) => setMotDePasse(e.target.value)}
                autoComplete="new-password"
                required
              />
            </div>
            <div className="champ">
              <label htmlFor="confirmation">Confirme-le</label>
              <input
                id="confirmation"
                type="password"
                value={confirmation}
                onChange={(e) => setConfirmation(e.target.value)}
                autoComplete="new-password"
                required
              />
            </div>
            <button type="submit" className="bouton" disabled={enCours} style={{ width: "100%" }}>
              {enCours ? "Enregistrement…" : "Enregistrer le mot de passe"}
            </button>
          </form>
        ) : null}

        {etat === "code" ? (
          <form onSubmit={soumettreCode}>
            <p className="intro">
              La double authentification est active : saisis le code à six chiffres de ton
              application pour confirmer le changement.
            </p>
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
              {enCours ? "Vérification…" : "Valider et changer le mot de passe"}
            </button>
          </form>
        ) : null}
      </div>
    </div>
  );
}
