import Revelation from "@/components/Revelation";
import { listeTechnologies } from "@/lib/donnees";

/**
 * Section « Compétences ».
 *
 * L'ordre des cartes compte : c'est lui qui dit quel est ton métier.
 * Front-end et back-end d'abord, réseaux en dernier — un recruteur lit
 * les deux premières cartes et arrête. Le champ "ordre" de la table
 * "competences" contrôle cet ordre depuis l'admin.
 */
export default function Competences({ textes, competences }) {
  return (
    <section id="skills" className="section-alt">
      <div className="wrap">
        <Revelation>
          <div className="sec-label">Compétences</div>
          <h2>{textes.competences_titre}</h2>
          <p className="sec-desc">{textes.competences_intro}</p>

          <div className="skills">
            {competences.map((competence) => (
              <div className="skill-card" key={competence.id}>
                <div className="skill-icon">{competence.icone}</div>
                <h3>{competence.titre}</h3>
                <p>{competence.description}</p>
                <div className="tags">
                  {listeTechnologies(competence.technologies).map((techno) => (
                    <span className="tag" key={techno}>
                      {techno}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Revelation>
      </div>
    </section>
  );
}
