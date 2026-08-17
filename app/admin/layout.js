import "./admin.css";
import NavAdmin from "@/components/NavAdmin";
import { compteConnecte, supabaseServeur } from "@/lib/supabase-serveur";
import { seDeconnecter } from "./actions";

/**
 * Habillage commun à tout l'espace d'administration.
 *
 * noindex / nofollow : cet espace n'a rien à faire dans les résultats de
 * recherche. Ça ne le protège pas — c'est proxy.js qui protège — mais ça
 * évite qu'il se retrouve référencé.
 */
export const metadata = {
  title: "Administration — Portfolio",
  robots: { index: false, follow: false },
};

export const revalidate = 0;

async function compter(supabase, table) {
  try {
    const { count, error } = await supabase.from(table).select("*", { count: "exact", head: true });
    if (error) throw error;
    return count ?? 0;
  } catch {
    return null;
  }
}

export default async function LayoutAdmin({ children }) {
  const compte = await compteConnecte();

  // Page de connexion : ni colonne ni barre, on n'affiche pas un menu à
  // quelqu'un qui n'est pas encore identifié.
  if (!compte) {
    return <>{children}</>;
  }

  const supabase = await supabaseServeur();
  const [projets, competences, parcours] = await Promise.all([
    compter(supabase, "projets"),
    compter(supabase, "competences"),
    compter(supabase, "parcours"),
  ]);

  return (
    <div className="admin-corps">
      <NavAdmin
        email={compte.email}
        compteurs={{ projets, competences, parcours }}
        deconnexion={seDeconnecter}
      />
      <div className="admin-zone">{children}</div>
    </div>
  );
}
