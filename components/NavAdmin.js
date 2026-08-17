"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";

/**
 * Colonne de navigation de l'admin.
 *
 * Chaque rubrique porte sa teinte, passée en variable CSS --teinte : la
 * couleur suit ensuite partout (surlignage du lien actif, icône, fond des
 * cartes, bordure des blocs). Changer une teinte ici la change à l'écran
 * correspondant, sans toucher au CSS.
 *
 * Toutes les teintes sont froides, volontairement : le vert, l'orange et
 * le rouge restent réservés aux états (affiché, en cours, supprimer).
 *
 * Les compteurs affichés à droite servent à voir l'état du site sans
 * ouvrir les écrans.
 */
export const RUBRIQUES = [
  { chemin: "/admin", libelle: "Tableau de bord", icone: "▦", teinte: "#818cf8", groupe: "Contenu" },
  { chemin: "/admin/projets", libelle: "Projets", icone: "▤", teinte: "#6366f1", groupe: "Contenu", compteur: "projets" },
  { chemin: "/admin/competences", libelle: "Compétences", icone: "◈", teinte: "#22d3ee", groupe: "Contenu", compteur: "competences" },
  { chemin: "/admin/parcours", libelle: "Parcours", icone: "▸", teinte: "#38bdf8", groupe: "Contenu", compteur: "parcours" },
  { chemin: "/admin/textes", libelle: "Textes", icone: "✎", teinte: "#a78bfa", groupe: "Site" },
  { chemin: "/admin/documents", libelle: "CV", icone: "▣", teinte: "#2dd4bf", groupe: "Site" },
];

export default function NavAdmin({ email, compteurs = {}, deconnexion }) {
  const cheminActuel = usePathname();

  const initiales = (email || "?").slice(0, 2).toUpperCase();
  let groupeAffiche = null;

  return (
    <nav className="admin-nav">
      <div className="nav-marque">
        <div className="nav-pastille">YA</div>
        <div>
          <div className="nom">Yves Armel</div>
          <div className="role">Administration</div>
        </div>
      </div>

      {RUBRIQUES.map((rubrique) => {
        const actif =
          rubrique.chemin === "/admin"
            ? cheminActuel === "/admin"
            : cheminActuel.startsWith(rubrique.chemin);

        const nouveauGroupe = rubrique.groupe !== groupeAffiche;
        groupeAffiche = rubrique.groupe;
        const compteur = rubrique.compteur ? compteurs[rubrique.compteur] : null;

        return (
          <div key={rubrique.chemin}>
            {nouveauGroupe ? <div className="nav-groupe">{rubrique.groupe}</div> : null}
            <Link
              href={rubrique.chemin}
              className={actif ? "nav-lien actif" : "nav-lien"}
              style={{ "--teinte": rubrique.teinte }}
            >
              <span className="ic">{rubrique.icone}</span>
              {rubrique.libelle}
              {compteur !== null && compteur !== undefined ? (
                <span className="nav-compte">{compteur}</span>
              ) : null}
            </Link>
          </div>
        );
      })}

      <a href="/" target="_blank" rel="noopener noreferrer" className="nav-lien" style={{ "--teinte": "#8b8b99" }}>
        <span className="ic">↗</span> Voir le site
      </a>

      <div className="nav-bas">
        <div className="nav-util">
          <div className="nav-avatar">{initiales}</div>
          <div className="mail">{email}</div>
        </div>
        <form action={deconnexion}>
          <button type="submit" className="nav-lien" style={{ "--teinte": "#8b8b99" }}>
            <span className="ic">⏻</span> Se déconnecter
          </button>
        </form>
      </div>
    </nav>
  );
}
