import Revelation from "@/components/Revelation";

/**
 * Section « Expérience & formation », en frise verticale.
 *
 * Chaque entrée vient de la table "parcours" et se modifie depuis
 * l'admin. C'est utile : les dates d'une expérience sont exactement le
 * genre de détail qu'un recruteur recoupe avec le CV et LinkedIn, et
 * qu'il faut donc pouvoir corriger en trente secondes.
 */
export default function Parcours({ textes, parcours }) {
  return (
    <section id="parcours" className="section-alt">
      <div className="wrap">
        <Revelation>
          <div className="sec-label">Parcours</div>
          <h2>{textes.parcours_titre}</h2>

          <div className="timeline">
            {parcours.map((etape) => (
              <div className="tl-item" key={etape.id}>
                <div className="tl-date">{etape.periode}</div>
                <h3>{etape.titre}</h3>
                <div className="tl-org">{etape.organisation}</div>
                <p>{etape.description}</p>
              </div>
            ))}
          </div>
        </Revelation>
      </div>
    </section>
  );
}
