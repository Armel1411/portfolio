import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";

/* =====================================================================
   Garde d'accès et politique de sécurité du contenu
   =====================================================================
   Ce fichier s'appelait « middleware.js » jusqu'à Next.js 15. Next 16 a
   renommé la convention en « proxy », et la fonction exportée doit
   s'appeler proxy().

   Il s'exécute avant chaque page et fait deux choses :

     1. POSER LA POLITIQUE DE CONTENU (CSP) sur toutes les pages.
        C'est l'en-tête qui dit au navigateur quels scripts il a le droit
        d'exécuter. Sans elle, un script glissé dans la page — par une
        faille, une dépendance compromise, une extension — s'exécute sans
        rien demander. Avec elle, seul ce qui porte le jeton à usage
        unique généré ci-dessous tourne.

     2. PROTÉGER /admin : session valide exigée, et second facteur exigé
        si un second facteur est activé sur le compte.
   ===================================================================== */

export async function proxy(request) {
  const { pathname } = request.nextUrl;

  // ------------------------------------------------------------------
  //  Jeton à usage unique (nonce)
  // ------------------------------------------------------------------
  //  Un nombre imprévisible, régénéré à chaque chargement de page. Les
  //  scripts légitimes le portent ; un script injecté ne peut pas le
  //  deviner, donc le navigateur refuse de l'exécuter.
  const nonce = crypto.randomUUID().replace(/-/g, "");

  const politiqueContenu = [
    `default-src 'self'`,
    // 'strict-dynamic' : les scripts chargés PAR un script autorisé le
    // sont aussi. Les navigateurs anciens ignorent cette directive et
    // retombent sur 'unsafe-inline' + https:, ce qui reste mieux que rien.
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic' 'unsafe-inline' https:`,
    // Les styles en ligne sont inévitables : Next.js en injecte, et
    // Google Fonts sert une feuille distante.
    `style-src 'self' 'unsafe-inline' https://fonts.googleapis.com`,
    `font-src 'self' https://fonts.gstatic.com data:`,
    // data: pour les QR codes de la double authentification,
    // *.supabase.co pour les captures et le CV téléversés.
    `img-src 'self' data: blob: https://*.supabase.co`,
    `connect-src 'self' https://*.supabase.co wss://*.supabase.co`,
    // Interdit d'afficher le site dans un cadre sur un autre site : c'est
    // ce qui empêche de superposer des boutons invisibles au-dessus de
    // ton admin pour te faire cliquer à ton insu.
    `frame-ancestors 'none'`,
    `frame-src 'none'`,
    `object-src 'none'`,
    `base-uri 'self'`,
    // Un formulaire de cette page ne peut envoyer ses données qu'ici.
    `form-action 'self'`,
    `upgrade-insecure-requests`,
  ].join("; ");

  // Next.js lit le nonce dans l'en-tête de la REQUÊTE pour l'apposer sur
  // ses propres scripts. Il faut donc le transmettre des deux côtés.
  const enTetesRequete = new Headers(request.headers);
  enTetesRequete.set("x-nonce", nonce);
  enTetesRequete.set("Content-Security-Policy", politiqueContenu);

  function reponseDeBase() {
    const reponse = NextResponse.next({ request: { headers: enTetesRequete } });
    reponse.headers.set("Content-Security-Policy", politiqueContenu);
    return reponse;
  }

  function versLaConnexion(motif) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin/connexion";
    url.search = motif ? `?raison=${motif}` : "";
    const reponse = NextResponse.redirect(url);
    reponse.headers.set("Content-Security-Policy", politiqueContenu);
    return reponse;
  }

  // ------------------------------------------------------------------
  //  Pages publiques : la CSP suffit, on ne va pas plus loin.
  // ------------------------------------------------------------------
  const zoneProtegee = pathname.startsWith("/admin") && pathname !== "/admin/connexion";
  if (!zoneProtegee) return reponseDeBase();

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return versLaConnexion("configuration");
  }

  try {
    let reponse = reponseDeBase();

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
            reponse = reponseDeBase();
            for (const { name, value, options } of cookiesAPoser) {
              reponse.cookies.set(name, value, options);
            }
          },
        },
      }
    );

    // getUser() fait vérifier le jeton par Supabase à chaque appel, au
    // lieu de faire confiance au contenu du cookie. Un cookie fabriqué à
    // la main ne passe pas.
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return versLaConnexion();

    // ----------------------------------------------------------------
    //  Second facteur
    // ----------------------------------------------------------------
    //  nextLevel vaut 'aal2' dès qu'un second facteur est activé sur le
    //  compte. Si le niveau courant n'y est pas, c'est que la connexion
    //  s'est arrêtée au mot de passe : on renvoie la finir.
    //
    //  En cas d'erreur de cette vérification, on LAISSE PASSER : la
    //  session a déjà été validée juste au-dessus, et il vaut mieux un
    //  contrôle secondaire manqué qu'un administrateur enfermé dehors
    //  par un incident réseau.
    try {
      const { data: niveau } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
      if (niveau?.nextLevel === "aal2" && niveau.nextLevel !== niveau.currentLevel) {
        return versLaConnexion("second-facteur");
      }
    } catch (erreurNiveau) {
      console.error("Vérification du second facteur impossible :", erreurNiveau?.message);
    }

    return reponse;
  } catch (erreur) {
    console.error("Vérification d'accès à l'admin impossible :", erreur?.message || erreur);
    return versLaConnexion();
  }
}

export const config = {
  // Toutes les pages, sauf les fichiers servis tels quels : leur appliquer
  // une CSP n'a pas de sens et coûterait un passage inutile.
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|icon.png|apple-icon.png|images/|.*\\.(?:png|jpg|jpeg|gif|webp|svg|ico|pdf|txt|xml)$).*)",
  ],
};
