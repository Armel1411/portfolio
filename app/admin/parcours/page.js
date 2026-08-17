import { supabaseServeur } from "@/lib/supabase-serveur";
import MessageAdmin from "@/components/MessageAdmin";
import { creerEtape, enregistrerEtape, supprimerEtape } from "../actions";

export const revalidate = 0;

/* ============================================================
   Parcours — expérience et formation
   ============================================================
   Écran à traiter avec soin : les dates et les intitulés d'ici sont
   exactement ce qu'un recruteur recoupe avec ton CV et ton LinkedIn. Une
   incohérence entre les trois est plus coûteuse qu'une ligne manquante.

   Sur le nom de l'organisation : « Agence web · Abidjan » plutôt que le
   nom de l'entreprise, c'est une décision assumée — mais reste capable de
   répondre franchement si on te pose la question en entretien.
   ============================================================ */

function Formulaire({ etape }) {
  const nouvelle = !etape;

  return (
    <form action={nouvelle ? creerEtape : enregistrerEtape}>
      {etape ? <input type="hidden" name="id" value={etape.id} /> : null}

      <div className="ligne-3">
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
      <h1>Parcours</h1>
      <p className="intro">
        Expériences et formation, de la plus récente à la plus ancienne. Vérifie que les dates
        d'ici correspondent à celles de ton CV.
      </p>

      <MessageAdmin parametres={parametres} />
      {error ? <div className="message erreur">Lecture impossible : {error.message}</div> : null}

      {etapes.map((etape) => (
        <div className="bloc" key={etape.id}>
          <details className="pliant">
            <summary>
              {etape.titre}
              <span className={`etiquette ${etape.visible ? "visible" : "masque"}`}>
                {etape.visible ? "affichée" : "masquée"}
              </span>
              <span className="rang">{etape.periode}</span>
            </summary>

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

      <div className="bloc">
        <details className="pliant">
          <summary>+ Ajouter une étape</summary>
          <Formulaire />
        </details>
      </div>
    </>
  );
}
