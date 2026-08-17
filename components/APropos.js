import Revelation from "@/components/Revelation";
import { listeFaits } from "@/lib/donnees";

/**
 * Section « À propos » : trois paragraphes à gauche, les encadrés de
 * faits à droite.
 *
 * Les paragraphes acceptent du gras : dans l'admin, écris **comme ceci**
 * et le mot s'affiche en clair sur fond sombre. C'est le seul effet de
 * mise en forme autorisé — volontairement, pour qu'un texte saisi
 * rapidement ne puisse pas casser la page.
 */
function ParagrapheAvecGras({ texte }) {
  if (!texte) return null;

  // On découpe sur **...** en gardant les séparateurs, puis on remplace
  // les morceaux encadrés par du <strong>.
  const morceaux = String(texte).split(/(\*\*[^*]+\*\*)/g);

  return (
    <p>
      {morceaux.map((morceau, index) =>
        morceau.startsWith("**") && morceau.endsWith("**") ? (
          <strong key={index}>{morceau.slice(2, -2)}</strong>
        ) : (
          morceau
        )
      )}
    </p>
  );
}

export default function APropos({ textes }) {
  const faits = listeFaits(textes.apropos_faits);

  return (
    <section id="about">
      <div className="wrap">
        <Revelation>
          <div className="sec-label">À propos</div>
          <h2>{textes.apropos_titre}</h2>

          <div className="about">
            <div>
              <ParagrapheAvecGras texte={textes.apropos_p1} />
              <ParagrapheAvecGras texte={textes.apropos_p2} />
              <ParagrapheAvecGras texte={textes.apropos_p3} />
            </div>

            <div className="facts">
              {faits.map((fait) => (
                <div className="fact" key={fait.cle}>
                  <div className="fact-k">{fait.cle}</div>
                  <div className="fact-v">{fait.valeur}</div>
                </div>
              ))}
            </div>
          </div>
        </Revelation>
      </div>
    </section>
  );
}
