"use client";

import { useEffect, useRef, useState } from "react";

/* ============================================================
   Terminal interactif du hero
   ============================================================
   1. Au chargement, le terminal « démarre » le portfolio : une commande
      se tape toute seule, puis les lignes de sortie apparaissent.
   2. Ensuite, le visiteur peut taper ses propres commandes : help,
      projets, competences, contact, cv, clear… Certaines font défiler la
      page jusqu'à la section correspondante.

   Tout le contenu vient des props (donc de Supabase ou du contenu de
   repli) : ajouter un projet dans l'admin le fait apparaître ici aussi.

   Le champ de saisie n'est PAS focalisé automatiquement : sur téléphone,
   ça ouvrirait le clavier dès l'arrivée sur le site.
   ============================================================ */

const INVITE = "visiteur@yves:~$";

function defiler(id) {
  const cible = document.getElementById(id);
  if (cible) cible.scrollIntoView({ behavior: "smooth", block: "start" });
}

export default function Terminal({ technos = [], projets = [], competences = [], email, github, cvUrl }) {
  const [lignes, setLignes] = useState([]);
  const [commandeAuto, setCommandeAuto] = useState("");
  const [demarre, setDemarre] = useState(false);
  const [saisie, setSaisie] = useState("");
  const [historique, setHistorique] = useState([]);
  const [positionHisto, setPositionHisto] = useState(-1);
  const champ = useRef(null);
  const corps = useRef(null);

  const nbProjets = projets.length;

  // ------------------------------------------------------------------
  //  Séquence de démarrage
  // ------------------------------------------------------------------
  useEffect(() => {
    const reduit = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const commande = "npx yves-armel --dev";
    const sortie = [
      { type: "info", texte: "▸ Chargement du profil…" },
      ...technos.slice(0, 6).map((t) => ({ type: "ok", texte: `✓ ${t}` })),
      {
        type: "ok",
        texte: `✓ ${nbProjets} projet${nbProjets > 1 ? "s" : ""} chargé${nbProjets > 1 ? "s" : ""}`,
      },
      { type: "vide", texte: "" },
      { type: "accent", texte: "Prêt. Tape « help » pour explorer le portfolio." },
    ];

    if (reduit) {
      // Pas d'animation : tout s'affiche d'un coup.
      const id = setTimeout(() => {
        setCommandeAuto(commande);
        setLignes(sortie);
        setDemarre(true);
      }, 0);
      return () => clearTimeout(id);
    }

    const minuteurs = [];
    let t = 500;

    // La commande se tape lettre par lettre, avec un rythme irrégulier :
    // une frappe parfaitement régulière sonne faux.
    for (let i = 1; i <= commande.length; i++) {
      t += 38 + Math.random() * 45;
      minuteurs.push(setTimeout(() => setCommandeAuto(commande.slice(0, i)), t));
    }
    t += 320;

    sortie.forEach((ligne, index) => {
      t += index === 0 ? 0 : 110;
      minuteurs.push(setTimeout(() => setLignes((l) => [...l, ligne]), t));
    });
    minuteurs.push(setTimeout(() => setDemarre(true), t + 80));

    return () => minuteurs.forEach(clearTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Le terminal défile tout seul vers la dernière ligne.
  useEffect(() => {
    if (corps.current) corps.current.scrollTop = corps.current.scrollHeight;
  }, [lignes, commandeAuto]);

  // ------------------------------------------------------------------
  //  Commandes
  // ------------------------------------------------------------------
  function executer(brut) {
    const commande = brut.trim().toLowerCase();
    const echo = { type: "commande", texte: brut };
    if (!commande) return [echo];

    const [nom] = commande.split(/\s+/);

    switch (nom) {
      case "help":
      case "aide":
        return [
          echo,
          { type: "info", texte: "Commandes disponibles :" },
          { type: "aide", cle: "about", texte: "qui je suis" },
          { type: "aide", cle: "competences", texte: "ma stack technique" },
          { type: "aide", cle: "projets", texte: "mes réalisations" },
          { type: "aide", cle: "parcours", texte: "expérience et formation" },
          { type: "aide", cle: "contact", texte: "me joindre" },
          ...(cvUrl ? [{ type: "aide", cle: "cv", texte: "télécharger mon CV" }] : []),
          { type: "aide", cle: "clear", texte: "effacer le terminal" },
        ];

      case "about":
      case "apropos":
      case "whoami":
        defiler("about");
        return [
          echo,
          { type: "texte", texte: "Yves Armel — développeur web à Abidjan." },
          { type: "texte", texte: "Next.js et React, de l'interface jusqu'à la base de données." },
          { type: "info", texte: "→ section « À propos »" },
        ];

      case "competences":
      case "skills":
      case "stack":
        defiler("skills");
        return [
          echo,
          ...competences.map((c) => ({ type: "ok", texte: `✓ ${c}` })),
          { type: "info", texte: "→ section « Compétences »" },
        ];

      case "projets":
      case "projects":
      case "ls":
        defiler("projects");
        return [
          echo,
          ...projets.map((p) => ({ type: "projet", texte: p })),
          { type: "info", texte: "→ section « Projets »" },
        ];

      case "parcours":
      case "experience":
        defiler("parcours");
        return [echo, { type: "info", texte: "→ section « Parcours »" }];

      case "contact":
        defiler("contact");
        return [
          echo,
          { type: "lien", texte: email, href: `mailto:${email}` },
          ...(github ? [{ type: "lien", texte: github.replace("https://", ""), href: github }] : []),
        ];

      case "cv":
        if (!cvUrl) return [echo, { type: "erreur", texte: "Le CV n'est pas disponible pour le moment." }];
        return [echo, { type: "lien", texte: "Télécharger le CV", href: cvUrl, telecharger: true }];

      case "clear":
      case "cls":
        return null; // signal : on vide tout

      case "sudo":
        return [echo, { type: "erreur", texte: "Bien essayé. Accès refusé 🙂" }];

      case "rm":
        return [echo, { type: "erreur", texte: "Non, on ne supprime pas le portfolio." }];

      default:
        return [
          echo,
          { type: "erreur", texte: `commande introuvable : ${nom}. Tape « help ».` },
        ];
    }
  }

  function surEnvoi(evenement) {
    evenement.preventDefault();
    const resultat = executer(saisie);
    if (resultat === null) setLignes([]);
    else setLignes((l) => [...l, ...resultat]);
    if (saisie.trim()) setHistorique((h) => [saisie, ...h].slice(0, 30));
    setSaisie("");
    setPositionHisto(-1);
  }

  // Flèches haut / bas : naviguer dans les commandes déjà tapées,
  // comme dans un vrai terminal.
  function surTouche(evenement) {
    if (evenement.key === "ArrowUp" && historique.length) {
      evenement.preventDefault();
      const pos = Math.min(positionHisto + 1, historique.length - 1);
      setPositionHisto(pos);
      setSaisie(historique[pos]);
    } else if (evenement.key === "ArrowDown") {
      evenement.preventDefault();
      const pos = positionHisto - 1;
      setPositionHisto(Math.max(pos, -1));
      setSaisie(pos >= 0 ? historique[pos] : "");
    }
  }

  function rendreLigne(ligne, index) {
    switch (ligne.type) {
      case "commande":
        return (
          <div key={index} className="t-ligne">
            <span className="t-invite">{INVITE}</span> {ligne.texte}
          </div>
        );
      case "aide":
        return (
          <div key={index} className="t-ligne">
            <button type="button" className="t-cle" onClick={() => lancer(ligne.cle)}>
              {ligne.cle}
            </button>
            <span className="t-muet">{ligne.texte}</span>
          </div>
        );
      case "lien":
        return (
          <div key={index} className="t-ligne">
            <a
              href={ligne.href}
              className="t-lien"
              {...(ligne.telecharger ? { download: true } : {})}
              {...(ligne.href.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})}
            >
              {ligne.texte} ↗
            </a>
          </div>
        );
      case "vide":
        return <div key={index} className="t-ligne">&nbsp;</div>;
      default:
        return (
          <div key={index} className={`t-ligne t-${ligne.type}`}>
            {ligne.texte}
          </div>
        );
    }
  }

  // Cliquer sur une commande de l'aide l'exécute directement.
  function lancer(cle) {
    const resultat = executer(cle);
    if (resultat === null) setLignes([]);
    else setLignes((l) => [...l, ...resultat]);
  }

  return (
    <div className="terminal" onClick={() => champ.current?.focus({ preventScroll: true })}>
      <div className="t-barre">
        <span className="t-pastille" />
        <span className="t-pastille" />
        <span className="t-pastille" />
        <span className="t-titre">yves@abidjan — zsh</span>
      </div>

      <div className="t-corps" ref={corps} aria-live="polite">
        <div className="t-ligne">
          <span className="t-invite">~ $</span> {commandeAuto}
          {!demarre && commandeAuto.length < 20 ? <span className="t-curseur" /> : null}
        </div>

        {lignes.map(rendreLigne)}

        {demarre ? (
          <form className="t-ligne t-saisie" onSubmit={surEnvoi}>
            <label htmlFor="terminal-commande" className="t-invite">
              {INVITE}
            </label>
            <input
              id="terminal-commande"
              ref={champ}
              value={saisie}
              onChange={(e) => setSaisie(e.target.value)}
              onKeyDown={surTouche}
              autoComplete="off"
              autoCapitalize="off"
              spellCheck="false"
              aria-label="Tape une commande, par exemple help"
              placeholder="help"
            />
          </form>
        ) : null}
      </div>
    </div>
  );
}
