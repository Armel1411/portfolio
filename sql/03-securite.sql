-- ============================================================
--  PORTFOLIO — DURCISSEMENT DE LA SÉCURITÉ
-- ============================================================
--  À exécuter dans Supabase : SQL Editor → New query → coller → Run.
--  Réexécutable sans danger.
--
--  CE QUE CE SCRIPT CORRIGE
--  ------------------------
--  Les règles écrites au départ disaient : « toute personne
--  AUTHENTIFIÉE peut écrire ». Tant qu'il n'existe qu'un compte, ça va.
--  Mais la clé publique du site est visible par n'importe quel visiteur
--  (c'est sa raison d'être), et l'inscription par email est activée par
--  défaut sur un projet Supabase. Autrement dit : quelqu'un pouvait
--  créer un compte avec cette clé, devenir « authentifié », et modifier
--  tes projets, tes textes et ton stockage.
--
--  Désormais, écrire exige d'être inscrit dans la table
--  « administrateurs ». Un compte créé au hasard ne sert plus à rien.
--
--  ⚠️ Ce script ne suffit pas à lui seul. Il faut AUSSI, dans le tableau
--  de bord Supabase :
--    Authentication → Sign In / Providers → Email
--      • décocher « Allow new users to sign up »
--      • activer « Prevent use of leaked passwords »
--  Les deux sont des interrupteurs, ils ne s'automatisent pas en SQL.
-- ============================================================

-- ------------------------------------------------------------
--  1. QUI EST ADMINISTRATEUR
-- ------------------------------------------------------------
create table if not exists public.administrateurs (
  id        uuid primary key references auth.users (id) on delete cascade,
  email     text,
  ajoute_le timestamptz not null default now()
);

-- Aucune politique n'est créée sur cette table : RLS activé sans
-- politique = personne n'y accède depuis l'extérieur. Seule la fonction
-- ci-dessous, en « security definer », peut la lire.
alter table public.administrateurs enable row level security;

-- On y inscrit le compte existant, repéré par son email — pas besoin
-- d'aller copier un identifiant à la main dans le tableau de bord.
insert into public.administrateurs (id, email)
select id, email from auth.users where email = 'yvesarmel051@gmail.com'
on conflict (id) do nothing;

-- « security definer » : la fonction s'exécute avec les droits de son
-- propriétaire, elle peut donc consulter la table même si l'appelant,
-- lui, n'y a aucun accès. C'est le mécanisme qui permet de vérifier
-- l'appartenance sans exposer la liste.
create or replace function public.est_administrateur()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.administrateurs where id = auth.uid()
  );
$$;

revoke all on function public.est_administrateur() from public;
grant execute on function public.est_administrateur() to authenticated;

-- ------------------------------------------------------------
--  2. ÉCRITURE RÉSERVÉE AUX ADMINISTRATEURS
-- ------------------------------------------------------------
--  La lecture publique ne change pas : le site doit rester lisible par
--  tout le monde. Seule l'écriture se resserre.

drop policy if exists "ecriture des textes par un compte connecte" on public.textes;
drop policy if exists "ecriture des textes par un administrateur" on public.textes;
create policy "ecriture des textes par un administrateur"
  on public.textes for all to authenticated
  using (public.est_administrateur())
  with check (public.est_administrateur());

drop policy if exists "ecriture des projets par un compte connecte" on public.projets;
drop policy if exists "ecriture des projets par un administrateur" on public.projets;
create policy "ecriture des projets par un administrateur"
  on public.projets for all to authenticated
  using (public.est_administrateur())
  with check (public.est_administrateur());

drop policy if exists "ecriture des competences par un compte connecte" on public.competences;
drop policy if exists "ecriture des competences par un administrateur" on public.competences;
create policy "ecriture des competences par un administrateur"
  on public.competences for all to authenticated
  using (public.est_administrateur())
  with check (public.est_administrateur());

drop policy if exists "ecriture du parcours par un compte connecte" on public.parcours;
drop policy if exists "ecriture du parcours par un administrateur" on public.parcours;
create policy "ecriture du parcours par un administrateur"
  on public.parcours for all to authenticated
  using (public.est_administrateur())
  with check (public.est_administrateur());

-- ------------------------------------------------------------
--  3. STOCKAGE : MÊME RÈGLE
-- ------------------------------------------------------------
--  Sans ça, un compte quelconque pouvait déposer n'importe quel fichier
--  dans un espace public servi depuis ton domaine — de quoi héberger
--  gratuitement des fichiers douteux à ton nom.

drop policy if exists "depot de fichiers par un compte connecte" on storage.objects;
drop policy if exists "remplacement de fichiers par un compte connecte" on storage.objects;
drop policy if exists "suppression de fichiers par un compte connecte" on storage.objects;
drop policy if exists "depot de fichiers par un administrateur" on storage.objects;
drop policy if exists "remplacement de fichiers par un administrateur" on storage.objects;
drop policy if exists "suppression de fichiers par un administrateur" on storage.objects;

create policy "depot de fichiers par un administrateur"
  on storage.objects for insert to authenticated
  with check (bucket_id in ('medias', 'documents') and public.est_administrateur());

create policy "remplacement de fichiers par un administrateur"
  on storage.objects for update to authenticated
  using (bucket_id in ('medias', 'documents') and public.est_administrateur())
  with check (bucket_id in ('medias', 'documents') and public.est_administrateur());

create policy "suppression de fichiers par un administrateur"
  on storage.objects for delete to authenticated
  using (bucket_id in ('medias', 'documents') and public.est_administrateur());

-- ------------------------------------------------------------
--  4. JOURNAL DES CONNEXIONS
-- ------------------------------------------------------------
--  Chaque tentative d'entrée dans l'admin, réussie ou non, laisse une
--  trace consultable depuis l'écran Sécurité.
--
--  Compromis assumé : l'insertion est ouverte, y compris à un visiteur
--  non connecté. Il le faut, sinon une tentative ÉCHOUÉE — justement
--  celle qui nous intéresse — ne pourrait rien écrire. La lecture, elle,
--  est réservée à l'administrateur : personne d'autre ne voit ce journal.
create table if not exists public.connexions (
  id       bigint generated always as identity primary key,
  email    text,
  reussie  boolean not null default false,
  motif    text,
  cree_le  timestamptz not null default now()
);

create index if not exists connexions_par_date on public.connexions (cree_le desc);

alter table public.connexions enable row level security;

drop policy if exists "ecriture du journal de connexion" on public.connexions;
create policy "ecriture du journal de connexion"
  on public.connexions for insert to anon, authenticated
  with check (true);

drop policy if exists "lecture du journal par un administrateur" on public.connexions;
create policy "lecture du journal par un administrateur"
  on public.connexions for select to authenticated
  using (public.est_administrateur());

drop policy if exists "purge du journal par un administrateur" on public.connexions;
create policy "purge du journal par un administrateur"
  on public.connexions for delete to authenticated
  using (public.est_administrateur());

-- ============================================================
--  VÉRIFICATION
--  administrateurs doit valoir 1. Si le résultat est 0, c'est que
--  l'email ne correspond pas au compte créé dans Authentication → Users :
--  corrige-le dans le insert plus haut et relance le script.
-- ============================================================
select
  (select count(*) from public.administrateurs) as administrateurs,
  (select count(*) from pg_policies
    where schemaname = 'public' and policyname like '%administrateur%') as politiques_admin;
