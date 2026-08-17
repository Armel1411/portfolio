"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { supabaseServeur } from "@/lib/supabase-serveur";

/* =====================================================================
   Actions de l'administration
   =====================================================================
   Ces fonctions ne s'exécutent QUE sur le serveur — c'est le rôle de la
   directive "use server" en haut du fichier. Les formulaires de l'admin
   les appellent directement, sans qu'il y ait besoin d'écrire une route
   d'API ni du JavaScript côté navigateur.

   Chaque action suit la même discipline :
     1. vérifier qu'un compte est bien connecté
     2. faire le travail
     3. revalidatePath("/") pour que la page publique reflète le changement
     4. revenir à la page avec un message lisible

   Les règles RLS de la base sont une seconde barrière : même si une de
   ces vérifications était contournée, Supabase refuserait l'écriture à
   quelqu'un qui n'est pas authentifié.
   ===================================================================== */

// Petit utilitaire : construit l'adresse de retour avec un message.
function retourAvecMessage(chemin, type, texte) {
  const parametres = new URLSearchParams({ [type]: texte });
  return `${chemin}?${parametres.toString()}`;
}

async function clientAuthentifie() {
  const supabase = await supabaseServeur();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  return supabase;
}

function texteDeLErreur(erreur) {
  if (!erreur) return "erreur inconnue";
  return erreur.message || erreur.error_description || erreur.code || "erreur inconnue";
}

/* ------------------------------------------------------------
   Téléversement d'un fichier
   ------------------------------------------------------------
   Renvoie l'adresse publique du fichier, ou null si aucun fichier
   n'a été choisi. Le nom est nettoyé : un fichier appelé
   « Capture d'écran (2).PNG » deviendrait sinon une adresse illisible,
   voire invalide.
*/
async function televerser(supabase, fichier, espace, dossier) {
  if (!fichier || typeof fichier !== "object" || !fichier.size) return null;

  const nomNettoye = (fichier.name || "fichier")
    .toLowerCase()
    .normalize("NFD")
    // Retire les accents : « é » décomposé devient « e » + un signe
    // combinant, qu'on supprime ici (plage U+0300 à U+036F).
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9.]+/g, "-")
    .replace(/^-+|-+$/g, "");

  const chemin = `${dossier}/${Date.now()}-${nomNettoye}`;

  const { error } = await supabase.storage.from(espace).upload(chemin, fichier, {
    contentType: fichier.type || undefined,
    upsert: true,
  });

  if (error) throw error;

  const { data } = supabase.storage.from(espace).getPublicUrl(chemin);
  return data?.publicUrl || null;
}

/* ============================================================
   TEXTES
   ============================================================ */

export async function enregistrerTextes(formData) {
  const supabase = await clientAuthentifie();
  if (!supabase) redirect("/admin/connexion");

  // Le formulaire envoie un champ par clé de la table. On ne touche
  // qu'aux clés réellement présentes dans le formulaire.
  const lignes = [];
  for (const [cle, valeur] of formData.entries()) {
    if (cle.startsWith("$")) continue; // champs internes de React
    lignes.push({ cle, valeur: String(valeur), maj_le: new Date().toISOString() });
  }

  if (lignes.length === 0) {
    redirect(retourAvecMessage("/admin/textes", "erreur", "Aucun texte à enregistrer."));
  }

  const { error } = await supabase.from("textes").upsert(lignes, { onConflict: "cle" });

  if (error) {
    redirect(
      retourAvecMessage("/admin/textes", "erreur", `Enregistrement impossible : ${texteDeLErreur(error)}`)
    );
  }

  revalidatePath("/");
  redirect(retourAvecMessage("/admin/textes", "succes", "Textes enregistrés."));
}

/* ============================================================
   PROJETS
   ============================================================ */

function champsDuProjet(formData) {
  return {
    categorie: formData.get("categorie") === "academique" ? "academique" : "principal",
    ordre: Number(formData.get("ordre") || 0),
    titre: String(formData.get("titre") || "").trim(),
    origine: String(formData.get("origine") || "").trim() || null,
    statut: String(formData.get("statut") || "").trim() || null,
    statut_type: formData.get("statut_type") === "wip" ? "wip" : "live",
    description: String(formData.get("description") || "").trim() || null,
    technologies: String(formData.get("technologies") || "").trim() || null,
    emoji: String(formData.get("emoji") || "").trim() || null,
    lien_site: String(formData.get("lien_site") || "").trim() || null,
    libelle_lien_site: String(formData.get("libelle_lien_site") || "").trim() || "Voir le site",
    lien_code: String(formData.get("lien_code") || "").trim() || null,
    visible: formData.get("visible") === "on",
  };
}

