import "./admin.css";
import NavAdmin from "@/components/NavAdmin";
import { compteConnecte } from "@/lib/supabase-serveur";
import { seDeconnecter } from "./actions";

/**
 * Habillage commun à tout l'espace d'administration.
 *
 * noindex / nofollow : cet espace ne doit jamais apparaître dans les
 * résultats de recherche. Ça ne le protège pas — c'est proxy.js qui
 * protège — mais ça évite qu'il se retrouve référencé.
 */
export const metadata = {
  title: "Administration — Portfolio",
  robots: { index: false, follow: false },
};

export default async function LayoutAdmin({ children }) {
  const compte = await compteConnecte();

  // Page de connexion : pas de colonne de navigation, sinon on afficherait
  // un menu à quelqu'un qui n'est pas encore identifié.
  if (!compte) {
    return <>{children}</>;
  }

  return (
    <div className="admin-corps">
      <NavAdmin email={compte.email} deconnexion={seDeconnecter} />
      <main className="admin-zone">{children}</main>
    </div>
  );
}
