/**
 * Pied de page.
 *
 * L'année se calcule à l'affichage : pas de « © 2026 » à corriger à la
 * main tous les 1er janvier.
 */
export default function PiedDePage() {
  const annee = new Date().getFullYear();

  return (
    <footer>
      <div className="wrap">© {annee} Yves Armel — Conçu et développé avec soin.</div>
    </footer>
  );
}
