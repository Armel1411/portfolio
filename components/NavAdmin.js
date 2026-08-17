"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";

/**
 * Colonne de navigation de l'admin.
 *
 * Composant client uniquement pour savoir sur quelle page on se trouve
 * (usePathname) et surligner l'entrée correspondante. Sans ça, on se
 * perd vite entre six écrans qui se ressemblent.
 */
const ENTREES = [
  { chemin: "/admin", libelle: "Tableau de bord" },
  { chemin: "/admin/projets", libelle: "Projets" },
  { chemin: "/admin/competences", libelle: "Compétences" },
  { chemin: "/admin/parcours", libelle: "Parcours" },
  { chemin: "/admin/textes", libelle: "Textes du site" },
  { chemin: "/admin/documents", libelle: "CV" },
];

export default function NavAdmin({ email, deconnexion }) {
  const cheminActuel = usePathname();

  return (
    <nav className="admin-nav">
      <div className="marque">
        Yves<span>.</span> admin
      </div>
      <div className="compte">{email}</div>

      {ENTREES.map((entree) => {
        const actif =
          entree.chemin === "/admin"
            ? cheminActuel === "/admin"
            : cheminActuel.startsWith(entree.chemin);

        return (
          <Link key={entree.chemin} href={entree.chemin} className={actif ? "actif" : ""}>
            {entree.libelle}
          </Link>
        );
      })}

      <div className="separateur">Site</div>
      <a href="/" target="_blank" rel="noopener noreferrer">
        Voir le site ↗
      </a>

      <form action={deconnexion} style={{ marginTop: 10 }}>
        <button type="submit" className="bouton bouton-secondaire" style={{ width: "100%" }}>
          Se déconnecter
        </button>
      </form>
    </nav>
  );
}
