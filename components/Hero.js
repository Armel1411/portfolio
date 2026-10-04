import FondGrille from "@/components/FondGrille";
import TitreDecode from "@/components/TitreDecode";
import Terminal from "@/components/Terminal";

/**
 * Bloc d'ouverture de la page.
 *
 * Trois couches :
 *   - en fond, la grille de points qui réagit à la souris (FondGrille) ;
 *   - à gauche, le titre qui se décode, l'accroche et les boutons ;
 *   - à droite, le terminal interactif qui « démarre » le portfolio.
 *
 * Tout le texte vient de la table "textes" (ou du contenu de repli). Le
 * terminal reçoit les projets et les compétences : ce que tu ajoutes dans
 * l'admin y apparaît aussi, sans toucher au code.
 */
export default function Hero({ textes, terminal }) {
  return (
    <div className="hero">
      <FondGrille />

      <div className="wrap hero-grille">
        <div className="hero-texte">
          {textes.hero_badge ? (
            <div className="badge entree entree-1">
              <span className="dot" /> {textes.hero_badge}
            </div>
          ) : null}

          <TitreDecode ligne1={textes.hero_titre} ligne2={textes.hero_titre_accent} />

          <p className="lead entree entree-2">{textes.hero_accroche}</p>

          <div className="btns entree entree-3">
            <a href="#projects" className="btn btn-p">
              Voir mes projets
            </a>

            {/* Pas de CV enregistré : pas de bouton. Un bouton qui mène à un
                fichier absent coûte plus cher que son absence — le visiteur
                en déduit que le reste du site est aussi négligé. Le CV se
                retire et se remet depuis l'admin, écran « CV ». */}
            {textes.cv_url && String(textes.cv_url).trim() !== "" ? (
              <a href={textes.cv_url} download className="btn btn-s">
                Télécharger mon CV
              </a>
            ) : null}
          </div>
        </div>

        <div className="hero-terminal entree entree-terminal">
          <Terminal {...terminal} />
        </div>
      </div>
    </div>
  );
}
