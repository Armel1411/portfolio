import Link from "next/link";
import EnteteAdmin from "@/components/EnteteAdmin";
import FormulaireProjet from "@/components/FormulaireProjet";
import { creerProjet } from "../../actions";

export const revalidate = 0;

/**
 * Création d'un projet.
 *
 * La catégorie arrive dans l'adresse (?categorie=academique) plutôt que
 * dans une liste déroulante : on arrive toujours ici depuis le bon bloc
 * de la liste, la question est donc déjà tranchée.
 */
export default async function PageNouveauProjet({ searchParams }) {
  const parametres = await searchParams;
  const categorie = parametres?.categorie === "academique" ? "academique" : "principal";

  return (
    <>
      <EnteteAdmin
        fil="Administration · Projets"
        titre={categorie === "academique" ? "Nouveau projet académique" : "Nouvelle réalisation"}
      >
        <Link href="/admin/projets" className="bouton bouton-secondaire">
          ← Retour à la liste
        </Link>
      </EnteteAdmin>

      <div className="admin-contenu">
        <FormulaireProjet
          categorie={categorie}
          action={creerProjet}
          libelleBouton="Ajouter le projet"
        />
      </div>
    </>
  );
}
