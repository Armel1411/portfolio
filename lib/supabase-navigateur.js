import { createBrowserClient } from "@supabase/ssr";

/**
 * Client Supabase côté navigateur.
 *
 * Utilisé uniquement par le formulaire de connexion : c'est lui qui
 * échange ton email et ton mot de passe contre une session, et dépose
 * les cookies correspondants. Tout le reste de l'admin passe par le
 * serveur (voir lib/supabase-serveur.js).
 */
export function supabaseNavigateur() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}
