-- ============================================================
--  PORTFOLIO — TABLES ET RÈGLES DE SÉCURITÉ
-- ============================================================
--  À exécuter UNE FOIS dans Supabase :
--    ton projet → SQL Editor → New query → coller tout ce fichier → Run
--
--  Le script est réexécutable sans danger : il ne recrée pas ce qui
--  existe déjà et ne supprime aucune donnée.
--
--  Quatre tables, une par bloc du site :
--    textes      → tous les textes de la page (clé / valeur)
--    projets     → les cartes projets, principales et académiques
--    competences → les cartes de compétences
--    parcours    → la frise expérience & formation
-- ============================================================

create extension if not exists "pgcrypto";

-- ------------------------------------------------------------
--  TEXTES
-- ------------------------------------------------------------
--  Une ligne = un texte du site, repéré par sa clé (hero_accroche,
--  contact_texte...). Ce format évite d'avoir à modifier la base chaque
--  fois qu'on veut rendre un nouveau texte modifiable.
create table if not exists public.textes (
  cle     text primary key,
  valeur  text not null default '',
  maj_le  timestamptz not null default now()
);

-- ------------------------------------------------------------
--  PROJETS
-- ------------------------------------------------------------
create table if not exists public.projets (
  id                 uuid primary key default gen_random_uuid(),
  categorie          text not null default 'principal',
  ordre              integer not null default 0,
  titre              text not null,
  -- « Développé seul · au sein d'une agence web à Abidjan »
  -- Ce champ répond par avance à la question du recruteur : pour qui, et
  -- qu'as-tu écrit toi-même. À ne pas laisser vide sur un projet partagé.
  origine            text,
  statut             text,
  statut_type        text not null default 'live',
  description        text,
  -- Liste séparée par des virgules : « Next.js, React, Tailwind CSS »
  technologies       text,
  image_url          text,
  emoji              text,
  lien_site          text,
  libelle_lien_site  text default 'Voir le site',
  lien_code          text,
  visible            boolean not null default true,
  cree_le            timestamptz not null default now(),

  constraint projets_categorie_valide
    check (categorie in ('principal', 'academique')),
  -- 'live' = pastille verte, 'wip' = pastille orange
  constraint projets_statut_type_valide
    check (statut_type in ('live', 'wip'))
);

create index if not exists projets_tri on public.projets (categorie, ordre);

-- ------------------------------------------------------------
--  COMPÉTENCES
-- ------------------------------------------------------------
create table if not exists public.competences (
  id            uuid primary key default gen_random_uuid(),
  ordre         integer not null default 0,
  icone         text,
  titre         text not null,
  description   text,
  technologies  text,
  visible       boolean not null default true
);

-- ------------------------------------------------------------
--  PARCOURS
-- ------------------------------------------------------------
create table if not exists public.parcours (
  id            uuid primary key default gen_random_uuid(),
  ordre         integer not null default 0,
  periode       text,
  titre         text not null,
  organisation  text,
  description   text,
  visible       boolean not null default true
);

-- ============================================================
--  RÈGLES D'ACCÈS (RLS)
-- ============================================================
--  Row Level Security refusé par défaut : tant qu'aucune règle
--  n'autorise une opération, elle est interdite. C'est ce qui permet
--  d'exposer la clé « publishable » dans le navigateur sans risque —
--  elle ne donne que les droits décrits ci-dessous.
--
--  Le principe retenu :
--    • n'importe qui peut LIRE ce qui est marqué visible
--    • seul un compte connecté peut ÉCRIRE
-- ============================================================

alter table public.textes      enable row level security;
alter table public.projets     enable row level security;
alter table public.competences enable row level security;
alter table public.parcours    enable row level security;

-- --- Lecture publique ---------------------------------------

drop policy if exists "lecture publique des textes" on public.textes;
create policy "lecture publique des textes"
  on public.textes for select
  using (true);

drop policy if exists "lecture publique des projets visibles" on public.projets;
create policy "lecture publique des projets visibles"
  on public.projets for select
  using (visible = true);

drop policy if exists "lecture publique des competences visibles" on public.competences;
create policy "lecture publique des competences visibles"
  on public.competences for select
  using (visible = true);

drop policy if exists "lecture publique du parcours visible" on public.parcours;
create policy "lecture publique du parcours visible"
  on public.parcours for select
  using (visible = true);

-- --- Écriture réservée aux comptes connectés ------------------
--  « for all » couvre select, insert, update et delete : l'admin voit
--  donc aussi les éléments masqués, ce qui est nécessaire pour pouvoir
--  les réafficher.

drop policy if exists "ecriture des textes par un compte connecte" on public.textes;
create policy "ecriture des textes par un compte connecte"
  on public.textes for all to authenticated
  using (true) with check (true);

drop policy if exists "ecriture des projets par un compte connecte" on public.projets;
create policy "ecriture des projets par un compte connecte"
  on public.projets for all to authenticated
  using (true) with check (true);

drop policy if exists "ecriture des competences par un compte connecte" on public.competences;
create policy "ecriture des competences par un compte connecte"
  on public.competences for all to authenticated
  using (true) with check (true);

drop policy if exists "ecriture du parcours par un compte connecte" on public.parcours;
create policy "ecriture du parcours par un compte connecte"
  on public.parcours for all to authenticated
  using (true) with check (true);

-- ============================================================
--  STOCKAGE DES FICHIERS
-- ============================================================
--  Deux espaces :
--    medias     → captures d'écran des projets
--    documents  → le CV en PDF
--
--  Les deux sont publics en lecture : ce sont des fichiers destinés à
--  être vus par les visiteurs. Le dépôt et le remplacement, en revanche,
--  exigent d'être connecté.
-- ============================================================

insert into storage.buckets (id, name, public)
values ('medias', 'medias', true),
       ('documents', 'documents', true)
on conflict (id) do nothing;

drop policy if exists "lecture publique des fichiers du portfolio" on storage.objects;
create policy "lecture publique des fichiers du portfolio"
  on storage.objects for select
  using (bucket_id in ('medias', 'documents'));

drop policy if exists "depot de fichiers par un compte connecte" on storage.objects;
create policy "depot de fichiers par un compte connecte"
  on storage.objects for insert to authenticated
  with check (bucket_id in ('medias', 'documents'));

drop policy if exists "remplacement de fichiers par un compte connecte" on storage.objects;
create policy "remplacement de fichiers par un compte connecte"
  on storage.objects for update to authenticated
  using (bucket_id in ('medias', 'documents'))
  with check (bucket_id in ('medias', 'documents'));

drop policy if exists "suppression de fichiers par un compte connecte" on storage.objects;
create policy "suppression de fichiers par un compte connecte"
  on storage.objects for delete to authenticated
  using (bucket_id in ('medias', 'documents'));

-- ============================================================
--  Terminé. Exécute ensuite 02-donnees-initiales.sql pour remplir
--  les tables avec le contenu actuel du site.
-- ============================================================
