import { supabaseServeur } from "@/lib/supabase-serveur";
import MessageAdmin from "@/components/MessageAdmin";
import { creerProjet, enregistrerProjet, supprimerProjet } from "../actions";

export const revalidate = 0;

/* ============================================================
   Gestion des projets
   ============================================================
   Deux listes : les réalisations (cartes larges avec capture d'écran) et
   les projets académiques (cartes compactes). Le champ "ordre" décide de
   la position : 1 apparaît en premier.

   Le champ « Provenance » est le plus important de cet écran. C'est lui
   qui écrit « Développé seul · au sein d'une agence web à Abidjan » sous
   le titre, et qui évite qu'un projet fait pour quelqu'un d'autre passe
   pour une mission décrochée en direct. Laisse-le vide seulement pour un
   projet dont tu es entièrement l'auteur et le propriétaire.
   ============================================================ */

function ChampsCommuns({ projet }) {
  return (
    <>
      <div className="ligne">
        <div className="champ">
          <label>Titre</label>
          <input type="text" name="titre" defaultValue={projet?.titre || ""} required />
        </div>
        <div className="champ">
          <label>
            Ordre d'affichage <span className="indice">— 1 = en premier</span>
          </label>
          <input type="number" name="ordre" defaultValue={projet?.ordre ?? 1} />
        </div>
      </div>

      <div className="champ">
        <label>
          Provenance <span className="indice">— affichée sous le titre, en petit</span>
        </label>
        <input
          type="text"
          name="origine"
          defaultValue={projet?.origine || ""}
          placeholder="Développé seul · au sein d'une agence web à Abidjan"
        />
      </div>

      <div className="champ">
        <label>Description</label>
        <textarea name="description" rows={5} defaultValue={projet?.description || ""} />
      </div>

      <div className="ligne">
        <div className="champ">
          <label>
            Statut <span className="indice">— la pastille de la carte</span>
          </label>
          <input
            type="text"
            name="statut"
            defaultValue={projet?.statut || ""}
            placeholder="En ligne / Démo en ligne / En cours"
          />
        </div>
        <div className="champ">
          <label>Couleur de la pastille</label>
          <select name="statut_type" defaultValue={projet?.statut_type || "live"}>
            <option value="live">Vert — terminé, en ligne</option>
            <option value="wip">Orange — en cours, démo</option>
          </select>
        </div>
      </div>

      <div className="champ">
        <label>
          Technologies <span className="indice">— séparées par des virgules</span>
        </label>
        <input
          type="text"
          name="technologies"
          defaultValue={projet?.technologies || ""}
          placeholder="Next.js, Tailwind CSS, Supabase"
        />
      </div>

      <div className="ligne-3">
        <div className="champ">
          <label>Lien du site</label>
          <input type="url" name="lien_site" defaultValue={projet?.lien_site || ""} />
        </div>
        <div className="champ">
          <label>Libellé du lien</label>
          <input
            type="text"
            name="libelle_lien_site"
            defaultValue={projet?.libelle_lien_site || "Voir le site"}
          />
        </div>
        <div className="champ">
          <label>
            Lien du code <span className="indice">— laisse vide si non public</span>
          </label>
          <input type="url" name="lien_code" defaultValue={projet?.lien_code || ""} />
        </div>
      </div>

      <div className="ligne">
        <div className="champ">
          <label>
            Capture d'écran <span className="indice">— paysage, ~1200 × 750</span>
          </label>
          <input type="file" name="image" accept="image/*" />
          {projet?.image_url ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img src={projet.image_url} alt="" className="apercu-image" />
          ) : (
            <p className="aide" style={{ marginTop: 8, marginBottom: 0 }}>
              Aucune image : l'emoji ci-contre s'affiche à la place.
            </p>
          )}
        </div>
        <div className="champ">
          <label>
            Emoji de secours <span className="indice">— si pas d'image</span>
          </label>
          <input type="text" name="emoji" defaultValue={projet?.emoji || ""} placeholder="🎓" />
        </div>
      </div>
    </>
  );
}

