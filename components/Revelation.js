"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Apparition au défilement.
 *
 * Remplace le petit script IntersectionObserver de l'ancien index.html.
 * Le bloc est légèrement décalé et transparent, puis se met en place
 * quand il entre dans l'écran. Une seule fois : on arrête d'observer
 * après le déclenchement, sinon le contenu rejouerait l'animation à
 * chaque aller-retour.
 *
 * Si le visiteur a demandé à son système de réduire les animations,
 * globals.css neutralise l'effet — il n'y a rien à gérer ici.
 */
export default function Revelation({ children, className = "" }) {
  const conteneur = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const element = conteneur.current;
    if (!element) return;

    // Navigateur trop ancien : on affiche sans animation plutôt que de
    // laisser le contenu invisible pour toujours.
    if (typeof IntersectionObserver === "undefined") {
      setVisible(true);
      return;
    }

    const observateur = new IntersectionObserver(
      (entrees) => {
        for (const entree of entrees) {
          if (entree.isIntersecting) {
            setVisible(true);
            observateur.unobserve(entree.target);
          }
        }
      },
      { threshold: 0.12 }
    );

    observateur.observe(element);
    return () => observateur.disconnect();
  }, []);

  return (
    <div ref={conteneur} className={`reveal ${visible ? "on" : ""} ${className}`.trim()}>
      {children}
    </div>
  );
}
