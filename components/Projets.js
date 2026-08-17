import Revelation from "@/components/Revelation";
import { listeTechnologies } from "@/lib/donnees";

/* ============================================================
   Section « Réalisations »
   ============================================================
   Deux blocs : les projets principaux en cartes larges avec capture
   d'écran, puis les projets académiques en cartes compactes sans image.
   La différence de traitement est volontaire — elle dit au lecteur
   lesquels comptent.

   Le champ "origine" ("Développé seul · au sein d'une agence web à
   Abidjan") répond par avance à la question que tout recruteur pose :
   pour qui ce projet a-t-il été fait, et qu'as-tu écrit toi-même.
   Ne le laisse pas vide sur un projet qui n'est pas 100 % le tien.
   ============================================================ */

function CarteProjet({ projet }) {
  const technologies = listeTechnologies(projet.technologies);

  return (
    <article className="project">
      <div className="thumb">
        {projet.image_url ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={projet.image_url}
            alt={`Aperçu du projet ${projet.titre}`}
            loading="lazy"
          />
        ) : (
          <span>{projet.emoji || "💻"}</span>
        )}
      </div>

      <div className="project-body">
        {projet.statut ? (
          <span className={`status ${projet.statut_type === "wip" ? "wip" : "live"}`}>
            {projet.statut}
          </span>
        ) : null}

        <h3>{projet.titre}</h3>

        {projet.origine ? <div className="origin">{projet.origine}</div> : null}

        <p>{projet.description}</p>

        {technologies.length > 0 ? (
          <div className="tags">
            {technologies.map((techno) => (
              <span className="tag" key={techno}>
                {techno}
              </span>
            ))}
          </div>
        ) : null}

        {projet.lien_site || projet.lien_code ? (
          <div className="project-links">
            {projet.lien_site ? (
              <a href={projet.lien_site} target="_blank" rel="noopener noreferrer">
                {projet.libelle_lien_site || "Voir le site"} ↗
              </a>
            ) : null}
            {projet.lien_code ? (
              <a href={projet.lien_code} target="_blank" rel="noopener noreferrer">
                Code source ↗
              </a>
            ) : null}
          </div>
        ) : null}
      </div>
    </article>
  );
}

export default function Projets({ textes, projets, academiques }) {
  return (
    <section id="projects">
      <div className="wrap">
        <Revelation>
          <div className="sec-label">Projets</div>
          <h2>{textes.projets_titre}</h2>
          <p className="sec-desc">{textes.projets_intro}</p>

          <div className="projects">
            {projets.map((projet) => (
              <CarteProjet projet={projet} key={projet.id} />
            ))}
          </div>

          {academiques.length > 0 ? (
            <>
              <h3 style={{ fontSize: "1.2rem", fontWeight: 700, margin: "56px 0 8px" }}>
                {textes.projets_academiques_titre}
              </h3>
              <p className="sec-desc" style={{ marginBottom: 26 }}>
                {textes.projets_academiques_intro}
              </p>

              <div className="mini-grid">
                {academiques.map((projet) => (
                  <div className="mini" key={projet.id}>
                    <h4>{projet.titre}</h4>
                    <p>{projet.description}</p>
                  </div>
                ))}
              </div>
            </>
          ) : null}
        </Revelation>
      </div>
    </section>
  );
}
