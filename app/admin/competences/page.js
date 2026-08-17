import { supabaseServeur } from "@/lib/supabase-serveur";
import MessageAdmin from "@/components/MessageAdmin";
import { creerCompetence, enregistrerCompetence, supprimerCompetence } from "../actions";

export const revalidate = 0;

/* ============================================================
   Compétences
   ============================================================
   L'ordre de ces cartes est un choix de positionnement, pas un détail
   d'affichage : un recruteur lit les deux premières et se forme une
   opinion. Front-end et back-end en 1 et 2, les réseaux en dernier —
   sinon le site raconte « étudiant qui liste son programme » au lieu de
   « développeur qui a choisi son métier ».
   ============================================================ */

function Formulaire({ competence }) {
  const nouvelle = !competence;

  return (
    <form action={nouvelle ? creerCompetence : enregistrerCompetence}>
      {competence ? <input type="hidden" name="id" value={competence.id} /> : null}

      <div className="ligne-3">
        <div className="champ">
          <label>Titre</label>
          <input type="text" name="titre" defaultValue={competence?.titre || ""} required />
        </div>
        <div className="champ">
          <label>
            Emoji <span className="indice">— l'icône de la carte</span>
          </label>
          <input type="text" name="icone" defaultValue={competence?.icone || ""} placeholder="🎨" />
        </div>
        <div className="champ">
          <label>
            Ordre <span className="indice">— 1 = en premier</span>
          </label>
          <input type="number" name="ordre" defaultValue={competence?.ordre ?? 1} />
        </div>
      </div>

      <div className="champ">
        <label>Description</label>
        <textarea name="description" rows={2} defaultValue={competence?.description || ""} />
      </div>

      <div className="champ">
        <label>
          Technologies <span className="indice">— séparées par des virgules</span>
        </label>
        <input
          type="text"
          name="technologies"
          defaultValue={competence?.technologies || ""}
          placeholder="Next.js, React, Tailwind CSS"
        />
      </div>

      <div className="champ">
        <label className="case">
          <input
            type="checkbox"
            name="visible"
            defaultChecked={competence ? competence.visible : true}
          />
          Afficher sur le site
        </label>
      </div>

      <div className="actions">
        <button type="submit" className="bouton">
          {nouvelle ? "Ajouter la compétence" : "Enregistrer"}
        </button>
      </div>
    </form>
  );
}

export default async function PageCompetences({ searchParams }) {
  const parametres = await searchParams;
  const supabase = await supabaseServeur();

  const { data, error } = await supabase
    .from("competences")
    .select("*")
    .order("ordre", { ascending: true });

  const competences = data || [];

  return (
    <>
      <h1>Compétences</h1>
      <p className="intro">
        Cinq cartes suffisent. Au-delà, plus personne ne les lit — et une liste trop longue dilue
        le message au lieu de le renforcer.
      </p>

      <MessageAdmin parametres={parametres} />
      {error ? <div className="message erreur">Lecture impossible : {error.message}</div> : null}

      {competences.map((competence) => (
        <div className="bloc" key={competence.id}>
          <details className="pliant">
            <summary>
              {competence.icone} {competence.titre}
              <span className={`etiquette ${competence.visible ? "visible" : "masque"}`}>
                {competence.visible ? "affichée" : "masquée"}
              </span>
              <span className="rang">ordre {competence.ordre}</span>
            </summary>

            <Formulaire competence={competence} />

            <form action={supprimerCompetence} style={{ marginTop: 14 }}>
              <input type="hidden" name="id" value={competence.id} />
              <button type="submit" className="bouton bouton-danger">
                Supprimer définitivement
              </button>
            </form>
          </details>
        </div>
      ))}

      <div className="bloc">
        <details className="pliant">
          <summary>+ Ajouter une compétence</summary>
          <Formulaire />
        </details>
      </div>
    </>
  );
}
