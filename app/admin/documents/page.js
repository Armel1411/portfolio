import { supabaseServeur } from "@/lib/supabase-serveur";
import MessageAdmin from "@/components/MessageAdmin";
import { remplacerCV } from "../actions";

export const revalidate = 0;

/* ============================================================
   CV téléchargeable
   ============================================================
   Le bouton « Télécharger mon CV » du site pointe vers l'adresse
   enregistrée dans textes.cv_url. Téléverser un nouveau fichier ici met
   cette adresse à jour : le bouton suit, sans republication.

   Les anciennes versions ne sont pas effacées, elles restent dans le
   stockage sous leur propre adresse. Ce n'est pas grave, mais autant le
   savoir : un lien vers une ancienne version reste valide.
   ============================================================ */

export default async function PageDocuments({ searchParams }) {
  const parametres = await searchParams;
  const supabase = await supabaseServeur();

  const { data } = await supabase.from("textes").select("valeur").eq("cle", "cv_url").maybeSingle();

  const adresseActuelle = data?.valeur || "/cv-yves-armel.pdf";
  const cvDansLeProjet = adresseActuelle.startsWith("/");

  return (
    <>
      <h1>CV</h1>
      <p className="intro">
        Remplace le PDF téléchargeable depuis le site. Le bouton du haut de page pointera
        automatiquement sur la nouvelle version.
      </p>

      <MessageAdmin parametres={parametres} />

      <div className="bloc">
        <h2>Version en ligne</h2>
        <p className="aide">
          {cvDansLeProjet
            ? "C'est encore le fichier livré avec le projet. Dès que tu téléverses une version ici, c'est elle qui sera servie."
            : "Fichier téléversé depuis cet écran."}
        </p>
        <a href={adresseActuelle} target="_blank" rel="noopener noreferrer" className="bouton bouton-secondaire">
          Ouvrir le CV actuel ↗
        </a>
      </div>

      <div className="bloc">
        <h2>Téléverser une nouvelle version</h2>
        <p className="aide">
          Format PDF uniquement — c'est le seul qui s'ouvre à l'identique chez tout le monde.
        </p>

        <form action={remplacerCV}>
          <div className="champ">
            <label>Fichier PDF</label>
            <input type="file" name="cv" accept="application/pdf" required />
          </div>
          <div className="actions">
            <button type="submit" className="bouton">
              Mettre ce CV en ligne
            </button>
          </div>
        </form>
      </div>

      <div className="bloc">
        <h2>Avant de remplacer, deux vérifications</h2>
        <p className="aide" style={{ marginBottom: 10 }}>
          Ton CV et ton site doivent raconter la même histoire. Un recruteur qui télécharge un CV
          en contradiction avec le site conclut que le site exagère.
        </p>
        <ul className="aide" style={{ paddingLeft: 18, marginBottom: 0 }}>
          <li>Next.js, React et Supabase y figurent-ils, et en tête des compétences ?</li>
          <li>
            Institut AHN et le back-office de La Maison Reda Fawaz y sont-ils, avant les projets
            académiques ?
          </li>
        </ul>
      </div>
    </>
  );
}
