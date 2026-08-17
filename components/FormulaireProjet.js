/**
 * Formulaire complet d'un projet.
 *
 * Partagé par la page de création et la page de modification : un seul
 * endroit à corriger quand un champ change. Les projets académiques
 * n'affichent qu'une version réduite — ils n'ont ni capture, ni lien, ni
 * statut sur le site public, ces champs n'auraient donc aucun effet.
 */
export default function FormulaireProjet({ projet, categorie, action, libelleBouton }) {
  const academique = categorie === "academique";

  return (
    <form action={action}>
      {projet ? <input type="hidden" name="id" value={projet.id} /> : null}
      <input type="hidden" name="categorie" value={categorie} />

      <div className="bloc">
        <h2>L'essentiel</h2>
        <p className="aide">Le titre et la description sont ce qu'un visiteur lit en premier.</p>

        <div className="ligne-champs">
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
          <label>Description</label>
          <textarea name="description" rows={academique ? 4 : 6} defaultValue={projet?.description || ""} />
        </div>

        <div className="champ">
          <label className="case">
            <input type="checkbox" name="visible" defaultChecked={projet ? projet.visible : true} />
            Afficher sur le site
          </label>
        </div>
      </div>

      {academique ? null : (
        <>
          <div className="bloc teinte" style={{ "--teinte": "#a78bfa" }}>
            <h2>Provenance</h2>
            <p className="aide">
              C'est le champ le plus important de cet écran. Il s'affiche en petit sous le titre et
              répond par avance à la question que pose tout recruteur : pour qui ce projet
              a-t-il été fait, et qu'as-tu écrit toi-même. Ne le laisse vide que pour un projet dont
              tu es entièrement l'auteur.
            </p>
            <div className="champ">
              <label>Mention de provenance</label>
              <input
                type="text"
                name="origine"
                defaultValue={projet?.origine || ""}
                placeholder="Développé seul · au sein d'une agence web à Abidjan"
              />
            </div>
          </div>

          <div className="bloc">
            <h2>Statut et technologies</h2>
            <div className="ligne-champs">
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
          </div>

          <div className="bloc">
            <h2>Liens</h2>
            <p className="aide">
              Un lien mort fait plus de dégâts qu'un lien absent : laisse vide plutôt que de pointer
              vers un dépôt vide ou une page en travaux.
            </p>
            <div className="ligne-champs-3">
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
                <label>Lien du code</label>
                <input type="url" name="lien_code" defaultValue={projet?.lien_code || ""} />
              </div>
            </div>
          </div>

          <div className="bloc">
            <h2>Visuel</h2>
            <div className="ligne-champs">
              <div className="champ">
                <label>
                  Capture d'écran <span className="indice">— paysage, environ 1200 × 750</span>
                </label>
                <input type="file" name="image" accept="image/*" />
                {projet?.image_url ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img src={projet.image_url} alt="" className="apercu-image" />
                ) : (
                  <p className="aide" style={{ marginTop: 8, marginBottom: 0 }}>
                    Sans image, l'emoji ci-contre s'affiche à la place.
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
          </div>
        </>
      )}

      <div className="barre-enregistrer">
        <span className="rappel">Les modifications apparaissent sur le site au rechargement.</span>
        <button type="submit" className="bouton">
          {libelleBouton}
        </button>
      </div>
    </form>
  );
}
