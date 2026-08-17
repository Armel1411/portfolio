/**
 * Pied de page.
 *
 * L'année se calcule à l'affichage : pas de « © 2026 » à corriger à la
 * main tous les 1er janvier.
 *
 * Le lien « Administration » est volontairement discret — petit, gris,
 * séparé du reste. Le rendre visible ne met pas ton site en danger (la
 * sécurité ne repose pas sur le fait de cacher l'adresse, mais sur le
 * mot de passe et le second facteur), mais un gros bouton « Admin » sur
 * un portfolio attire les robots qui essaient des mots de passe, et ça
 * n'a aucun intérêt pour un visiteur.
 *
 * rel="nofollow" demande aux moteurs de ne pas suivre ce lien ; la page
 * elle-même est déjà en noindex.
 */
export default function PiedDePage() {
  const annee = new Date().getFullYear();

  return (
    <footer>
      <div className="wrap">
        © {annee} Yves Armel — Conçu et développé avec soin.
        <a href="/admin" rel="nofollow" className="lien-admin">
          Administration
        </a>
      </div>
    </footer>
  );
}
