-- ============================================================
--  Ajout du projet « Plateforme de réservation multi-services »
-- ============================================================
--  À coller dans Supabase → SQL Editor → Run.
--  Réexécutable : si le projet existe déjà (même titre), rien n'est
--  ajouté en double.
--
--  Tu peux aussi l'ajouter à la main depuis /admin → Projets → Nouveau ;
--  ce script fait exactement la même chose.
-- ============================================================

insert into public.projets
  (categorie, ordre, titre, origine, statut, statut_type, description,
   technologies, image_url, emoji, lien_site, libelle_lien_site, lien_code, visible)
select
  'principal',
  3,
  'Plateforme de réservation multi-services',
  'Projet personnel · conçu et développé seul',
  'En développement',
  'wip',
  'Une marketplace où des prestataires publient leurs offres et où les clients réservent un '
  || 'créneau : location de voitures, de logements et de matériel, événementiel, cours '
  || 'particuliers, coworking, services à domicile et artisans. Architecture générique — une '
  || 'seule table d''annonces avec des détails propres à chaque catégorie, une table de '
  || 'réservations commune — et trois rôles : client, prestataire et administrateur.',
  'Next.js, PostgreSQL, Prisma, Auth.js',
  null,
  '🗓️',
  null,
  'Voir le site',
  null,
  true
where not exists (
  select 1 from public.projets where titre = 'Plateforme de réservation multi-services'
);

-- L'introduction de la section ne parlait que des deux projets d'agence.
update public.textes
set valeur = 'Deux projets livrés en production au sein d''une agence web à Abidjan, et mes '
          || 'projets personnels en cours. Sur chaque carte, ce que j''ai développé moi-même.',
    maj_le = now()
where cle = 'projets_intro';
