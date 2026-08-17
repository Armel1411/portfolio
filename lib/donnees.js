import { supabasePublic } from "@/lib/supabase-public";
import {
  TEXTES_DEFAUT,
  PROJETS_DEFAUT,
  COMPETENCES_DEFAUT,
  PARCOURS_DEFAUT,
} from "@/lib/contenu-defaut";

/* ============================================================
   Lecture du contenu du site
   ============================================================
   Une règle unique gouverne ce fichier : le site ne doit JAMAIS
   s'afficher vide ou cassé à cause de la base de données.

   Chaque fonction suit donc le même schéma :
     1. Supabase n'est pas configuré  → contenu de repli
     2. La requête échoue             → contenu de repli + trace console
     3. La table est vide             → contenu de repli
     4. Sinon                         → les données de la base

   Conséquence pratique : tant que tu n'as pas rempli la base, ton site
   affiche exactement ce qu'il affiche aujourd'hui. Rien ne casse pendant
   la transition.
   ============================================================ */

export async function lireTextes() {
  const supabase = supabasePublic();
  if (!supabase) return TEXTES_DEFAUT;

  try {
    const { data, error } = await supabase.from("textes").select("cle, valeur");
    if (error) throw error;
    if (!data || data.length === 0) return TEXTES_DEFAUT;

    // On part des valeurs par défaut et on écrase avec ce que dit la base.
    // Une clé absente de la base garde ainsi sa valeur par défaut, au lieu
    // de laisser un trou dans la page.
    const textes = { ...TEXTES_DEFAUT };
    for (const ligne of data) {
      if (ligne.valeur !== null && ligne.valeur !== undefined && ligne.valeur !== "") {
        textes[ligne.cle] = ligne.valeur;
      }
    }
    return textes;
  } catch (erreur) {
    console.error("Lecture des textes impossible, contenu de repli utilisé :", erreur?.message || erreur);
    return TEXTES_DEFAUT;
  }
}

export async function lireProjets(categorie = "principal") {
  const repli = PROJETS_DEFAUT.filter((p) => p.categorie === categorie);
  const supabase = supabasePublic();
  if (!supabase) return repli;

  try {
    const { data, error } = await supabase
      .from("projets")
      .select("*")
      .eq("categorie", categorie)
      .eq("visible", true)
      .order("ordre", { ascending: true });

    if (error) throw error;
    return data && data.length > 0 ? data : repli;
  } catch (erreur) {
    console.error("Lecture des projets impossible, contenu de repli utilisé :", erreur?.message || erreur);
    return repli;
  }
}

export async function lireCompetences() {
  const supabase = supabasePublic();
  if (!supabase) return COMPETENCES_DEFAUT;

  try {
    const { data, error } = await supabase
      .from("competences")
      .select("*")
      .eq("visible", true)
      .order("ordre", { ascending: true });

    if (error) throw error;
    return data && data.length > 0 ? data : COMPETENCES_DEFAUT;
  } catch (erreur) {
    console.error("Lecture des compétences impossible, contenu de repli utilisé :", erreur?.message || erreur);
    return COMPETENCES_DEFAUT;
  }
}

export async function lireParcours() {
  const supabase = supabasePublic();
  if (!supabase) return PARCOURS_DEFAUT;

  try {
    const { data, error } = await supabase
      .from("parcours")
      .select("*")
      .eq("visible", true)
      .order("ordre", { ascending: true });

    if (error) throw error;
    return data && data.length > 0 ? data : PARCOURS_DEFAUT;
  } catch (erreur) {
    console.error("Lecture du parcours impossible, contenu de repli utilisé :", erreur?.message || erreur);
    return PARCOURS_DEFAUT;
  }
}

/* ------------------------------------------------------------
   Petits utilitaires de présentation
   ------------------------------------------------------------ */

// "Next.js, React, Tailwind" → ["Next.js", "React", "Tailwind"]
// Les technologies sont saisies dans l'admin comme une simple liste
// séparée par des virgules : c'est ce qui demande le moins d'effort au
// moment de la saisie.
export function listeTechnologies(valeur) {
  if (!valeur) return [];
  return String(valeur)
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
}

// "Localisation|Abidjan\nLangues|Français" → [{cle, valeur}, ...]
export function listeFaits(valeur) {
  if (!valeur) return [];
  return String(valeur)
    // \r?\n : un textarea rempli sous Windows envoie des retours à la
    // ligne en \r\n, qui laisseraient un caractère invisible en fin de
    // valeur et décaleraient l'affichage.
    .split(/\r?\n/)
    .map((ligne) => ligne.trim())
    .filter(Boolean)
    .map((ligne) => {
      const [cle, ...reste] = ligne.split("|");
      return { cle: (cle || "").trim(), valeur: reste.join("|").trim() };
    })
    .filter((f) => f.cle && f.valeur);
}
