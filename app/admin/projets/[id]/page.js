import Link from "next/link";
import { notFound } from "next/navigation";
import EnteteAdmin from "@/components/EnteteAdmin";
import FormulaireProjet from "@/components/FormulaireProjet";
import { supabaseServeur } from "@/lib/supabase-serveur";
import { enregistrerProjet, supprimerProjet } from "../../actions";

export const revalidate = 0;

/**
 * Modification complète d'un projet.
 *
 * Page dédiée plutôt que dépliant : avec la description, les trois liens,
 * la provenance et la capture d'écran, un formulaire ouvert dans la liste
 * la rendrait illisible dès deux projets ouverts.
 */
export default async function PageModifierProjet({ params }) {
  const { id } = await params;
  const supabase = await supabaseServeur();

  const { data: projet, error } = await supabase
    .from("projets")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    return (
      <>
        <EnteteAdmin fil="Administration · Projets" titre="Projet" />
        <div className="admin-contenu">
          <div className="message erreur">Lecture impossible : {error.message}</div>
        </div>
      </>
    );
  }

  if (!projet) notFound();

  return (
    <>
      <EnteteAdmin fil="Administration · Projets" titre={projet.titre}>
        <a href="/#projects" target="_blank" rel="noopener noreferrer" className="bouton bouton-secondaire">
          Voir sur le site ↗
        </a>
        <Link href="/admin/projets" className="bouton bouton-secondaire">
          ← Retour à la liste
        </Link>
      </EnteteAdmin>

      <div className="admin-contenu">
        <FormulaireProjet
          projet={projet}
          categorie={projet.categorie}
          action={enregistrerProjet}
          libelleBouton="Enregistrer les modifications"
        />

        <div className="bloc" style={{ marginTop: 26 }}>
          <h2>Zone sensible</h2>
          <p className="aide">
            La suppression est définitive et ne se rattrape pas. Pour retirer un projet du site sans
            le perdre, décoche « Afficher sur le site » ci-dessus : il reste ici, invisible du public.
          </p>
          <form action={supprimerProjet}>
            <input type="hidden" name="id" value={projet.id} />
            <button type="submit" className="bouton bouton-danger">
              Supprimer définitivement ce projet
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
