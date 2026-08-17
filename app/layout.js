import "./globals.css";
import { headers } from "next/headers";

/* ============================================================
   Métadonnées du site
   ============================================================
   Dans Next.js, les balises <title>, <meta> et Open Graph ne s'écrivent
   plus à la main dans le <head> : on exporte un objet "metadata" et Next
   génère les balises. C'est la différence principale avec l'ancien
   index.html.

   ⚠️ metadataBase doit contenir l'adresse réelle du site : c'est elle qui
   transforme "/images/og-image.png" en adresse absolue, seule forme que
   WhatsApp, LinkedIn et X acceptent pour l'aperçu. Si tu prends un nom de
   domaine propre, c'est la ligne à changer.
   ============================================================ */

const ADRESSE_DU_SITE = "https://yvesarmel.vercel.app";

export const metadata = {
  metadataBase: new URL(ADRESSE_DU_SITE),
  title: "Yves Armel — Développeur web Next.js & React | Abidjan",
  description:
    "Développeur web à Abidjan. Je conçois et développe des sites et applications avec " +
    "Next.js et React, du design à la mise en production. Deux projets en ligne.",
  authors: [{ name: "M'BANDAN Yves Armel" }],
  alternates: { canonical: "/" },
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    locale: "fr_FR",
    url: "/",
    siteName: "Yves Armel — Développeur web",
    title: "Yves Armel — Développeur web Next.js & React",
    description:
      "Sites et applications web sur mesure avec Next.js et React. Deux projets livrés " +
      "en production. Basé à Abidjan, Côte d'Ivoire.",
    images: [
      {
        url: "/images/og-image.png",
        width: 1200,
        height: 630,
        alt: "Yves Armel — Développeur web Next.js et React, Abidjan",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Yves Armel — Développeur web Next.js & React",
    description:
      "Sites et applications web sur mesure avec Next.js et React. Deux projets livrés en production.",
    images: ["/images/og-image.png"],
  },
};

export const viewport = {
  themeColor: "#0a0a0f",
};

// Données structurées : c'est ce qui permet à Google de comprendre que
// cette page décrit une personne, son métier et ses compétences, plutôt
// qu'un texte quelconque.
const DONNEES_STRUCTUREES = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "M'BANDAN Yves Armel",
  alternateName: "Yves Armel",
  jobTitle: "Développeur web",
  url: ADRESSE_DU_SITE,
  email: "mailto:yvesarmel051@gmail.com",
  address: {
    "@type": "PostalAddress",
    addressLocality: "Abidjan",
    addressCountry: "CI",
  },
  sameAs: ["https://github.com/Armel1411"],
  knowsAbout: ["Next.js", "React", "Tailwind CSS", "JavaScript", "Node.js", "Supabase", "SEO"],
  knowsLanguage: ["fr", "en"],
};

export default async function RootLayout({ children }) {
  // Le jeton à usage unique est fabriqué par proxy.js et transmis ici.
  // Sans lui, le bloc de données structurées ci-dessous serait bloqué
  // par notre propre politique de sécurité.
  const nonce = (await headers()).get("x-nonce") || undefined;

  return (
    <html lang="fr">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
        <script
          type="application/ld+json"
          nonce={nonce}
          dangerouslySetInnerHTML={{ __html: JSON.stringify(DONNEES_STRUCTUREES) }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