export async function creerProjet(formData) {
  const supabase = await clientAuthentifie();
  if (!supabase) redirect("/admin/connexion");

  const champs = champsDuProjet(formData);

  if (!champs.titre) {
    redirect(retourAvecMessage("/admin/projets", "erreur", "Le titre est obligatoire."));
  }

  let message;
  try {
    const image = await televerser(supabase, formData.get("image"), "medias", "projets");
    if (image) champs.image_url = image;

    const { error } = await supabase.from("projets").insert(champs);
    if (error) throw error;

    message = ["succes", `Projet « ${champs.titre} » ajouté.`];
  } catch (erreur) {
    message = ["erreur", `Ajout impossible : ${texteDeLErreur(erreur)}`];
  }

  revalidatePath("/");
  redirect(retourAvecMessage("/admin/projets", message[0], message[1]));
}

export async function enregistrerProjet(formData) {
  const supabase = await clientAuthentifie();
  if (!supabase) redirect("/admin/connexion");

  const id = String(formData.get("id") || "");
  const champs = champsDuProjet(formData);

  if (!id) redirect(retourAvecMessage("/admin/projets", "erreur", "Projet introuvable."));
  if (!champs.titre) {
    redirect(retourAvecMessage("/admin/projets", "erreur", "Le titre est obligatoire."));
  }

  let message;
  try {
    const image = await televerser(supabase, formData.get("image"), "medias", "projets");
    // Pas de nouvelle image choisie : on garde celle déjà enregistrée
    // plutôt que de l'effacer.
    if (image) champs.image_url = image;

    const { error } = await supabase.from("projets").update(champs).eq("id", id);
    if (error) throw error;

    message = ["succes", `Projet « ${champs.titre} » enregistré.`];
  } catch (erreur) {
    message = ["erreur", `Enregistrement impossible : ${texteDeLErreur(erreur)}`];
  }

  revalidatePath("/");
  redirect(retourAvecMessage("/admin/projets", message[0], message[1]));
}

export async function supprimerProjet(formData) {
  const supabase = await clientAuthentifie();
  if (!supabase) redirect("/admin/connexion");

  const id = String(formData.get("id") || "");
  let message;

  try {
    const { error } = await supabase.from("projets").delete().eq("id", id);
    if (error) throw error;
    message = ["succes", "Projet supprimé."];
  } catch (erreur) {
    message = ["erreur", `Suppression impossible : ${texteDeLErreur(erreur)}`];
  }

  revalidatePath("/");
  redirect(retourAvecMessage("/admin/projets", message[0], message[1]));
}

/* ============================================================
   COMPÉTENCES
   ============================================================ */

function champsDeLaCompetence(formData) {
  return {
    ordre: Number(formData.get("ordre") || 0),
    icone: String(formData.get("icone") || "").trim() || null,
    titre: String(formData.get("titre") || "").trim(),
    description: String(formData.get("description") || "").trim() || null,
    technologies: String(formData.get("technologies") || "").trim() || null,
    visible: formData.get("visible") === "on",
  };
}

export async function creerCompetence(formData) {
  const supabase = await clientAuthentifie();
  if (!supabase) redirect("/admin/connexion");

  const champs = champsDeLaCompetence(formData);
  if (!champs.titre) {
    redirect(retourAvecMessage("/admin/competences", "erreur", "Le titre est obligatoire."));
  }

  const { error } = await supabase.from("competences").insert(champs);
  revalidatePath("/");

  redirect(
    error
      ? retourAvecMessage("/admin/competences", "erreur", `Ajout impossible : ${texteDeLErreur(error)}`)
      : retourAvecMessage("/admin/competences", "succes", `Compétence « ${champs.titre} » ajoutée.`)
  );
}

export async function enregistrerCompetence(formData) {
  const supabase = await clientAuthentifie();
  if (!supabase) redirect("/admin/connexion");

  const id = String(formData.get("id") || "");
  const champs = champsDeLaCompetence(formData);

  if (!id || !champs.titre) {
    redirect(retourAvecMessage("/admin/competences", "erreur", "Titre manquant."));
  }

  const { error } = await supabase.from("competences").update(champs).eq("id", id);
  revalidatePath("/");

  redirect(
    error
      ? retourAvecMessage("/admin/competences", "erreur", `Enregistrement impossible : ${texteDeLErreur(error)}`)
      : retourAvecMessage("/admin/competences", "succes", "Compétence enregistrée.")
  );
}

