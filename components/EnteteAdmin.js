/**
 * Barre supérieure d'un écran d'admin.
 *
 * Elle reste collée en haut au défilement, et porte toujours l'action
 * principale de la page à droite. Sur l'écran Projets, « Ajouter une
 * réalisation » est ainsi accessible même après avoir descendu quinze
 * projets — sans cela, il faut remonter.
 */
export default function EnteteAdmin({ fil, titre, children }) {
  return (
    <div className="admin-barre">
      <div>
        {fil ? <div className="fil">{fil}</div> : null}
        <h1>{titre}</h1>
      </div>
      {children ? <div className="cotes">{children}</div> : null}
    </div>
  );
}
