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

/* Projet sans capture d'écran (souvent : encore en développement).
   Plutôt qu'un emoji seul sur un dégradé, un petit aperçu de fichier
   qui reprend ses technologies — cohérent avec le terminal du hero.
   Dès qu'une capture est ajoutée dans l'admin, elle prend la place. */
function VignetteCode({ projet, technologies }) {
  const nomFichier = String(projet.titre || "projet")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    // Les trois premiers mots suffisent : « plateforme-de-reservation ».
    .split("-")
    .slice(0, 3)
    .join("-");

  return (
    <div className="thumb thumb-code" aria-hidden="true">
      <pre>
        <span className="c-com">{`// ${nomFichier}.js`}</span>
        {"\n"}
        {technologies.slice(0, 4).map((techno) => (
          <span key={techno}>
            <span className="c-mot">import</span> <span className="c-nom">{techno.replace(/[^A-Za-z0-9]/g, "")}</span>{" "}
            <span className="c-mot">from</span> <span className="c-chaine">{`"${techno.toLowerCase()}"`}</span>
            {"\n"}
          </span>
        ))}
        {"\n"}
        <span className="c-mot">export default</span> <span className="c-nom">build</span>()
        <span className="t-curseur" />
      </pre>
      <span className="thumb-emoji">{projet.emoji || "💻"}</span>
    </div>
  );
}

function CarteProjet({ projet }) {
  const technologies = listeTechnologies(projet.technologies);

  return (
    <article className="project spot">
      {projet.image_url ? (
        <div className="thumb">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={projet.image_url}
            alt={`Aperçu du projet ${projet.titre}`}
            loading="lazy"
          />
        </div>
      ) : (
        <VignetteCode projet={projet} technologies={technologies} />
      )}

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
