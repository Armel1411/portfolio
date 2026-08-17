-- ============================================================
--  PORTFOLIO — CONTENU INITIAL
-- ============================================================
--  À exécuter APRÈS 01-tables.sql, dans le SQL Editor de Supabase.
--
--  Ce script recopie en base le contenu actuel du site. À partir de là,
--  c'est la base qui fait foi : tout se modifie depuis /admin, sans
--  toucher au code.
--
--  Il est réexécutable sans danger :
--    • les textes existants ne sont pas écrasés (on conflict do nothing)
--    • les projets, compétences et parcours ne sont insérés que si la
--      table est vide — donc relancer ce fichier après avoir modifié tes
--      projets ne les remplacera pas par l'ancienne version.
--
--  Les textes sont encadrés par $tx$ ... $tx$ plutôt que par des
--  apostrophes : le français en est truffé (l'interface, d'Abidjan,
--  n'importe qui) et chaque apostrophe devrait sinon être doublée.
-- ============================================================

-- ------------------------------------------------------------
--  TEXTES
-- ------------------------------------------------------------
insert into public.textes (cle, valeur) values

('hero_badge', $tx$Disponible pour de nouveaux projets$tx$),
('hero_titre', $tx$Bonjour, je suis Yves Armel —$tx$),
('hero_titre_accent', $tx$développeur web Next.js$tx$),
('hero_accroche', $tx$Basé à Abidjan, je conçois et développe des sites et applications web sur mesure : du design de l'interface jusqu'à la base de données et la mise en production. Une plateforme scolaire complète avec espaces parents et enseignants, un site vitrine haut de gamme en ligne sur son propre nom de domaine — je livre des produits en production, pas des maquettes.$tx$),

('apropos_titre', $tx$Un peu plus sur moi$tx$),
('apropos_p1', $tx$Je travaille principalement avec **Next.js et React**, du front-end jusqu'à la base de données. Mon approche est simple : comprendre précisément le besoin, livrer un site rapide et bien fini, puis rester disponible pour le faire évoluer.$tx$),
('apropos_p2', $tx$Mon projet le plus complet est une **plateforme pour un groupe scolaire** d'Abidjan, que j'ai développée seul de bout en bout : inscriptions en ligne, espace parents (bulletins, absences, paiements), espace enseignant, authentification et base de données. J'ai aussi construit le **back-office d'un site vitrine haut de gamme** mis en ligne sur son propre nom de domaine.$tx$),
('apropos_p3', $tx$Ces deux projets ont été **réalisés au sein d'une agence web à Abidjan**. Je développe désormais mes propres projets, dont je détiens le code de bout en bout — les prochaines réalisations arriveront ici.$tx$),
('apropos_faits', $tx$Localisation|Abidjan, Côte d'Ivoire
Réalisations|2 projets en production
Stack principale|Next.js · React · Tailwind
Langues|Français, Anglais
Disponibilité|Ouvert aux nouveaux projets$tx$),

('competences_titre', $tx$Ce que je maîtrise$tx$),
('competences_intro', $tx$Les technologies que j'utilise pour concevoir et mettre en ligne des sites complets.$tx$),

('projets_titre', $tx$Réalisations sélectionnées$tx$),
('projets_intro', $tx$Deux projets livrés en production, du design de l'interface jusqu'à la mise en ligne, au sein d'une agence web à Abidjan. Sur chaque carte, ce que j'ai développé moi-même.$tx$),
('projets_academiques_titre', $tx$Projets académiques$tx$),
('projets_academiques_intro', $tx$Menés dans le cadre de ma formation en Génie Informatique, de l'analyse des besoins au développement.$tx$),

('parcours_titre', $tx$Expérience & formation$tx$),

('contact_titre', $tx$Travaillons ensemble$tx$),
('contact_texte', $tx$Un site à créer, un projet à reprendre, une collaboration à discuter ? Écrivez-moi, je réponds sous 24 h.$tx$),

('email', $tx$yvesarmel051@gmail.com$tx$),
('github', $tx$https://github.com/Armel1411$tx$),

-- Numéro découpé en trois : il n'est jamais écrit en entier dans le HTML
-- envoyé au navigateur. Voir components/ContactTelephone.js
('tel_indicatif', $tx$225$tx$),
('tel_partie1', $tx$0103$tx$),
('tel_partie2', $tx$581665$tx$),

-- Adresse du CV. Elle sera remplacée automatiquement par l'admin
-- lorsque tu téléverseras une nouvelle version.
('cv_url', $tx$/cv-yves-armel.pdf$tx$)

on conflict (cle) do nothing;

-- ------------------------------------------------------------
--  PROJETS
-- ------------------------------------------------------------
do $body$
begin
  if not exists (select 1 from public.projets) then

    insert into public.projets
      (categorie, ordre, titre, origine, statut, statut_type, description,
       technologies, image_url, emoji, lien_site, libelle_lien_site, visible)
    values
      ('principal', 1,
       $tx$Institut AHN — Groupe scolaire$tx$,
       $tx$Développé seul · au sein d'une agence web à Abidjan$tx$,
       $tx$Démo en ligne$tx$, 'wip',
       $tx$Plateforme complète pour une école maternelle et primaire d'Abidjan, conçue et développée de A à Z : présentation des cycles, inscriptions en ligne, newsletters, espace parents (bulletins, moyennes, absences, paiements) et espace enseignant (saisie des notes, bulletins mensuels). Authentification et base de données avec accès cloisonnés par rôle, en-têtes de sécurité HTTP.$tx$,
       $tx$Next.js, Tailwind CSS, Supabase, Auth & RLS$tx$,
       $tx$/images/institut-ahn.jpg$tx$, $tx$🎓$tx$,
       $tx$https://ecole-web.vercel.app/$tx$, $tx$Voir la démo$tx$, true),

      ('principal', 2,
       $tx$La Maison Reda Fawaz$tx$,
       $tx$Travail en binôme · au sein d'une agence web à Abidjan$tx$,
       $tx$En ligne$tx$, 'live',
       $tx$Site vitrine haut de gamme pour un styliste et designer événementiel, en ligne sur son propre nom de domaine. Ma contribution : le panneau d'administration complet (connexion, upload et gestion des photos, affichage côté public), le filtre du portfolio par catégorie, le système de moodboard et l'intégration WhatsApp sécurisée.$tx$,
       $tx$Next.js, TypeScript, Tailwind CSS, Vercel Blob$tx$,
       $tx$/images/reda-fawaz.jpg$tx$, $tx$👗$tx$,
       $tx$https://www.lamaisonredafawaz.com$tx$, $tx$Voir le site$tx$, true);

    insert into public.projets (categorie, ordre, titre, description, visible)
    values
      ('academique', 1,
       $tx$Application de mise en relation ouvriers–clients$tx$,
       $tx$Analyse des besoins utilisateurs et modélisation de l'application, puis développement d'une interface fluide pour l'échange en temps réel entre prestataires et clients.$tx$, true),

      ('academique', 2,
       $tx$Plateforme immobilière — résidences meublées$tx$,
       $tx$Site de mise en relation directe entre propriétaires et locataires, avec recherche filtrée et fiches de présentation des logements disponibles.$tx$, true),

      ('academique', 3,
       $tx$Gestion de bulletins scolaires$tx$,
       $tx$Automatisation du calcul des moyennes, centralisation des données de l'établissement et édition automatisée des bulletins de notes.$tx$, true);

  end if;
end
$body$;

-- ------------------------------------------------------------
--  COMPÉTENCES
-- ------------------------------------------------------------
--  L'ordre compte : les deux premières cartes disent quel est ton métier.
--  Les réseaux passent en dernier, volontairement.
do $body$
begin
  if not exists (select 1 from public.competences) then

    insert into public.competences (ordre, icone, titre, description, technologies, visible)
    values
      (1, $tx$🎨$tx$, $tx$Front-end$tx$,
       $tx$Interfaces modernes, responsives et rapides à charger.$tx$,
       $tx$Next.js, React, Tailwind CSS, JavaScript, HTML / CSS$tx$, true),

      (2, $tx$⚙️$tx$, $tx$Back-end & données$tx$,
       $tx$APIs, authentification et gestion des données.$tx$,
       $tx$Node.js, API REST, Supabase, Authentification$tx$, true),

      (3, $tx$🚀$tx$, $tx$Mise en ligne$tx$,
       $tx$Du dépôt Git au site en production, nom de domaine inclus.$tx$,
       $tx$Git & GitHub, Vercel, Nom de domaine, SEO de base$tx$, true),

      (4, $tx$🧩$tx$, $tx$Langages & conception$tx$,
       $tx$Analyse des besoins, modélisation et algorithmique.$tx$,
       $tx$Modélisation BDD, Python, Langage C, PHP$tx$, true),

      (5, $tx$🌐$tx$, $tx$Réseaux & infrastructure$tx$,
       $tx$Bases acquises en Génie Informatique — utile pour comprendre ce qui se passe sous le déploiement.$tx$,
       $tx$Adressage IP, Routage, Cisco Packet Tracer$tx$, true);

  end if;
end
$body$;

-- ------------------------------------------------------------
--  PARCOURS
-- ------------------------------------------------------------
do $body$
begin
  if not exists (select 1 from public.parcours) then

    insert into public.parcours (ordre, periode, titre, organisation, description, visible)
    values
      (1, $tx$Juillet — Août 2026$tx$, $tx$Développeur web$tx$,
       $tx$Agence web · Abidjan$tx$,
       $tx$Deux projets menés en conditions réelles et mis en production : une plateforme scolaire complète développée seul (espaces parents et enseignants, authentification, base de données), et le back-office d'un site vitrine haut de gamme livré sur son propre nom de domaine. Développement front et back, modélisation des données, déploiement.$tx$, true),

      (2, $tx$2025 — Aujourd'hui$tx$, $tx$Développement web en autonomie$tx$,
       $tx$Projets personnels · Abidjan$tx$,
       $tx$Montée en compétences sur l'écosystème Next.js et React, et développement de mes propres projets de bout en bout : conception de l'interface, modélisation des données, déploiement.$tx$, true),

      (3, $tx$2024 — Aujourd'hui$tx$, $tx$Licence en Génie Informatique$tx$,
       $tx$IUA — Institut Universitaire d'Abidjan$tx$,
       $tx$Formation couvrant le développement logiciel, les bases de données et les réseaux. Je me suis orienté vers le développement web, que j'approfondis en parallèle à travers mes propres projets. Actuellement en Licence 3.$tx$, true),

      (4, $tx$2023 — 2024$tx$, $tx$Baccalauréat série D$tx$,
       $tx$Lycée Simone Ehivet Gbagbo · Abidjan$tx$,
       $tx$Série scientifique, orientation mathématiques et sciences de la vie.$tx$, true);

  end if;
end
$body$;

-- ============================================================
--  Vérification rapide. Résultat attendu :
--    projets_principaux 2 · projets_academiques 3 · competences 5
--    parcours 4 · textes 24
-- ============================================================
select
  (select count(*) from public.projets where categorie = 'principal')  as projets_principaux,
  (select count(*) from public.projets where categorie = 'academique') as projets_academiques,
  (select count(*) from public.competences)                            as competences,
  (select count(*) from public.parcours)                               as parcours,
  (select count(*) from public.textes)                                 as textes;
