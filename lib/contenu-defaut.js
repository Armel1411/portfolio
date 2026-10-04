/**
 * Contenu de repli.
 *
 * C'est le contenu qui s'affiche si Supabase n'est pas encore configuré,
 * s'il est injoignable, ou si une table est vide. Le site ne peut donc
 * jamais apparaître vide devant un visiteur : au pire, il affiche ceci.
 *
 * Une fois les données initiales insérées dans Supabase (sql/02-donnees-initiales.sql),
 * c'est la base qui fait foi et ce fichier ne sert plus que de filet de sécurité.
 */

export const TEXTES_DEFAUT = {
  hero_badge: "Disponible pour de nouveaux projets",
  hero_titre: "Bonjour, je suis Yves Armel —",
  hero_titre_accent: "développeur web Next.js",
  hero_accroche:
    "Basé à Abidjan, je conçois et développe des sites et applications web sur mesure, de " +
    "l'interface jusqu'à la base de données et la mise en production. Une plateforme scolaire " +
    "avec espaces parents et enseignants, un site vitrine haut de gamme sur son propre nom de " +
    "domaine, une marketplace de réservation construite seul : je livre des produits qui " +
    "tournent en ligne, pas des maquettes.",

  apropos_titre: "Un peu plus sur moi",
  apropos_p1:
    "Je suis développeur web, spécialisé en **Next.js et React**. Je prends un projet en " +
    "charge de bout en bout : l'interface, la base de données, l'authentification, la sécurité " +
    "et la mise en ligne. Ma méthode est simple : comprendre précisément le besoin, livrer un " +
    "site rapide et soigné, puis rester disponible pour le faire évoluer.",
  apropos_p2:
    "Au sein d'une **agence web à Abidjan**, j'ai développé seul la **plateforme d'un groupe " +
    "scolaire** — inscriptions en ligne, espace parents (bulletins, absences, paiements), espace " +
    "enseignant, accès cloisonnés par rôle — et construit le **panneau d'administration d'un " +
    "site vitrine haut de gamme**, en ligne sur son propre nom de domaine.",
  apropos_p3:
    "Depuis, je mène mes propres projets. **Reservo**, une marketplace de réservation de " +
    "services à Abidjan que je conçois et développe seul, est déjà en ligne. Et avec une " +
    "**équipe de cinq**, nous construisons une **application mobile de réservation pour les " +
    "salons de coiffure d'Abidjan**, sur Android et iOS. Ce qui me motive : des produits utiles " +
    "ici, pensés pour les usages locaux — FCFA, WhatsApp, quartiers — et assez solides pour " +
    "tourner en production.",

  // Une ligne par encadré, au format  Intitulé|Valeur
  apropos_faits:
    "Localisation|Abidjan, Côte d'Ivoire\n" +
    "Réalisations|3 projets en ligne\n" +
    "En cours|Reservo · app mobile en équipe\n" +
    "Stack principale|Next.js · React · PostgreSQL\n" +
    "Langues|Français, Anglais\n" +
    "Disponibilité|Ouvert aux nouveaux projets",

  competences_titre: "Ce que je maîtrise",
  competences_intro:
    "Les technologies que j'utilise pour concevoir et mettre en ligne des sites et " +
    "applications complets.",

  projets_titre: "Réalisations sélectionnées",
  projets_intro:
    "Des projets livrés en agence, Reservo que je développe seul, et une application mobile " +
    "construite en équipe. Sur chaque carte, ce que j'ai fait moi-même.",
  projets_academiques_titre: "Projets académiques",
  projets_academiques_intro:
    "Menés dans le cadre de ma formation en Génie Informatique, de l'analyse des besoins au développement.",

  parcours_titre: "Expérience & formation",

  contact_titre: "Travaillons ensemble",
  contact_texte:
    "Un site à créer, un projet à reprendre, une collaboration à discuter ? " +
    "Écrivez-moi, je réponds sous 24 h.",

  email: "yvesarmel051@gmail.com",
  github: "https://github.com/Armel1411",
  // Le numéro est découpé en trois : il n'apparaît jamais entier dans le HTML livré,
  // il est recomposé par le navigateur. Voir components/ContactTelephone.js
  tel_indicatif: "225",
  tel_partie1: "0103",
  tel_partie2: "581665",

  cv_url: "/cv-yves-armel.pdf",
};

