/** @type {import('next').NextConfig} */

// =====================================================================
// En-têtes de sécurité
// =====================================================================
// Même principe que sur Institut AHN. Ici il n'y a pas de données de
// familles à protéger, mais il y a un espace d'administration : ces
// en-têtes ferment des portes que le navigateur laisse ouvertes par
// défaut, et empêchent notamment qu'un autre site affiche ton admin
// dans un cadre invisible pour te faire cliquer à ton insu.
//
// Aucun effet visible pour un visiteur.
// =====================================================================

const enTetesSecurite = [
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
];

const nextConfig = {
  // Masque la version de Next.js dans les réponses HTTP.
  poweredByHeader: false,

  async headers() {
    return [{ source: "/:path*", headers: enTetesSecurite }];
  },
};

export default nextConfig;
