import Link from "next/link";
import EnteteAdmin from "@/components/EnteteAdmin";
import { supabaseServeur } from "@/lib/supabase-serveur";

export const revalidate = 0;

/* ============================================================
   Tableau de bord
   ============================================================
   Un seul chiffre est mis en avant — les projets en vitrine — parce
   qu'un tableau de bord qui hurle dix nombres n'en fait retenir aucun.
   Celui-là est le seul qui décide de la force du portfolio, et la jauge
   à trois cases rend visible l'objectif : trois projets solides dont tu
   détiens le code.

   Les quatre compteurs en dessous sont secondaires. Chacun porte un
   texte en plus de sa pastille colorée : une information qui ne tient
   qu'à une couleur disparaît pour qui distingue mal les teintes.
   ============================================================ */

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
    chemin: "/admin/projets", icone: "▤", teinte: "#6366f1", titre: "Projets",
    texte: "Ajouter, modifier, masquer ou réordonner tes réalisations.",
  },
  {
    chemin: "/admin/competences", icone: "◈", teinte: "#22d3ee", titre: "Compétences",
    texte: "Les cartes et leurs étiquettes de technologies.",
  },
  {
    chemin: "/admin/parcours", icone: "▸", teinte: "#38bdf8", titre: "Parcours",
    texte: "Expériences et formation, dates comprises.",
  },
  {
    chemin: "/admin/textes", icone: "✎", teinte: "#a78bfa", titre: "Textes du site",
    texte: "Accroche, À propos, contact, numéro de téléphone.",
  },
  {
    chemin: "/admin/documents", icone: "▣", teinte: "#2dd4bf", titre: "CV",
    texte: "Ajouter, remplacer ou retirer le PDF téléchargeable.",
  },
];

export default async function TableauDeBord() {
  const supabase = await supabaseServeur();

  const [affiches, masques, academiques, competences, etapes] = await Promise.all([
    compter(supabase, "projets", { categorie: "principal", visible: true }),
    compter(supabase, "projets", { categorie: "principal", visible: false }),
    compter(supabase, "projets", { categorie: "academique" }),
    compter(supabase, "competences", null),
    compter(supabase, "parcours", null),
  ]);

  const baseInjoignable = affiches === null;
  const objectif = 3;

  return (
    <>
      <EnteteAdmin fil="Administration" titre="Tableau de bord">
        <a href="/" target="_blank" rel="noopener noreferrer" className="bouton bouton-secondaire">
          Voir le site ↗
        </a>
        <Link href="/admin/projets/nouveau" className="bouton">
          + Nouveau projet
        </Link>
      </EnteteAdmin>

      <div className="admin-contenu">
        {baseInjoignable ? (
          <div className="message erreur">
            La base de données est injoignable. Le site public continue de fonctionner avec son
            contenu de repli, mais rien ne peut être modifié tant que la connexion n'est pas
            rétablie.
          </div>
        ) : (
          <>
            <div className="hero-bloc">
              <div>
                <div className="lab">Projets en vitrine</div>
                <div className="val">{affiches}</div>
                <div className="sous">
                  {affiches >= objectif
                    ? "Objectif atteint. Tu peux maintenant retirer les projets faits en agence."
                    : "Objectif : trois projets solides dont tu détiens le code"}
                </div>
              </div>
              <div className="jauge" aria-hidden="true">
                {Array.from({ length: objectif }, (_, i) => (
                  <i key={i} className={i < affiches ? "plein" : "vide"} />
                ))}
              </div>
            </div>

            <div className="tuiles">
              <div className="tuile">
                <div className="lab"><span className="pt" style={{ background: "#4ade80" }} />Affichés</div>
                <div className="val">{affiches}</div>
                <div className="det">visibles du public</div>
              </div>
              <div className="tuile">
                <div className="lab"><span className="pt" style={{ background: "#8b8b99" }} />Masqués</div>
                <div className="val">{masques}</div>
                <div className="det">brouillons</div>
              </div>
              <div className="tuile">
                <div className="lab"><span className="pt" style={{ background: "#6366f1" }} />Académiques</div>
                <div className="val">{academiques}</div>
                <div className="det">bloc secondaire</div>
              </div>
              <div className="tuile">
                <div className="lab"><span className="pt" style={{ background: "#22d3ee" }} />Compétences</div>
                <div className="val">{competences}</div>
                <div className="det">{etapes} étapes de parcours</div>
              </div>
            </div>
          </>
        )}

        <div className="titre-sec">Gérer le contenu</div>
        <div className="grille-cartes">
          {ECRANS.map((ecran) => (
            <Link
              key={ecran.chemin}
              href={ecran.chemin}
              className="carte-lien"
              style={{ "--teinte": ecran.teinte }}
            >
              <span className="rond">{ecran.icone}</span>
              <h3>{ecran.titre}</h3>
              <p>{ecran.texte}</p>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}
