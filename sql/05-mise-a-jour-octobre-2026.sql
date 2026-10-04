-- ============================================================
--  Mise à jour du contenu — octobre 2026
-- ============================================================
--  À coller dans Supabase → SQL Editor → Run.
--  Réexécutable sans danger (aucun doublon).
--
--  Ce que ça change :
--    • textes du hero, de l'À propos, des encadrés et des projets
--    • compétences : back-end enrichi, nouvelle carte « Mobile »
--    • projets : ordre AHN → Reservo → Reda Fawaz → salons de coiffure,
--      description de Reservo enrichie, nouvelle carte « salons »
--    • parcours : l'entrée « projets personnels » parle de Reservo et
--      de l'application en équipe
-- ============================================================

-- ------------------------------------------------------------
--  TEXTES (créés s'ils manquent, remplacés sinon)
-- ------------------------------------------------------------
insert into public.textes (cle, valeur) values
('hero_accroche', $tx$Basé à Abidjan, je conçois et développe des sites et applications web sur mesure, de l'interface jusqu'à la base de données et la mise en production. Une plateforme scolaire avec espaces parents et enseignants, un site vitrine haut de gamme sur son propre nom de domaine, une marketplace de réservation construite seul : je livre des produits qui tournent en ligne, pas des maquettes.$tx$),
('apropos_p1', $tx$Je suis développeur web, spécialisé en **Next.js et React**. Je prends un projet en charge de bout en bout : l'interface, la base de données, l'authentification, la sécurité et la mise en ligne. Ma méthode est simple : comprendre précisément le besoin, livrer un site rapide et soigné, puis rester disponible pour le faire évoluer.$tx$),
('apropos_p2', $tx$Au sein d'une **agence web à Abidjan**, j'ai développé seul la **plateforme d'un groupe scolaire** — inscriptions en ligne, espace parents (bulletins, absences, paiements), espace enseignant, accès cloisonnés par rôle — et construit le **panneau d'administration d'un site vitrine haut de gamme**, en ligne sur son propre nom de domaine.$tx$),
('apropos_p3', $tx$Depuis, je mène mes propres projets. **Reservo**, une marketplace de réservation de services à Abidjan que je conçois et développe seul, est déjà en ligne. Et avec une **équipe de cinq**, nous construisons une **application mobile de réservation pour les salons de coiffure d'Abidjan**, sur Android et iOS. Ce qui me motive : des produits utiles ici, pensés pour les usages locaux — FCFA, WhatsApp, quartiers — et assez solides pour tourner en production.$tx$),
('apropos_faits', $tx$Localisation|Abidjan, Côte d'Ivoire
Réalisations|3 projets en ligne
En cours|Reservo · app mobile en équipe
Stack principale|Next.js · React · PostgreSQL
Langues|Français, Anglais
Disponibilité|Ouvert aux nouveaux projets$tx$),
('competences_intro', $tx$Les technologies que j'utilise pour concevoir et mettre en ligne des sites et applications complets.$tx$),
('projets_intro', $tx$Des projets livrés en agence, Reservo que je développe seul, et une application mobile construite en équipe. Sur chaque carte, ce que j'ai fait moi-même.$tx$)
on conflict (cle) do update set valeur = excluded.valeur, maj_le = now();

-- ------------------------------------------------------------
--  COMPÉTENCES
-- ------------------------------------------------------------
update public.competences
set description  = $tx$APIs, authentification, bases de données et sécurité des accès.$tx$,
    technologies = $tx$Node.js, API REST, Supabase, PostgreSQL, Prisma, Auth.js$tx$
where titre = 'Back-end & données';

insert into public.competences (ordre, icone, titre, description, technologies, visible)
select 4, '📱', 'Mobile',
       $tx$Application Android et iOS en cours de conception avec mon équipe.$tx$,
       'Flutter, Dart', true
where not exists (select 1 from public.competences where titre = 'Mobile');

update public.competences set ordre = 5 where titre = 'Langages & conception';
update public.competences set ordre = 6 where titre = 'Réseaux & infrastructure';

-- ------------------------------------------------------------
--  PROJETS
-- ------------------------------------------------------------
update public.projets set ordre = 1 where titre = 'Institut AHN — Groupe scolaire';
update public.projets set ordre = 3 where titre = 'La Maison Reda Fawaz';

update public.projets
set ordre       = 2,
    description = $tx$Marketplace de réservation de services à Abidjan, conçue et développée seul de A à Z : voitures, logements, matériel, événementiel, cours, coworking, artisans. Recherche par quartier et par prix en FCFA, réservation par dates, par créneau ou sur devis avec protection contre les doubles réservations, contact WhatsApp pré-rempli, avis clients. Espaces client, prestataire et administrateur, avec modération des signalements.$tx$
where titre = 'Reservo — Réservation de services à Abidjan';

insert into public.projets
  (categorie, ordre, titre, origine, statut, statut_type, description,
   technologies, image_url, emoji, lien_site, libelle_lien_site, lien_code, visible)
select
  'principal', 4,
  'Application de réservation pour salons de coiffure',
  $tx$Projet d'équipe · cinq développeurs$tx$,
  'En conception', 'wip',
  $tx$Une application mobile pour trouver un salon de coiffure à Abidjan et réserver en choisissant le salon, le coiffeur et l'heure. File d'attente virtuelle, notifications, espace professionnel où les salons s'inscrivent et gèrent leurs informations, et back-office d'administration. Nous en sommes à la conception des maquettes.$tx$,
  'Flutter, Dart', null, '✂️', null, 'Voir le site', null, true
where not exists (
  select 1 from public.projets where titre = 'Application de réservation pour salons de coiffure'
);

-- ------------------------------------------------------------
--  PARCOURS
-- ------------------------------------------------------------
update public.parcours
set titre        = $tx$Développeur web — projets personnels et en équipe$tx$,
    organisation = 'Abidjan',
    description  = $tx$Reservo, marketplace de réservation en ligne, conçue et développée seul de bout en bout (Next.js, PostgreSQL, Prisma, Auth.js). En parallèle, application mobile de réservation pour salons de coiffure avec une équipe de cinq (Flutter).$tx$
where titre in ('Développement web en autonomie',
                'Développeur web — projets personnels et en équipe');
