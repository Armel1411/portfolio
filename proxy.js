import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";

/* =====================================================================
   Garde d'accès à l'espace d'administration
   =====================================================================
   Ce fichier s'appelait « middleware.js » jusqu'à Next.js 15. Next 16 a
   renommé la convention en « proxy », et la fonction exportée doit
   s'appeler proxy() — c'est la même mécanique que sur Institut AHN.

   Il s'exécute AVANT chaque page de /admin. Deux rôles :

     1. rafraîchir le cookie de session, pour ne pas être déconnecté au
        bout d'une heure en pleine saisie ;
     2. renvoyer vers la page de connexion quiconque n'est pas connecté.

   Le contrôle est fait ici, donc avant même que la page ne commence à
   être rendue : une page d'admin ne peut pas « fuiter » son contenu le
   temps d'une redirection côté navigateur.
   ===================================================================== */

export async function proxy(request) {
  const { pathname } = request.nextUrl;

  // La page de connexion doit rester accessible, sinon plus personne
  // ne peut se connecter.
  if (pathname === "/admin/connexion") {
    return NextResponse.next();
  }

  function versLaConnexion() {
    const url = request.nextUrl.clone();
    url.pathname = "/admin/connexion";
    return NextResponse.redirect(url);
  }

  // Supabase pas encore configuré : inutile de tenter une vérification,
  // on renvoie vers la connexion qui affichera un message clair.
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return versLaConnexion();
  }

  try {
    let response = NextResponse.next({ request });

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesAPoser) {
            for (const { name, value } of cookiesAPoser) {
              request.cookies.set(name, value);
            }
            response = NextResponse.next({ request });
            for (const { name, value, options } of cookiesAPoser) {
              response.cookies.set(name, value, options);
            }
          },
        },
      }
    );

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return versLaConnexion();

    return response;
  } catch (erreur) {
    // Supabase injoignable, cookie corrompu, jeton illisible : on ferme
    // la porte plutôt que de laisser passer par défaut.
    console.error("Vérification d'accès à l'admin impossible :", erreur?.message || erreur);
    return versLaConnexion();
  }
}

export const config = {
  matcher: ["/admin/:path*"],
};
