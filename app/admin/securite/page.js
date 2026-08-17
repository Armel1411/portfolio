import EnteteAdmin from "@/components/EnteteAdmin";
import GestionMFA from "@/components/GestionMFA";
import { supabaseServeur } from "@/lib/supabase-serveur";

export const revalidate = 0;

/* ============================================================
   Sécurité
   ============================================================
   Trois choses sur cet écran :
     • activer ou retirer la double authentification ;
     • lire le journal des tentatives de connexion ;
     • la liste des réglages qui ne se font QUE dans le tableau de bord
       Supabase, parce qu'aucun code ne peut les activer à ta place.
   ============================================================ */

function dateLisible(valeur) {
  try {
    return new Intl.DateTimeFormat("fr-FR", {
      dateStyle: "short",
      timeStyle: "short",
      timeZone: "Africa/Abidjan",
    }).format(new Date(valeur));
  } catch {
    return valeur;
  }
}

export default async function PageSecurite() {
  const supabase = await supabaseServeur();

  const { data: journal, error } = await supabase
    .from("connexions")
    .select("*")
    .order("cree_le", { ascending: false })
    .limit(40);

  const lignes = journal || [];
  const echecs = lignes.filter((l) => !l.reussie).length;

  return (
    <>
      <EnteteAdmin fil="Administration · Site" titre="Sécurité" />

      <div className="admin-contenu">
        <p className="intro">
          Ce site n'héberge aucune donnée personnelle — ni élève, ni client, ni paiement. Le seul
          bien à protéger est ta capacité à modifier ton propre site. Tout ce qui suit sert à ça, et
          rien de plus.
        </p>

        <GestionMFA />

        <div className="bloc">
          <h2>
            Journal des connexions{" "}
            {echecs > 0 ? (
              <span className="pastille-etat wip">{echecs} refus</span>
            ) : (
              <span className="pastille-etat ok">aucun refus</span>
            )}
          </h2>
          <p className="aide">
            Les quarante dernières tentatives, réussies ou non. Ce sont les échecs qui renseignent :
            plusieurs refus d'affilée sur un email qui n'est pas le tien méritent que tu changes de
            mot de passe.
          </p>

          {error ? (
            <div className="message erreur">
              Lecture impossible : {error.message}. Si l'erreur mentionne la table « connexions »,
              c'est que le script sql/03-securite.sql n'a pas encore été exécuté.
            </div>
          ) : lignes.length === 0 ? (
            <p className="aide" style={{ marginBottom: 0 }}>
              Aucune tentative enregistrée pour l'instant.
            </p>
          ) : (
            <div style={{ display: "grid", gap: 6 }}>
              {lignes.map((ligne) => (
                <div
                  key={ligne.id}
                  style={{
                    display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap",
                    padding: "8px 10px", borderRadius: 8,
                    background: "var(--a-bg)", border: "1px solid var(--a-border)",
                    fontSize: 12.5,
                  }}
                >
                  <span className={`pastille-etat ${ligne.reussie ? "ok" : "off"}`}>
                    {ligne.reussie ? "Réussie" : "Refusée"}
                  </span>
                  <span style={{ color: "var(--a-texte)" }}>{ligne.email || "—"}</span>
                  <span style={{ color: "var(--a-faible)", marginLeft: "auto" }}>
                    {dateLisible(ligne.cree_le)}
                  </span>
                  {ligne.motif ? (
                    <span style={{ color: "var(--a-faible)", width: "100%" }}>{ligne.motif}</span>
                  ) : null}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bloc teinte" style={{ "--teinte": "#38bdf8" }}>
          <h2>À faire dans le tableau de bord Supabase</h2>
          <p className="aide">
            Ces trois réglages sont des interrupteurs côté Supabase : aucun code ne peut les activer
            à ta place. Le premier est le plus important de toute cette page.
          </p>
          <ul className="aide" style={{ paddingLeft: 18, marginBottom: 0, lineHeight: 1.8 }}>
            <li>
              <strong>Authentication → Sign In / Providers → Email</strong> : décocher{" "}
              <strong>« Allow new users to sign up »</strong>. Sans ça, n'importe qui peut créer un
              compte sur ton projet avec la clé publique visible dans ton site.
            </li>
            <li>
              Au même endroit : activer <strong>« Prevent use of leaked passwords »</strong>.
              Supabase compare alors ton mot de passe aux bases de fuites connues et refuse ceux qui
              y figurent.
            </li>
            <li>
              <strong>Authentication → Users</strong> : c'est ici que tu retires un authentificateur
              si tu perds ton téléphone. C'est ta porte de secours — elle exige l'accès à ton compte
              Supabase, protège-le au moins aussi bien.
            </li>
          </ul>
        </div>

        <div className="bloc">
          <h2>Ce qui est déjà en place</h2>
          <ul className="aide" style={{ paddingLeft: 18, marginBottom: 0, lineHeight: 1.8 }}>
            <li>
              <strong>Écriture réservée aux administrateurs.</strong> Être connecté ne suffit plus :
              il faut figurer dans la table « administrateurs ». Un compte créé au hasard ne peut
              rien modifier.
            </li>
            <li>
              <strong>Politique de sécurité du contenu (CSP).</strong> Chaque page est servie avec
              un jeton à usage unique ; un script injecté qui ne le porte pas n'est pas exécuté.
            </li>
            <li>
              <strong>Session vérifiée à chaque page.</strong> Le jeton est revalidé auprès de
              Supabase, jamais cru sur parole. Un cookie fabriqué à la main ne passe pas.
            </li>
            <li>
              <strong>En-têtes de sécurité.</strong> Affichage dans un cadre interdit, type de
              fichier non deviné, HTTPS imposé, caméra micro et position refusés.
            </li>
            <li>
              <strong>Aucune clé secrète dans l'application.</strong> Seule la clé publique y
              figure, et ce qu'elle permet est borné par les règles de la base.
            </li>
          </ul>
        </div>
      </div>
    </>
  );
}
