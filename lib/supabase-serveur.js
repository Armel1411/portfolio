import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Client Supabase côté serveur, conscient de la session.
 *
 * C'est lui qu'utilisent les pages de l'admin et les actions serveur.
 * Il lit les cookies de session déposés à la connexion : les écritures
 * en base se font donc au nom du compte connecté, et les règles RLS
 * s'appliquent normalement.
 *
 * Différence importante avec le panneau admin de Reda Fawaz : là-bas, le
 * cookie de session contenait le mot de passe administrateur en clair, et
 * le contrôle d'accès consistait à comparer ce cookie au mot de passe.
 * Quiconque lisait ce cookie obtenait le mot de passe. Ici, le cookie
 * contient un jeton signé par Supabase, à durée de vie limitée, qui ne
 * révèle rien et se révoque.
 */
export async function supabaseServeur() {
  const magasinDeCookies = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return magasinDeCookies.getAll();
        },
        setAll(cookiesAPoser) {
          try {
            for (const { name, value, options } of cookiesAPoser) {
              magasinDeCookies.set(name, value, options);
            }
          } catch {
            // Next.js interdit d'écrire un cookie depuis un composant
            // serveur qui ne fait que rendre du HTML. Ce n'est pas un
            // problème : le rafraîchissement du cookie de session est
            // assuré par proxy.js, qui s'exécute avant chaque page.
          }
        },
      },
    }
  );
}

/**
 * Renvoie le compte connecté, ou null.
 *
 * getUser() vérifie le jeton auprès de Supabase à chaque appel, au lieu
 * de faire confiance au contenu du cookie. C'est plus lent d'un aller-
 * retour, et c'est le prix à payer pour ne pas se faire berner par un
 * cookie fabriqué à la main.
 */
export async function compteConnecte() {
  try {
    const supabase = await supabaseServeur();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    return user || null;
  } catch {
    return null;
  }
}
