import EnteteAdmin from "@/components/EnteteAdmin";
import MessageAdmin from "@/components/MessageAdmin";
import { supabaseServeur } from "@/lib/supabase-serveur";
import { creerEtape, enregistrerEtape, supprimerEtape } from "../actions";

export const revalidate = 0;

/* ============================================================
   Parcours — expérience et formation
   ============================================================
   Écran à traiter avec soin : les dates et les intitulés d'ici sont
   exactement ce qu'un recruteur recoupe avec ton CV et ton LinkedIn. Une
   incohérence entre les trois coûte plus cher qu'une ligne manquante.
   ============================================================ */

function Formulaire({ etape }) {
  const nouvelle = !etape;

  return (
    <form action={nouvelle ? creerEtape : enregistrerEtape}>
      {etape ? <input type="hidden" name="id" value={etape.id} /> : null}

      <div className="ligne-champs-3">
        <div className="champ">
          <label>
            Période <span className="indice">— ex. Juillet — Août 2026</span>
          </label>
          <input type="text" name="periode" defaultValue={etape?.periode || ""} />
        </div>
        <div className="champ">
          <label>Intitulé</label>
          <input type="text" name="titre" defaultValue={etape?.titre || ""} required />
        </div>
        <div className="champ">
          <label>
            Ordre <span className="indice">— 1 = en haut</span>
          </label>
          <input type="number" name="ordre" defaultValue={etape?.ordre ?? 1} />
        </div>
      </div>

      <div className="champ">
        <label>
          Organisation <span className="indice">— ex. Agence web · Abidjan</span>
        </label>
        <input type="text" name="organisation" defaultValue={etape?.organisation || ""} />
      </div>

      <div className="champ">
        <label>Description</label>
        <textarea name="description" rows={4} defaultValue={etape?.description || ""} />
      </div>

      <div className="champ">
        <label className="case">
          <input type="checkbox" name="visible" defaultChecked={etape ? etape.visible : true} />
          Afficher sur le site
        </label>
      </div>

      <div className="actions">
        <button type="submit" className="bouton">
          {nouvelle ? "Ajouter l'étape" : "Enregistrer"}
        </button>
      </div>
    </form>
  );
}

export default async function PageParcours({ searchParams }) {
  const parametres = await searchParams;
  const supabase = await supabaseServeur();

  const { data, error } = await supabase
    .from("parcours")
    .select("*")
    .order("ordre", { ascending: true });

  const etapes = data || [];

  return (
    <>
      <EnteteAdmin fil="Administration · Contenu" titre="Parcours" />

      <div className="admin-contenu">
        <p className="intro">
          Expériences et formation, de la plus récente à la plus ancienne. Vérifie que les dates
          d'ici correspondent à celles de ton CV.
        </p>

        <MessageAdmin parametres={parametres} />
        {error ? <div className="message erreur">Lecture impossible : {error.message}</div> : null}

        {etapes.map((etape) => (
          <div className="ligne-item" key={etape.id}>
            <div className="ligne-tete">
              <div className="ligne-corps">
                <h4>
                  {etape.titre}
                  <span className={`pastille-etat ${etape.visible ? "ok" : "off"}`}>
                    {etape.visible ? "Affichée" : "Masquée"}
                  </span>
                </h4>
                <div className="prov">
                  {etape.periode} · {etape.organisation}
                </div>
              </div>
              <div className="ligne-cmd">
                <div className="rang">
                  <span className="num">{etape.ordre}</span>
                </div>
              </div>
            </div>

            <details className="rapide">
              <summary>Modifier</summary>
              <Formulaire etape={etape} />
              <form action={supprimerEtape} style={{ marginTop: 14 }}>
                <input type="hidden" name="id" value={etape.id} />
                <button type="submit" className="bouton bouton-danger">
                  Supprimer définitivement
                </button>
              </form>
            </details>
          </div>
        ))}

        <div className="ligne-item">
          <details className="rapide" style={{ marginTop: 0, paddingTop: 0, borderTop: 0 }}>
            <summary>+ Ajouter une étape</summary>
            <Formulaire />
          </details>
        </div>
      </div>
    </>
  );
}
