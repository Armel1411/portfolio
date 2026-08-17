import EnteteAdmin from "@/components/EnteteAdmin";
import MessageAdmin from "@/components/MessageAdmin";
import { supabaseServeur } from "@/lib/supabase-serveur";
import { remplacerCV, supprimerCV } from "../actions";

export const revalidate = 0;

/* ============================================================
   CV téléchargeable
   ============================================================
   Trois opérations : ajouter, remplacer, retirer.

   « Retirer » ne supprime pas le fichier du stockage : il vide seulement
   l'adresse enregistrée, ce qui fait disparaître le bouton du site. On
   peut donc retirer son CV le temps de le refaire, sans rien perdre.
   ============================================================ */

export default async function PageDocuments({ searchParams }) {
  const parametres = await searchParams;
  const supabase = await supabaseServeur();

  const { data } = await supabase.from("textes").select("valeur").eq("cle", "cv_url").maybeSingle();

  const adresse = (data?.valeur || "").trim();
  const enLigne = adresse.length > 0;
  const fichierDuProjet = enLigne && adresse.startsWith("/");
  const nomDuFichier = enLigne ? decodeURIComponent(adresse.split("/").pop().split("?")[0]) : null;

  return (
    <>
      <EnteteAdmin fil="Administration · Site" titre="CV">
        {enLigne ? (
          <a href={adresse} target="_blank" rel="noopener noreferrer" className="bouton bouton-secondaire">
            Ouvrir le CV actuel ↗
          </a>
        ) : null}
      </EnteteAdmin>

      <div className="admin-contenu">
        <p className="intro">
          Le bouton « Télécharger mon CV » du site pointe sur le fichier enregistré ici. S'il n'y a
          aucun CV, le bouton disparaît de la page d'accueil — un bouton qui mène à un fichier
          absent fait plus de dégâts que pas de bouton du tout.
        </p>

        <MessageAdmin parametres={parametres} />

        <div className="bloc teinte" style={{ "--teinte": "#2dd4bf" }}>
          <h2>
            État actuel{" "}
            <span className={`pastille-etat ${enLigne ? "ok" : "off"}`}>
              {enLigne ? "En ligne" : "Aucun CV"}
            </span>
          </h2>

          {enLigne ? (
            <>
              <p className="aide">
                Fichier servi : <strong>{nomDuFichier}</strong>
                {fichierDuProjet
                  ? " — c'est encore celui livré avec le projet, pas un fichier que tu as téléversé."
                  : " — téléversé depuis cet écran."}
              </p>
              <div className="actions">
                <a href={adresse} target="_blank" rel="noopener noreferrer" className="bouton bouton-secondaire">
                  Ouvrir ↗
                </a>
                <form action={supprimerCV}>
                  <button type="submit" className="bouton bouton-danger">
                    Retirer le CV du site
                  </button>
                </form>
              </div>
            </>
          ) : (
            <p className="aide" style={{ marginBottom: 0 }}>
              Aucun CV n'est proposé au téléchargement en ce moment. Le bouton n'apparaît pas sur le
              site. Téléverse un PDF ci-dessous pour le remettre.
            </p>
          )}
        </div>

        <div className="bloc">
          <h2>{enLigne ? "Remplacer par une nouvelle version" : "Mettre un CV en ligne"}</h2>
          <p className="aide">
            Format PDF uniquement : c'est le seul qui s'ouvre à l'identique chez tout le monde. Un
            .docx s'affiche de travers une fois sur deux, et un recruteur n'insistera pas.
          </p>

          <form action={remplacerCV}>
            <div className="champ">
              <label>Fichier PDF</label>
              <input type="file" name="cv" accept="application/pdf" required />
            </div>
            <div className="actions">
              <button type="submit" className="bouton">
                {enLigne ? "Remplacer le CV" : "Mettre ce CV en ligne"}
              </button>
            </div>
          </form>
        </div>

        <div className="bloc">
          <h2>Avant de publier, deux vérifications</h2>
          <p className="aide" style={{ marginBottom: 10 }}>
            Ton CV et ton site doivent raconter la même histoire. Un recruteur qui télécharge un CV
            en contradiction avec le site en conclut que le site exagère — et c'est le document
            qu'il garde.
          </p>
          <ul className="aide" style={{ paddingLeft: 18, marginBottom: 0 }}>
            <li>Next.js, React et Supabase y figurent-ils, et en tête des compétences ?</li>
            <li>
              Institut AHN et le back-office de La Maison Reda Fawaz y sont-ils, avant les projets
              académiques ?
            </li>
          </ul>
        </div>
      </div>
    </>
  );
}
