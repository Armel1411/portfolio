import { createClient } from "@supabase/supabase-js";

/**
 * Client Supabase en lecture seule, pour les pages publiques.
 *
 * Il n'utilise aucun cookie et ne connaît aucune session : il ne peut lire
 * que ce que les règles RLS autorisent à tout le monde. C'est volontaire —
 * une page publique n'a aucune raison d'avoir plus de droits que ça.
 *
 * Renvoie null si les variables d'environnement ne sont pas encore
 * renseignées. Tout le site sait gérer ce null et retombe sur le contenu
 * de lib/contenu-defaut.js : on peut donc lancer le projet avant même
 * d'avoir configuré Supabase.
 */
export function supabasePublic() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const cle = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !cle) return null;

  return createClient(url, cle, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export function supabaseConfigure() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}