export async function supprimerCompetence(formData) {
  const supabase = await clientAuthentifie();
  if (!supabase) redirect("/admin/connexion");

  const { error } = await supabase
    .from("competences")
    .delete()
    .eq("id", String(formData.get("id") || ""));

  revalidatePath("/");

  redirect(
    error
      ? retourAvecMessage("/admin/competences", "erreur", `Suppression impossible : ${texteDeLErreur(error)}`)
      : retourAvecMessage("/admin/competences", "succes", "Compétence supprimée.")
  );
}

/* ============================================================
   PARCOURS
   ============================================================ */

function champsDeLEtape(formData) {
  return {
    ordre: Number(formData.get("ordre") || 0),
    periode: String(formData.get("periode") || "").trim() || null,
    titre: String(formData.get("titre") || "").trim(),
    organisation: String(formData.get("organisation") || "").trim() || null,
    description: String(formData.get("description") || "").trim() || null,
    visible: formData.get("visible") === "on",
  };
}

export async function creerEtape(formData) {
  const supabase = await clientAuthentifie();
  if (!supabase) redirect("/admin/connexion");

  const champs = champsDeLEtape(formData);
  if (!champs.titre) {
    redirect(retourAvecMessage("/admin/parcours", "erreur", "Le titre est obligatoire."));
  }

  const { error } = await supabase.from("parcours").insert(champs);
  revalidatePath("/");

  redirect(
    error
      ? retourAvecMessage("/admin/parcours", "erreur", `Ajout impossible : ${texteDeLErreur(error)}`)
      : retourAvecMessage("/admin/parcours", "succes", "Étape ajoutée.")
  );
}

export async function enregistrerEtape(formData) {
  const supabase = await clientAuthentifie();
  if (!supabase) redirect("/admin/connexion");

  const id = String(formData.get("id") || "");
  const champs = champsDeLEtape(formData);

  if (!id || !champs.titre) {
    redirect(retourAvecMessage("/admin/parcours", "erreur", "Titre manquant."));
  }

  const { error } = await supabase.from("parcours").update(champs).eq("id", id);
  revalidatePath("/");

  redirect(
    error
      ? retourAvecMessage("/admin/parcours", "erreur", `Enregistrement impossible : ${texteDeLErreur(error)}`)
      : retourAvecMessage("/admin/parcours", "succes", "Étape enregistrée.")
  );
}

export async function supprimerEtape(formData) {
  const supabase = await clientAuthentifie();
  if (!supabase) redirect("/admin/connexion");

  const { error } = await supabase
    .from("parcours")
    .delete()
    .eq("id", String(formData.get("id") || ""));

  revalidatePath("/");

  redirect(
    error
      ? retourAvecMessage("/admin/parcours", "erreur", `Suppression impossible : ${texteDeLErreur(error)}`)
      : retourAvecMessage("/admin/parcours", "succes", "Étape supprimée.")
  );
}

/* ============================================================
   CV
   ============================================================ */

export async function remplacerCV(formData) {
  const supabase = await clientAuthentifie();
  if (!supabase) redirect("/admin/connexion");

  const fichier = formData.get("cv");

  if (!fichier || typeof fichier !== "object" || !fichier.size) {
    redirect(retourAvecMessage("/admin/documents", "erreur", "Aucun fichier choisi."));
  }

  // Un CV, c'est un PDF. Refuser le reste évite de mettre en ligne un
  // .docx que la moitié des recruteurs ouvrira de travers.
  const estPdf =
    fichier.type === "application/pdf" || (fichier.name || "").toLowerCase().endsWith(".pdf");

  if (!estPdf) {
    redirect(
      retourAvecMessage("/admin/documents", "erreur", "Le CV doit être un fichier PDF.")
    );
  }

  let message;
  try {
    const adresse = await televerser(supabase, fichier, "documents", "cv");
    if (!adresse) throw new Error("adresse du fichier introuvable");

    const { error } = await supabase
      .from("textes")
      .upsert({ cle: "cv_url", valeur: adresse, maj_le: new Date().toISOString() }, { onConflict: "cle" });

    if (error) throw error;

    message = ["succes", "Nouveau CV en ligne. Le bouton du site pointe désormais dessus."];
  } catch (erreur) {
    message = ["erreur", `Remplacement impossible : ${texteDeLErreur(erreur)}`];
  }

  revalidatePath("/");
  redirect(retourAvecMessage("/admin/documents", message[0], message[1]));
}

/* ============================================================
   DÉCONNEXION
   ============================================================ */

export async function seDeconnecter() {
  const supabase = await supabaseServeur();
  await supabase.auth.signOut();
  redirect("/admin/connexion");
}
