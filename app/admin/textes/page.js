import EnteteAdmin from "@/components/EnteteAdmin";
import { supabaseServeur } from "@/lib/supabase-serveur";
import MessageAdmin from "@/components/MessageAdmin";
import { TEXTES_DEFAUT } from "@/lib/contenu-defaut";
import { enregistrerTextes } from "../actions";

export const revalidate = 0;

/* ============================================================
   Textes du site
   ============================================================
   Un seul formulaire, un seul bouton d'enregistrement. Chaque champ
   correspond à une ligne de la table "textes".

   Les champs marqués « gras autorisé » acceptent **du texte entre deux
   paires d'astérisques** : le mot ressort alors en clair sur le fond
   sombre. C'est le seul effet de mise en forme disponible, volontairement
   — un texte saisi vite ne doit pas pouvoir casser la page.
   ============================================================ */

const GROUPES = [
  {
    titre: "Haut de page",
    teinte: "#a78bfa",
    aide: "Les trois premières lignes que voit un visiteur. C'est ce qui décide s'il descend ou s'il part.",
    champs: [
      { cle: "hero_badge", label: "Pastille verte", indice: "laisse vide pour la masquer" },
      { cle: "hero_titre", label: "Titre, première ligne" },
      { cle: "hero_titre_accent", label: "Titre, seconde ligne", indice: "s'affiche en dégradé violet-bleu" },
      { cle: "hero_accroche", label: "Accroche", zone: true, lignes: 5 },
    ],
  },
  {
    titre: "À propos",
    teinte: "#818cf8",
    aide: "Le paragraphe 3 est celui qui dit d'où viennent tes projets. Ne le supprime pas : c'est lui qui te protège de la question « comment as-tu décroché ce client ? » en entretien.",
    champs: [
      { cle: "apropos_titre", label: "Titre de la section" },
      { cle: "apropos_p1", label: "Paragraphe 1", zone: true, lignes: 4, gras: true },
      { cle: "apropos_p2", label: "Paragraphe 2", zone: true, lignes: 5, gras: true },
      { cle: "apropos_p3", label: "Paragraphe 3", zone: true, lignes: 4, gras: true },
      {
        cle: "apropos_faits",
        label: "Encadrés de droite",
        indice: "une ligne par encadré, au format  Intitulé|Valeur",
        zone: true,
        lignes: 6,
      },
    ],
  },
  {
    titre: "Compétences",
    teinte: "#22d3ee",
    aide: "Le contenu des cartes se modifie dans l'écran Compétences. Ici, seuls le titre et l'introduction.",
    champs: [
      { cle: "competences_titre", label: "Titre de la section" },
      { cle: "competences_intro", label: "Introduction", zone: true, lignes: 3 },
    ],
  },
  {
    titre: "Projets",
    teinte: "#6366f1",
    aide: "Les cartes elles-mêmes se modifient dans l'écran Projets.",
    champs: [
      { cle: "projets_titre", label: "Titre de la section" },
      { cle: "projets_intro", label: "Introduction", zone: true, lignes: 4 },
      { cle: "projets_academiques_titre", label: "Titre du bloc académique" },
      { cle: "projets_academiques_intro", label: "Introduction du bloc académique", zone: true, lignes: 3 },
    ],
  },
  {
    titre: "Parcours",
    teinte: "#38bdf8",
    aide: "Les étapes se modifient dans l'écran Parcours.",
    champs: [{ cle: "parcours_titre", label: "Titre de la section" }],
  },
  {
    titre: "Contact",
    teinte: "#2dd4bf",
    aide: "Le numéro est découpé en trois morceaux exprès : ainsi il n'est jamais écrit en entier dans le code de la page, et les robots qui aspirent les numéros ne le récupèrent pas. Le navigateur du visiteur le recompose au moment de l'affichage.",
    champs: [
      { cle: "contact_titre", label: "Titre de la section" },
      { cle: "contact_texte", label: "Texte", zone: true, lignes: 3 },
      { cle: "email", label: "Email" },
      { cle: "github", label: "Adresse GitHub" },
      { cle: "tel_indicatif", label: "Indicatif", indice: "225 pour la Côte d'Ivoire" },
      { cle: "tel_partie1", label: "Numéro — 4 premiers chiffres", indice: "ex. 0103" },
      { cle: "tel_partie2", label: "Numéro — 6 derniers chiffres", indice: "ex. 581665" },
    ],
  },
];

export default async function PageTextes({ searchParams }) {
  const parametres = await searchParams;
  const supabase = await supabaseServeur();

  const { data, error } = await supabase.from("textes").select("cle, valeur");

  // Une clé absente de la base garde sa valeur par défaut : le champ n'est
  // jamais vide sans raison, et enregistrer la crée proprement.
  const valeurs = { ...TEXTES_DEFAUT };
  for (const ligne of data || []) {
    if (ligne.valeur !== null && ligne.valeur !== undefined) valeurs[ligne.cle] = ligne.valeur;
  }

  return (
    <>
      <EnteteAdmin fil="Administration · Site" titre="Textes du site" />

      <div className="admin-contenu">
        <p className="intro">
          Modifie ce que tu veux, puis enregistre — un seul bouton pour l'ensemble de la page.
        </p>

        <MessageAdmin parametres={parametres} />
        {error ? <div className="message erreur">Lecture impossible : {error.message}</div> : null}

        <form action={enregistrerTextes}>
          {GROUPES.map((groupe) => (
            <div className="bloc teinte" key={groupe.titre} style={{ "--teinte": groupe.teinte }}>
              <h2>{groupe.titre}</h2>
              <p className="aide">{groupe.aide}</p>

              {groupe.champs.map((champ) => (
                <div className="champ" key={champ.cle}>
                  <label htmlFor={champ.cle}>
                    {champ.label}
                    {champ.indice ? <span className="indice"> — {champ.indice}</span> : null}
                    {champ.gras ? <span className="indice"> — gras autorisé avec **…**</span> : null}
                  </label>

                  {champ.zone ? (
                    <textarea
                      id={champ.cle}
                      name={champ.cle}
                      rows={champ.lignes || 3}
                      defaultValue={valeurs[champ.cle] || ""}
                    />
                  ) : (
                    <input
                      id={champ.cle}
                      type="text"
                      name={champ.cle}
                      defaultValue={valeurs[champ.cle] || ""}
                    />
                  )}
                </div>
              ))}
            </div>
          ))}

          {/* Conservée telle quelle : c'est l'écran CV qui la met à jour,
              mais elle doit rester dans le formulaire sinon l'enregistrement
            ne la verrait pas et elle resterait figée. */}
          <input type="hidden" name="cv_url" value={valeurs.cv_url || ""} />

          <div className="barre-enregistrer">
            <span className="rappel">
              Un seul enregistrement pour toute la page. Les modifications apparaissent sur le site
              au rechargement suivant.
            </span>
            <button type="submit" className="bouton">
              Enregistrer tous les textes
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