export const COMPETENCES_DEFAUT = [
  {
    id: "c1",
    ordre: 1,
    icone: "🎨",
    titre: "Front-end",
    description: "Interfaces modernes, responsives et rapides à charger.",
    technologies: "Next.js, React, Tailwind CSS, JavaScript, HTML / CSS",
  },
  {
    id: "c2",
    ordre: 2,
    icone: "⚙️",
    titre: "Back-end & données",
    description: "APIs, authentification, bases de données et sécurité des accès.",
    technologies: "Node.js, API REST, Supabase, PostgreSQL, Prisma, Auth.js",
  },
  {
    id: "c3",
    ordre: 3,
    icone: "🚀",
    titre: "Mise en ligne",
    description: "Du dépôt Git au site en production, nom de domaine inclus.",
    technologies: "Git & GitHub, Vercel, Nom de domaine, SEO de base",
  },
  {
    id: "c6",
    ordre: 4,
    icone: "📱",
    titre: "Mobile",
    description: "Application Android et iOS en cours de conception avec mon équipe.",
    technologies: "Flutter, Dart",
  },
  {
    id: "c4",
    ordre: 5,
    icone: "🧩",
    titre: "Langages & conception",
    description: "Analyse des besoins, modélisation et algorithmique.",
    technologies: "Modélisation BDD, Python, Langage C, PHP",
  },
  {
    id: "c5",
    ordre: 6,
    icone: "🌐",
    titre: "Réseaux & infrastructure",
    description:
      "Bases acquises en Génie Informatique — utile pour comprendre ce qui se passe sous le déploiement.",
    technologies: "Adressage IP, Routage, Cisco Packet Tracer",
  },
];

