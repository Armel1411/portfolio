"use server";

import { createClient } from "@supabase/supabase-js";

/**
 * Journal des tentatives de connexion.
 *
 * Appelé aussi bien quand la connexion réussit que quand elle échoue —
 * c'est justement l'échec qui renseigne : trois refus à trois heures du
 * matin sur un email qui n'est pas le tien, ça se voit.
 *
 * Le client est créé sans session : l'écriture doit fonctionner pour
 * quelqu'un qui n'est PAS connecté, sinon les tentatives ratées ne
 * laisseraient aucune trace. La lecture du journal, elle, est réservée à
 * l'administrateur par les règles RLS.
 *
 * Toute erreur est avalée : un journal en panne ne doit jamais empêcher
 * quelqu'un de se connecter à son propre site.
 */
export async function journaliserConnexion({ email, reussie, motif }) {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const cle = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !cle) return;

    const supabase = createClient(url, cle, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    await supabase.from("connexions").insert({
      email: String(email || "").slice(0, 120),
      reussie: Boolean(reussie),
      motif: motif ? String(motif).slice(0, 200) : null,
    });
  } catch (erreur) {
    console.error("Journalisation impossible :", erreur?.message || erreur);
  }
}
