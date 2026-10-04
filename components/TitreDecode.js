"use client";

import { useEffect, useRef, useState } from "react";

/* ============================================================
   Titre qui se « décode »
   ============================================================
   Au chargement, chaque lettre du titre défile parmi des symboles de
   code ({ } < / > ; = …) puis se fige sur la bonne lettre, de gauche à
   droite. L'effet dure un peu plus d'une seconde.

   Pour le référencement et les lecteurs d'écran, le vrai texte est
   toujours présent dans le HTML : la version animée est marquée
   aria-hidden et ne fait que se superposer visuellement.

   Sans JavaScript, la classe "decode-attente" laisse le titre apparaître
   seul au bout d'une seconde (voir globals.css) : il ne reste jamais
   invisible.
   ============================================================ */

const SYMBOLES = "{}[]<>/\\=;:_-+*#$%&01";

function symboleAuHasard() {
  return SYMBOLES[Math.floor(Math.random() * SYMBOLES.length)];
}

export default function TitreDecode({ ligne1, ligne2 }) {
  const final = [ligne1 || "", ligne2 || ""];
  const [lignes, setLignes] = useState(final);
  const [pret, setPret] = useState(false);
  const idAnim = useRef(0);

  useEffect(() => {
    const reduit = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    // Le titre devient visible à la première image dessinée.
    const idPret = requestAnimationFrame(() => setPret(true));
    if (reduit) return () => cancelAnimationFrame(idPret);

    const texteComplet = final.join("\n");
    const total = texteComplet.length;
    const duree = 1100; // ms pour révéler tout le titre
    const delai = 180;
    const debut = performance.now() + delai;

    function etape(maintenant) {
      const ecoule = maintenant - debut;
      // Nombre de lettres déjà figées.
      const figees = Math.max(0, Math.floor((ecoule / duree) * total));

      let i = 0;
      const resultat = final.map((ligne) =>
        Array.from(ligne)
          .map((lettre) => {
            const index = i++;
            if (lettre === " " || index < figees) return lettre;
            // Les lettres pas encore atteintes restent vides, celles du
            // front de décodage scintillent : on voit le titre « s'écrire ».
            return index < figees + 10 ? symboleAuHasard() : " ";
          })
          .join("")
      );
      i++; // le saut de ligne

      setLignes(resultat);
      if (figees < total) idAnim.current = requestAnimationFrame(etape);
      else setLignes(final);
    }

    idAnim.current = requestAnimationFrame(etape);
    return () => {
      cancelAnimationFrame(idPret);
      cancelAnimationFrame(idAnim.current);
    };
    // Le titre ne change pas pendant la vie de la page.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <h1 className={pret ? "titre-decode" : "titre-decode decode-attente"}>
      <span className="sr-only">
        {final[0]} {final[1]}
      </span>
      <span aria-hidden="true">
        {lignes[0]}
        <br />
        <span className="grad">{lignes[1]}</span>
      </span>
    </h1>
  );
}
