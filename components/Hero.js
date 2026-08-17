/**
 * Bloc d'ouverture de la page.
 *
 * Tout ce qui s'affiche ici vient de la table "textes" (ou du contenu de
 * repli). Le lien du CV pointe vers textes.cv_url : quand tu remplaces
 * le fichier depuis l'admin, cette adresse change et le bouton suit,
 * sans redéploiement.
 */
export default function Hero({ textes }) {
  return (
    <div className="hero">
      <div className="wrap">
        {textes.hero_badge ? (
          <div className="badge">
            <span className="dot" /> {textes.hero_badge}
          </div>
        ) : null}

        <h1>
          {textes.hero_titre}
          <br />
          <span className="grad">{textes.hero_titre_accent}</span>
        </h1>

        <p className="lead">{textes.hero_accroche}</p>

        <div className="btns">
          <a href="#projects" className="btn btn-p">
            Voir mes projets →
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
    </div>
  );
}
