import Entete from "@/components/Entete";
import Hero from "@/components/Hero";
import APropos from "@/components/APropos";
import Competences from "@/components/Competences";
import Projets from "@/components/Projets";
import Parcours from "@/components/Parcours";
import Contact from "@/components/Contact";
import PiedDePage from "@/components/PiedDePage";
import EffetsPage from "@/components/EffetsPage";

import {
  lireTextes,
  lireProjets,
  lireCompetences,
  lireParcours,
  listeTechnologies,
} from "@/lib/donnees";

/* ============================================================
   Page d'accueil
   ============================================================
   C'est un composant serveur : les quatre lectures ci-dessous se font
   sur le serveur, avant l'envoi de la page. Le visiteur reçoit donc du
   HTML déjà rempli — c'est ce qui garde le référencement intact, et
   c'était la raison de choisir Next.js plutôt qu'une page statique qui
   irait chercher ses données en JavaScript.

   revalidate = 0 : pas de mise en cache. Une modification faite dans
   l'admin est visible au rechargement suivant, sans attendre. Sur un
   portfolio le trafic est faible, le coût est négligeable — et c'est
   plus simple que d'avoir à se demander pourquoi un changement n'apparaît
   pas encore.
   ============================================================ */

export const revalidate = 0;

export default async function PageAccueil() {
  // Les quatre lectures sont indépendantes : on les lance en parallèle
  // plutôt que l'une après l'autre.
  const [textes, projets, academiques, competences, parcours] = await Promise.all([
    lireTextes(),
    lireProjets("principal"),
    lireProjets("academique"),
    lireCompetences(),
    lireParcours(),
  ]);

  // Ce que le terminal du hero affiche. Les technologies viennent des
  // deux premières cartes de compétences (front-end, back-end) : ce sont
  // celles qui disent ton métier.
  const terminal = {
    technos: [
      ...new Set(competences.slice(0, 2).flatMap((c) => listeTechnologies(c.technologies))),
    ],
    projets: projets.map((p) => p.titre),
    competences: competences.map((c) => c.titre),
    email: textes.email,
    github: textes.github,
    cvUrl: textes.cv_url && String(textes.cv_url).trim() !== "" ? textes.cv_url : null,
  };

  return (
    <>
      <EffetsPage />
      <Entete />
      <Hero textes={textes} terminal={terminal} />
      <APropos textes={textes} />
      <Competences textes={textes} competences={competences} />
      <Projets textes={textes} projets={projets} academiques={academiques} />
      <Parcours textes={textes} parcours={parcours} />
      <Contact textes={textes} />
      <PiedDePage />
    </>
  );
}
