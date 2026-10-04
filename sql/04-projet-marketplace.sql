-- ============================================================
--  Projet « Reservo » (la marketplace de réservation)
-- ============================================================
--  À coller dans Supabase → SQL Editor → Run.
--  Réexécutable :
--    - si une ancienne version de la carte existe (« Plateforme de
--      réservation multi-services »), elle est mise à jour ;
--    - sinon la carte est créée ;
--    - jamais de doublon.
--
--  Pas encore d'image : la carte affiche un aperçu « code » en attendant
--  la capture de la page d'accueil (à ajouter depuis /admin → Projets).
-- ============================================================

-- 1. Mise à jour de l'ancienne carte, si elle existe.
update public.projets
set titre             = 'Reservo — Réservation de services à Abidjan',
    origine           = 'Projet personnel · conçu et développé seul',
    statut            = 'En ligne · en développement',
    statut_type       = 'wip',
    description       = 'Une marketplace où des prestataires publient leurs offres et où les clients réservent '
                     || 'en quelques clics : location de voitures, de logements et de matériel, événementiel, '
                     || 'cours particuliers, coworking, services à domicile et artisans. Recherche par catégorie '
                     || 'et par quartier, prix en FCFA, avis après réservation, contact via WhatsApp. Trois rôles '
                     || '— client, prestataire, administrateur — et une architecture générique : une seule table '
                     || 'd''annonces avec des détails propres à chaque catégorie.',
    technologies      = 'Next.js, PostgreSQL, Prisma, Auth.js, Tailwind CSS',
    image_url         = null,
    emoji             = '🗓️',
    lien_site         = 'https://reservo-two.vercel.app/',
    libelle_lien_site = 'Voir le site',
    visible           = true
where titre in ('Plateforme de réservation multi-services',
                'Reservo — Réservation de services à Abidjan');

-- 2. Création, si aucune des deux versions n'existe.
insert into public.projets
  (categorie, ordre, titre, origine, statut, statut_type, description,
   technologies, image_url, emoji, lien_site, libelle_lien_site, lien_code, visible)
select
  'principal',
  3,
  'Reservo — Réservation de services à Abidjan',
  'Projet personnel · conçu et développé seul',
  'En ligne · en développement',
  'wip',
  'Une marketplace où des prestataires publient leurs offres et où les clients réservent '
  || 'en quelques clics : location de voitures, de logements et de matériel, événementiel, '
  || 'cours particuliers, coworking, services à domicile et artisans. Recherche par catégorie '
  || 'et par quartier, prix en FCFA, avis après réservation, contact via WhatsApp. Trois rôles '
  || '— client, prestataire, administrateur — et une architecture générique : une seule table '
  || 'd''annonces avec des détails propres à chaque catégorie.',
  'Next.js, PostgreSQL, Prisma, Auth.js, Tailwind CSS',
  null,
  '🗓️',
  'https://reservo-two.vercel.app/',
  'Voir le site',
  null,
  true
where not exists (
  select 1 from public.projets
  where titre in ('Plateforme de réservation multi-services',
                  'Reservo — Réservation de services à Abidjan')
);

-- 3. L'introduction de la section ne parlait que des deux projets d'agence.
update public.textes
set valeur = 'Deux projets livrés en production au sein d''une agence web à Abidjan, et mes '
          || 'projets personnels en cours. Sur chaque carte, ce que j''ai développé moi-même.',
    maj_le = now()
where cle = 'projets_intro';
