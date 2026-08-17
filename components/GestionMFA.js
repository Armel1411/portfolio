"use client";

import { useCallback, useEffect, useState } from "react";
import { supabaseNavigateur } from "@/lib/supabase-navigateur";

/**
 * Activation et retrait de la double authentification (TOTP).
 *
 * TOTP = un code à six chiffres calculé à partir d'un secret partagé et
 * de l'heure. Il change toutes les trente secondes, ne transite jamais
 * par le réseau, et ne peut donc pas être intercepté ni rejoué. C'est ce
 * qui fait qu'un mot de passe volé ne suffit plus à entrer.
 *
 * Tout se passe côté navigateur : le secret n'est affiché qu'une fois,
 * au moment de scanner, et l'application ne le conserve nulle part.
 *
 * ⚠️ En cas de perte du téléphone, le facteur se retire depuis le
 * tableau de bord Supabase (Authentication → Users → ton compte). C'est
 * la porte de secours — elle exige l'accès à ton compte Supabase.
 */
export default function GestionMFA() {
  const [chargement, setChargement] = useState(true);
  const [facteurs, setFacteurs] = useState([]);
  const [etape, setEtape] = useState("repos"); // repos | scan
  const [qr, setQr] = useState(null);
  const [secret, setSecret] = useState(null);
  const [facteurEnCours, setFacteurEnCours] = useState(null);
  const [code, setCode] = useState("");
  const [erreur, setErreur] = useState("");
  const [succes, setSucces] = useState("");
  const [occupe, setOccupe] = useState(false);

  const rafraichir = useCallback(async () => {
    try {
      const supabase = supabaseNavigateur();
      const { data, error } = await supabase.auth.mfa.listFactors();
      if (error) throw error;
      setFacteurs((data?.totp || []).filter((f) => f.status === "verified"));
    } catch (probleme) {
      setErreur(`Lecture impossible : ${probleme?.message || "cause inconnue"}`);
    } finally {
      setChargement(false);
    }
  }, []);

  useEffect(() => {
    rafraichir();
  }, [rafraichir]);

  async function commencer() {
    setErreur("");
    setSucces("");
    setOccupe(true);

    try {
      const supabase = supabaseNavigateur();

      // Une tentative abandonnée laisse un facteur non vérifié derrière
      // elle, et Supabase refuse d'en créer un second du même nom. On
      // fait donc le ménage avant.
      const { data: existants } = await supabase.auth.mfa.listFactors();
      for (const facteur of existants?.all || []) {
        if (facteur.status !== "verified") {
          await supabase.auth.mfa.unenroll({ factorId: facteur.id });
        }
      }

      const { data, error } = await supabase.auth.mfa.enroll({
        factorType: "totp",
        friendlyName: `Portfolio ${new Date().toISOString().slice(0, 10)}`,
      });
      if (error) throw error;

      setQr(data.totp?.qr_code || null);
      setSecret(data.totp?.secret || null);
      setFacteurEnCours(data.id);
      setEtape("scan");
    } catch (probleme) {
      setErreur(`Activation impossible : ${probleme?.message || "cause inconnue"}`);
    } finally {
      setOccupe(false);
    }
  }

  async function confirmer(evenement) {
    evenement.preventDefault();
    setErreur("");
    setOccupe(true);

    try {
      const supabase = supabaseNavigateur();

      const { data: defi, error: erreurDefi } = await supabase.auth.mfa.challenge({
        factorId: facteurEnCours,
      });
      if (erreurDefi) throw erreurDefi;

      const { error } = await supabase.auth.mfa.verify({
        factorId: facteurEnCours,
        challengeId: defi.id,
        code: code.trim(),
      });
      if (error) throw error;

      setEtape("repos");
      setQr(null);
      setSecret(null);
      setFacteurEnCours(null);
      setCode("");
      setSucces(
        "Double authentification activée. À la prochaine connexion, un code te sera demandé après le mot de passe."
      );
      await rafraichir();
    } catch (probleme) {
      setErreur(
        `Code refusé (${probleme?.message || "cause inconnue"}). Un code ne vaut que trente secondes — réessaie avec le suivant.`
      );
      setCode("");
    } finally {
      setOccupe(false);
    }
  }

  async function retirer(id) {
    setErreur("");
    setSucces("");
    setOccupe(true);

    try {
      const supabase = supabaseNavigateur();
      const { error } = await supabase.auth.mfa.unenroll({ factorId: id });
      if (error) throw error;
      setSucces("Double authentification retirée. Seul le mot de passe protège désormais l'admin.");
      await rafraichir();
    } catch (probleme) {
      setErreur(`Retrait impossible : ${probleme?.message || "cause inconnue"}`);
    } finally {
      setOccupe(false);
    }
  }

  if (chargement) {
    return (
      <div className="bloc">
        <h2>Double authentification</h2>
        <p className="aide" style={{ marginBottom: 0 }}>Vérification en cours…</p>
      </div>
    );
  }

  const active = facteurs.length > 0;

  return (
    <div className="bloc teinte" style={{ "--teinte": active ? "#2dd4bf" : "#a78bfa" }}>
      <h2>
        Double authentification{" "}
        <span className={`pastille-etat ${active ? "ok" : "off"}`}>
          {active ? "Activée" : "Inactive"}
        </span>
      </h2>

      {erreur ? <div className="message erreur">{erreur}</div> : null}
      {succes ? <div className="message succes">{succes}</div> : null}

      {active ? (
        <>
          <p className="aide">
            Un code à six chiffres est demandé après ton mot de passe. Même si quelqu'un obtenait
            tes identifiants, il n'entrerait pas sans ton téléphone.
          </p>
          {facteurs.map((facteur) => (
            <div className="actions" key={facteur.id}>
              <span className="aide" style={{ marginBottom: 0 }}>
                Authentificateur : {facteur.friendly_name || "sans nom"}
              </span>
              <button
                type="button"
                className="bouton bouton-danger"
                disabled={occupe}
                onClick={() => retirer(facteur.id)}
              >
                Retirer
              </button>
            </div>
          ))}
        </>
      ) : etape === "repos" ? (
        <>
          <p className="aide">
            Aujourd'hui, ton mot de passe est la seule chose qui protège ton site. S'il fuite — une
            réutilisation, un ordinateur partagé, une fuite chez un autre service — l'admin est
            ouvert. Le second facteur ferme cette porte.
            <br />
            Il te faut une application d'authentification sur ton téléphone : Google Authenticator,
            Microsoft Authenticator ou Authy, toutes gratuites.
          </p>
          <button type="button" className="bouton" disabled={occupe} onClick={commencer}>
            {occupe ? "Préparation…" : "Activer la double authentification"}
          </button>
        </>
      ) : (
        <>
          <p className="aide">
            Scanne ce code avec ton application d'authentification, puis saisis le code à six
            chiffres qu'elle affiche.
          </p>

          {qr ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={qr}
              alt="Code à scanner avec ton application d'authentification"
              style={{
                width: 190, height: 190, background: "#fff", padding: 10,
                borderRadius: 12, display: "block", marginBottom: 14,
              }}
            />
          ) : null}

          {secret ? (
            <p className="aide">
              Impossible de scanner ? Saisis cette clé à la main :<br />
              <code style={{ fontSize: 13, wordBreak: "break-all", color: "#e8e8ed" }}>{secret}</code>
            </p>
          ) : null}

          <form onSubmit={confirmer}>
            <div className="champ" style={{ maxWidth: 220 }}>
              <label htmlFor="code-mfa">Code affiché par l'application</label>
              <input
                id="code-mfa"
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                required
                style={{ letterSpacing: "0.4em", fontSize: 18, textAlign: "center" }}
              />
            </div>
            <div className="actions">
              <button type="submit" className="bouton" disabled={occupe || code.length < 6}>
                {occupe ? "Vérification…" : "Confirmer"}
              </button>
              <button
                type="button"
                className="bouton-discret"
                onClick={() => {
                  setEtape("repos");
                  setQr(null);
                  setSecret(null);
                  setCode("");
                }}
              >
                Annuler
              </button>
            </div>
          </form>
        </>
      )}
    </div>
  );
}
