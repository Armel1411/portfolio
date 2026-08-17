import Link from "next/link";
import EnteteAdmin from "@/components/EnteteAdmin";
import MessageAdmin from "@/components/MessageAdmin";
import { supabaseServeur } from "@/lib/supabase-serveur";
import { listeTechnologies } from "@/lib/donnees";
import { deplacerProjet, enregistrementRapideProjet, supprimerProjet } from "../actions";

export const revalidate = 0;

/* ============================================================
   Liste des projets
   ============================================================
   Deux niveaux d'édition, volontairement :

     • le dépliant « Modification rapide » sous chaque ligne, pour le
       titre, le statut et la visibilité — les trois choses qu'on change
       le plus souvent, sans quitter la liste ;
     • la page dédiée « Modifier tout », pour la description, les liens,
       la capture d'écran et la provenance.

   Les flèches ▲▼ renumérotent la liste entière : plus besoin de taper un
   numéro d'ordre et d'espérer qu'il ne soit pas déjà pris.
   ============================================================ */

function LigneProjet({ projet, premier, dernier }) {
  const technologies = listeTechnologies(projet.technologies);

  return (
    <div className="ligne-item">
      <div className="ligne-tete">
        <div className="vignette">
          {projet.image_url ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img src={projet.image_url} alt="" />
          ) : (
            <span>{projet.emoji || "💻"}</span>
          )}
        </div>

        <div className="ligne-corps">
          <h4>
            {projet.titre}
            {projet.statut ? (
              <span className={`pastille-etat ${projet.statut_type === "wip" ? "wip" : "ok"}`}>
                {projet.statut}
              </span>
            ) : null}
            <span className={`pastille-etat ${projet.visible ? "ok" : "off"}`}>
              {projet.visible ? "Affiché" : "Masqué"}
            </span>
          </h4>

          {projet.origine ? <div className="prov">{projet.origine}</div> : null}

          {technologies.length > 0 ? (
            <div className="etiquettes">
              {technologies.map((techno) => (
                <span key={techno}>{techno}</span>
              ))}
            </div>
          ) : null}
        </div>

        <div className="ligne-cmd">
          <div className="rang">
            <form action={deplacerProjet}>
              <input type="hidden" name="id" value={projet.id} />
              <input type="hidden" name="direction" value="haut" />
              <button type="submit" disabled={premier} aria-label="Monter">▲</button>
            </form>
            <span className="num">{projet.ordre}</span>
            <form action={deplacerProjet}>
              <input type="hidden" name="id" value={projet.id} />
              <input type="hidden" name="direction" value="bas" />
              <button type="submit" disabled={dernier} aria-label="Descendre">▼</button>
            </form>
          </div>

          <Link href={`/admin/projets/${projet.id}`} className="bouton-discret">
            Modifier tout →
          </Link>
        </div>
      </div>

      <details className="rapide">
        <summary>Modification rapide</summary>

        <form action={enregistrementRapideProjet}>
          <input type="hidden" name="id" value={projet.id} />
          <div className="ligne-champs">
            <div className="champ">
              <label>Titre</label>
              <input type="text" name="titre" defaultValue={projet.titre} required />
            </div>
            <div className="champ">
              <label>Statut</label>
              <input type="text" name="statut" defaultValue={projet.statut || ""} />
            </div>
          </div>
          <div className="champ">
            <label className="case">
              <input type="checkbox" name="visible" defaultChecked={projet.visible} />
              Afficher sur le site
            </label>
          </div>
          <div className="actions">
            <button type="submit" className="bouton">Enregistrer</button>
          </div>
        </form>

        {/* Formulaire distinct : un formulaire HTML ne peut pas en contenir
            un autre, et la suppression ne doit transmettre que l'identifiant. */}
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
      <EnteteAdmin fil="Administration · Contenu" titre="Projets">
        <Link href="/admin/projets/nouveau" className="bouton">
          + Ajouter une réalisation
        </Link>
      </EnteteAdmin>

      <div className="admin-contenu">
        <MessageAdmin parametres={parametres} />
        {error ? <div className="message erreur">Lecture impossible : {error.message}</div> : null}

        <div className="titre-sec">Réalisations — {principaux.length}</div>

        {principaux.map((projet, index) => (
          <LigneProjet
            key={projet.id}
            projet={projet}
            premier={index === 0}
            dernier={index === principaux.length - 1}
          />
        ))}

        <Link href="/admin/projets/nouveau" className="ajout-item">
          + Ajouter une réalisation
        </Link>

        <div className="titre-sec">Projets académiques — {academiques.length}</div>

        {academiques.map((projet, index) => (
          <LigneProjet
            key={projet.id}
            projet={projet}
            premier={index === 0}
            dernier={index === academiques.length - 1}
          />
        ))}

        <Link href="/admin/projets/nouveau?categorie=academique" className="ajout-item">
          + Ajouter un projet académique
        </Link>
      </div>
    </>
  );
}
