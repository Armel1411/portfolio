import Link from "next/link";
import { supabaseServeur } from "@/lib/supabase-serveur";

/**
 * Tableau de bord.
 *
 * Deux fonctions : donner accès aux six écrans, et afficher un état des
 * lieux chiffré. Ce compte de projets visibles est là pour une raison
 * précise — c'est le premier chiffre qu'un recruteur perçoit, et il vaut
 * mieux le voir ici que le découvrir en relisant son propre site.
 */
export const revalidate = 0;

async function compter(supabase, table, filtre) {
  try {
    let requete = supabase.from(table).select("*", { count: "exact", head: true });
    if (filtre) requete = requete.match(filtre);
    const { count, error } = await requete;
    if (error) throw error;
    return count ?? 0;
  } catch {
    return null;
  }
}

const ECRANS = [
  {
    chemin: "/admin/projets",
    icone: "🗂️",
    titre: "Projets",
    texte: "Ajouter, modifier, masquer ou réordonner tes réalisations et tes projets académiques.",
  },
  {
    chemin: "/admin/competences",
    icone: "🧰",
    titre: "Compétences",
    texte: "Les cartes de compétences et leurs étiquettes de technologies.",
  },
  {
    chemin: "/admin/parcours",
    icone: "🪜",
    titre: "Parcours",
    texte: "Expériences et formation. C'est ici qu'on corrige une date qu'un recruteur pourrait recouper.",
  },
  {
    chemin: "/admin/textes",
    icone: "✍️",
    titre: "Textes du site",
    texte: "Accroche, À propos, encadrés, contact, numéro de téléphone.",
  },
  {
    chemin: "/admin/documents",
    icone: "📄",
    titre: "CV",
    texte: "Remplacer le PDF téléchargeable depuis le site.",
  },
];

export default async function TableauDeBord() {
  const supabase = await supabaseServeur();

  const [projetsVisibles, projetsMasques, academiques, competences, etapes] = await Promise.all([
    compter(supabase, "projets", { categorie: "principal", visible: true }),
    compter(supabase, "projets", { categorie: "principal", visible: false }),
    compter(supabase, "projets", { categorie: "academique" }),
    compter(supabase, "competences", null),
    compter(supabase, "parcours", null),
  ]);

  const baseInjoignable = projetsVisibles === null;

  return (
    <>
      <h1>Tableau de bord</h1>
      <p className="intro">
        Tout ce que tu modifies ici apparaît sur le site au rechargement suivant. Aucune
        republication à faire.
      </p>

      {baseInjoignable ? (
        <div className="message erreur">
          La base de données est injoignable. Le site public continue de fonctionner avec le contenu
          de repli, mais rien ne peut être modifié tant que la connexion n'est pas rétablie.
        </div>
      ) : (
        <div className="bloc">
          <h2>État des lieux</h2>
          <p className="aide">
            {projetsVisibles} projet{projetsVisibles > 1 ? "s" : ""} en vitrine
            {projetsMasques > 0 ? ` · ${projetsMasques} masqué${projetsMasques > 1 ? "s" : ""}` : ""}
            {" · "}
            {academiques} projet{academiques > 1 ? "s" : ""} académique{academiques > 1 ? "s" : ""}
            {" · "}
            {competences} compétence{competences > 1 ? "s" : ""}
            {" · "}
            {etapes} étape{etapes > 1 ? "s" : ""} de parcours
          </p>
          {projetsVisibles < 3 ? (
            <p className="aide" style={{ marginBottom: 0 }}>
              Rappel : l'objectif est trois projets solides dont tu détiens le code. Tu en es à{" "}
              {projetsVisibles}.
            </p>
          ) : null}
        </div>
      )}

      <div className="grille-cartes">
        {ECRANS.map((ecran) => (
          <Link key={ecran.chemin} href={ecran.chemin} className="carte-lien">
            <span className="icone">{ecran.icone}</span>
            <h3>{ecran.titre}</h3>
            <p>{ecran.texte}</p>
          </Link>
        ))}
      </div>
    </>
  );
}
