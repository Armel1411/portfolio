import EnteteAdmin from "@/components/EnteteAdmin";
import MessageAdmin from "@/components/MessageAdmin";
import { supabaseServeur } from "@/lib/supabase-serveur";
import { listeTechnologies } from "@/lib/donnees";
import { creerCompetence, enregistrerCompetence, supprimerCompetence } from "../actions";

export const revalidate = 0;

/* ============================================================
   Compétences
   ============================================================
   L'ordre de ces cartes est un choix de positionnement, pas un détail
   d'affichage : un recruteur lit les deux premières et se fait une idée.
   Front-end et back-end en 1 et 2, les réseaux en dernier — sinon le
   site raconte « étudiant qui liste son programme » au lieu de
   « développeur qui a choisi son métier ».
   ============================================================ */

function Formulaire({ competence }) {
  const nouvelle = !competence;

  return (
    <form action={nouvelle ? creerCompetence : enregistrerCompetence}>
      {competence ? <input type="hidden" name="id" value={competence.id} /> : null}

      <div className="ligne-champs-3">
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
          <input type="checkbox" name="visible" defaultChecked={competence ? competence.visible : true} />
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
      <EnteteAdmin fil="Administration · Contenu" titre="Compétences" />

      <div className="admin-contenu">
        <p className="intro">
          Cinq cartes suffisent. Au-delà, plus personne ne les lit — et une liste trop longue dilue
          le message au lieu de le renforcer.
        </p>

        <MessageAdmin parametres={parametres} />
        {error ? <div className="message erreur">Lecture impossible : {error.message}</div> : null}

        {competences.map((competence) => (
          <div className="ligne-item" key={competence.id}>
            <div className="ligne-tete">
              <div className="vignette" style={{ width: 60, height: 60, fontSize: 26 }}>
                {competence.icone || "◈"}
              </div>
              <div className="ligne-corps">
                <h4>
                  {competence.titre}
                  <span className={`pastille-etat ${competence.visible ? "ok" : "off"}`}>
                    {competence.visible ? "Affichée" : "Masquée"}
                  </span>
                </h4>
                <div className="prov">{competence.description}</div>
                <div className="etiquettes">
                  {listeTechnologies(competence.technologies).map((techno) => (
                    <span key={techno}>{techno}</span>
                  ))}
                </div>
              </div>
              <div className="ligne-cmd">
                <div className="rang">
                  <span className="num">{competence.ordre}</span>
                </div>
              </div>
            </div>

            <details className="rapide">
              <summary>Modifier</summary>
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

        <div className="ligne-item">
          <details className="rapide" style={{ marginTop: 0, paddingTop: 0, borderTop: 0 }}>
            <summary>+ Ajouter une compétence</summary>
            <Formulaire />
          </details>
        </div>
      </div>
    </>
  );
}