function FormulaireProjet({ projet, categorie }) {
  const estAcademique = categorie === "academique";
  const nouveau = !projet;

  return (
    <form action={nouveau ? creerProjet : enregistrerProjet}>
      {projet ? <input type="hidden" name="id" value={projet.id} /> : null}
      <input type="hidden" name="categorie" value={categorie} />

      {estAcademique ? (
        <>
          <div className="ligne">
            <div className="champ">
              <label>Titre</label>
              <input type="text" name="titre" defaultValue={projet?.titre || ""} required />
            </div>
            <div className="champ">
              <label>Ordre d'affichage</label>
              <input type="number" name="ordre" defaultValue={projet?.ordre ?? 1} />
            </div>
          </div>
          <div className="champ">
            <label>Description</label>
            <textarea name="description" rows={4} defaultValue={projet?.description || ""} />
          </div>
        </>
      ) : (
        <ChampsCommuns projet={projet} />
      )}

      <div className="champ">
        <label className="case">
          <input type="checkbox" name="visible" defaultChecked={projet ? projet.visible : true} />
          Afficher sur le site
        </label>
      </div>

      <div className="actions">
        <button type="submit" className="bouton">
          {nouveau ? "Ajouter le projet" : "Enregistrer"}
        </button>
      </div>
    </form>
  );
}

function BlocProjet({ projet, categorie }) {
  return (
    <div className="bloc">
      <details className="pliant">
        <summary>
          {projet.titre}
          <span className={`etiquette ${projet.visible ? "visible" : "masque"}`}>
            {projet.visible ? "affiché" : "masqué"}
          </span>
          <span className="rang">ordre {projet.ordre}</span>
        </summary>

        <FormulaireProjet projet={projet} categorie={categorie} />

        {/* Formulaire séparé : un formulaire HTML ne peut pas en contenir
            un autre, et la suppression ne doit envoyer que l'identifiant. */}
        <form action={supprimerProjet} style={{ marginTop: 14 }}>
          <input type="hidden" name="id" value={projet.id} />
          <button type="submit" className="bouton bouton-danger">
            Supprimer définitivement
          </button>
        </form>
      </details>
    </div>
  );
}

export default async function PageProjets({ searchParams }) {
  const parametres = await searchParams;
  const supabase = await supabaseServeur();

  const { data, error } = await supabase
    .from("projets")
    .select("*")
    .order("categorie", { ascending: true })
    .order("ordre", { ascending: true });

  const projets = data || [];
  const principaux = projets.filter((p) => p.categorie === "principal");
  const academiques = projets.filter((p) => p.categorie === "academique");

  return (
    <>
      <h1>Projets</h1>
      <p className="intro">
        Clique sur un projet pour le modifier. L'ordre d'affichage décide de la position sur le
        site : mets 1 sur celui que tu veux voir en premier.
      </p>

      <MessageAdmin parametres={parametres} />

      {error ? (
        <div className="message erreur">Lecture impossible : {error.message}</div>
      ) : null}

      <h2 style={{ fontSize: "1.15rem", margin: "28px 0 14px" }}>
        Réalisations ({principaux.length})
      </h2>
      {principaux.map((projet) => (
        <BlocProjet key={projet.id} projet={projet} categorie="principal" />
      ))}

      <div className="bloc">
        <details className="pliant">
          <summary>+ Ajouter une réalisation</summary>
          <FormulaireProjet categorie="principal" />
        </details>
      </div>

      <h2 style={{ fontSize: "1.15rem", margin: "40px 0 14px" }}>
        Projets académiques ({academiques.length})
      </h2>
      {academiques.map((projet) => (
        <BlocProjet key={projet.id} projet={projet} categorie="academique" />
      ))}

      <div className="bloc">
        <details className="pliant">
          <summary>+ Ajouter un projet académique</summary>
          <FormulaireProjet categorie="academique" />
        </details>
      </div>
    </>
  );
}
