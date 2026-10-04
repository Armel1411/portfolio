"use client";

import { useEffect, useRef } from "react";

/* ============================================================
   Effets qui répondent au visiteur, pour toute la page
   ============================================================
   - Barre de progression de lecture en haut de l'écran.
   - Halo lumineux qui suit le curseur sur les cartes marquées .spot
     (projets, compétences) : on écrit la position de la souris dans deux
     variables CSS, --mx et --my, et globals.css dessine le halo.

   Un seul écouteur pour toute la page plutôt qu'un par carte : moins de
   travail pour le navigateur, et les cartes ajoutées plus tard depuis
   l'admin en profitent sans rien changer.
   ============================================================ */

export default function EffetsPage() {
  const barre = useRef(null);

  useEffect(() => {
    let attente = false;

    function surDefilement() {
      if (attente) return;
      attente = true;
      requestAnimationFrame(() => {
        const max = document.documentElement.scrollHeight - window.innerHeight;
        const progression = max > 0 ? window.scrollY / max : 0;
        if (barre.current) barre.current.style.transform = `scaleX(${progression})`;
        attente = false;
      });
    }

    function surMouvement(evenement) {
      const carte = evenement.target.closest?.(".spot");
      if (!carte) return;
      const zone = carte.getBoundingClientRect();
      carte.style.setProperty("--mx", `${evenement.clientX - zone.left}px`);
      carte.style.setProperty("--my", `${evenement.clientY - zone.top}px`);
    }

    surDefilement();
    window.addEventListener("scroll", surDefilement, { passive: true });
    document.addEventListener("pointermove", surMouvement, { passive: true });
    return () => {
      window.removeEventListener("scroll", surDefilement);
      document.removeEventListener("pointermove", surMouvement);
    };
  }, []);

  return <div className="progression" ref={barre} aria-hidden="true" />;
}