export const PROJETS_DEFAUT = [
  {
    id: "p1",
    ordre: 1,
    categorie: "principal",
    titre: "Institut AHN — Groupe scolaire",
    origine: "Développé seul · au sein d'une agence web à Abidjan",
    statut: "Démo en ligne",
    statut_type: "wip",
    description:
      "Plateforme complète pour une école maternelle et primaire d'Abidjan, conçue et développée " +
      "de A à Z : présentation des cycles, inscriptions en ligne, newsletters, espace parents " +
      "(bulletins, moyennes, absences, paiements) et espace enseignant (saisie des notes, " +
      "bulletins mensuels). Authentification et base de données avec accès cloisonnés par rôle, " +
      "en-têtes de sécurité HTTP.",
    technologies: "Next.js, Tailwind CSS, Supabase, Auth & RLS",
    image_url: "/images/institut-ahn.jpg",
    emoji: "🎓",
    lien_site: "https://ecole-web.vercel.app/",
    libelle_lien_site: "Voir la démo",
    lien_code: null,
    visible: true,
  },
  {
    id: "p2",
    ordre: 3,
    categorie: "principal",
    titre: "La Maison Reda Fawaz",
    origine: "Travail en binôme · au sein d'une agence web à Abidjan",
    statut: "En ligne",
    statut_type: "live",
    description:
      "Site vitrine haut de gamme pour un styliste et designer événementiel, en ligne sur son " +
      "propre nom de domaine. Ma contribution : le panneau d'administration complet (connexion, " +
      "upload et gestion des photos, affichage côté public), le filtre du portfolio par catégorie, " +
      "le système de moodboard et l'intégration WhatsApp sécurisée.",
    technologies: "Next.js, TypeScript, Tailwind CSS, Vercel Blob",
    image_url: "/images/reda-fawaz.jpg",
    emoji: "👗",
    lien_site: "https://www.lamaisonredafawaz.com",
    libelle_lien_site: "Voir le site",
    lien_code: null,
    visible: true,
  },
  {
    id: "p3",
    ordre: 2,
    categorie: "principal",
    titre: "Reservo — Réservation de services à Abidjan",
    origine: "Projet personnel · conçu et développé seul",
    statut: "En ligne · en développement",
    statut_type: "wip",
    description:
      "Marketplace de réservation de services à Abidjan, conçue et développée seul de A à Z : " +
      "voitures, logements, matériel, événementiel, cours, coworking, artisans. Recherche par " +
      "quartier et par prix en FCFA, réservation par dates, par créneau ou sur devis avec " +
      "protection contre les doubles réservations, contact WhatsApp pré-rempli, avis clients. " +
      "Espaces client, prestataire et administrateur, avec modération des signalements.",
    technologies: "Next.js, PostgreSQL, Prisma, Auth.js, Tailwind CSS",
    image_url: "/images/reservo.jpg",
    emoji: "🗓️",
    lien_site: "https://reservo-two.vercel.app/",
    libelle_lien_site: "Voir le site",
    lien_code: null,
    visible: true,
  },
  {
    id: "p4",
    ordre: 4,
    categorie: "principal",
    titre: "Application de réservation pour salons de coiffure",
    origine: "Projet d'équipe · cinq développeurs",
    statut: "En conception",
    statut_type: "wip",
    description:
      "Une application mobile pour trouver un salon de coiffure à Abidjan et réserver en " +
      "choisissant le salon, le coiffeur et l'heure. File d'attente virtuelle, notifications, " +
      "espace professionnel où les salons s'inscrivent et gèrent leurs informations, et " +
      "back-office d'administration. Nous en sommes à la conception des maquettes.",
    technologies: "Flutter, Dart",
    image_url: null,
    emoji: "✂️",
    lien_site: null,
    libelle_lien_site: "Voir le site",
    lien_code: null,
    visible: true,
  },
  {
    id: "a1",
    ordre: 1,
    categorie: "academique",
    titre: "Application de mise en relation ouvriers–clients",
    description:
      "Analyse des besoins utilisateurs et modélisation de l'application, puis développement " +
      "d'une interface fluide pour l'échange en temps réel entre prestataires et clients.",
    visible: true,
  },
  {
    id: "a2",
    ordre: 2,
    categorie: "academique",
    titre: "Plateforme immobilière — résidences meublées",
    description:
      "Site de mise en relation directe entre propriétaires et locataires, avec recherche " +
      "filtrée et fiches de présentation des logements disponibles.",
    visible: true,
  },
  {
    id: "a3",
    ordre: 3,
    categorie: "academique",
    titre: "Gestion de bulletins scolaires",
    description:
      "Automatisation du calcul des moyennes, centralisation des données de l'établissement " +
      "et édition automatisée des bulletins de notes.",
    visible: true,
  },
];

export const PARCOURS_DEFAUT = [
  {
    id: "e1",
    ordre: 1,
    periode: "Juillet — Août 2026",
    titre: "Développeur web",
    organisation: "Agence web · Abidjan",
    description:
      "Deux projets menés en conditions réelles et mis en production : une plateforme scolaire " +
      "complète développée seul (espaces parents et enseignants, authentification, base de " +
      "données), et le back-office d'un site vitrine haut de gamme livré sur son propre nom de " +
      "domaine. Développement front et back, modélisation des données, déploiement.",
  },
  {
    id: "e2",
    ordre: 2,
    periode: "2025 — Aujourd'hui",
    titre: "Développeur web — projets personnels et en équipe",
    organisation: "Abidjan",
    description:
      "Reservo, marketplace de réservation en ligne, conçue et développée seul de bout en bout " +
      "(Next.js, PostgreSQL, Prisma, Auth.js). En parallèle, application mobile de réservation " +
      "pour salons de coiffure avec une équipe de cinq (Flutter).",
  },
  {
    id: "e3",
    ordre: 3,
    periode: "2024 — Aujourd'hui",
    titre: "Licence en Génie Informatique",
    organisation: "IUA — Institut Universitaire d'Abidjan",
    description:
      "Formation couvrant le développement logiciel, les bases de données et les réseaux. " +
      "Je me suis orienté vers le développement web, que j'approfondis en parallèle à travers " +
      "mes propres projets. Actuellement en Licence 3.",
  },
  {
    id: "e4",
    ordre: 4,
    periode: "2023 — 2024",
    titre: "Baccalauréat série D",
    organisation: "Lycée Simone Ehivet Gbagbo · Abidjan",
    description: "Série scientifique, orientation mathématiques et sciences de la vie.",
  },
];
