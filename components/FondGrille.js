"use client";

import { useEffect, useRef } from "react";

/* ============================================================
   Fond du hero : une grille de points qui réagit à la souris
   ============================================================
   Une grille régulière de petits points, presque invisibles. Autour du
   curseur, les points s'allument, grossissent et se relient au pointeur
   par de fines lignes — comme un circuit qui s'active là où l'on passe.
   Sans souris (téléphone), une onde lumineuse balaie lentement la grille.

   Trois précautions de performance :
     - le dessin s'arrête quand le hero sort de l'écran ;
     - le canvas suit la densité de l'écran (net sur Retina) mais plafonne
       à 2 pour ne pas faire chauffer les téléphones ;
     - si le visiteur a demandé moins d'animations, on dessine la grille
       une seule fois, immobile.
   ============================================================ */

const ECART = 30; // distance entre deux points, en pixels
const RAYON = 170; // rayon d'influence du curseur

export default function FondGrille() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduit = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const parent = canvas.parentElement;

    let largeur = 0;
    let hauteur = 0;
    let points = [];
    let souris = { x: -9999, y: -9999, active: false };
    let lisse = { x: -9999, y: -9999 };
    let visible = true;
    let idAnim = 0;
    let debut = performance.now();

    function dimensionner() {
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      largeur = parent.clientWidth;
      hauteur = parent.clientHeight;
      canvas.width = largeur * ratio;
      canvas.height = hauteur * ratio;
      canvas.style.width = largeur + "px";
      canvas.style.height = hauteur + "px";
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);

      points = [];
      const decalX = (largeur % ECART) / 2;
      const decalY = (hauteur % ECART) / 2;
      for (let y = decalY; y <= hauteur; y += ECART) {
        for (let x = decalX; x <= largeur; x += ECART) {
          points.push({ x, y });
        }
      }
      if (reduit) dessiner(0);
    }

    function dessiner(temps) {
      ctx.clearRect(0, 0, largeur, hauteur);

      // Le point lumineux suit la souris avec un léger retard : c'est ce
      // retard qui rend le mouvement fluide plutôt que mécanique.
      if (souris.active) {
        lisse.x += (souris.x - lisse.x) * 0.14;
        lisse.y += (souris.y - lisse.y) * 0.14;
      }

      // Onde de balayage quand il n'y a pas de souris (mobile, ou curseur
      // hors du hero) : une ligne diagonale qui traverse la grille.
      const t = (temps - debut) / 1000;
      const onde = ((t * 160) % (largeur + hauteur + 400)) - 200;

      const liens = [];

      for (const p of points) {
        let intensite = 0;

        if (souris.active) {
          const dx = p.x - lisse.x;
          const dy = p.y - lisse.y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < RAYON) {
            intensite = 1 - d / RAYON;
            if (d < RAYON * 0.62) liens.push({ p, force: intensite });
          }
        } else if (!reduit) {
          const ecartOnde = Math.abs(p.x + p.y - onde);
          if (ecartOnde < 90) intensite = (1 - ecartOnde / 90) * 0.55;
        }

        const taille = 1 + intensite * 1.8;
        // De l'indigo (#6366f1) vers le cyan (#22d3ee) selon l'intensité.
        const r = Math.round(99 + (34 - 99) * intensite);
        const g = Math.round(102 + (211 - 102) * intensite);
        const b = Math.round(241 + (238 - 241) * intensite);
        const alpha = 0.16 + intensite * 0.8;

        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, taille, 0, Math.PI * 2);
        ctx.fill();
      }

      // Les lignes vers le curseur, dessinées après les points.
      for (const { p, force } of liens) {
        ctx.strokeStyle = `rgba(34, 211, 238, ${force * 0.22})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(lisse.x, lisse.y);
        ctx.stroke();
      }
    }

    function boucle(temps) {
      if (visible) dessiner(temps);
      idAnim = requestAnimationFrame(boucle);
    }

    function surMouvement(evenement) {
      const zone = parent.getBoundingClientRect();
      const x = evenement.clientX - zone.left;
      const y = evenement.clientY - zone.top;
      const dedans = x >= 0 && y >= 0 && x <= zone.width && y <= zone.height;
      if (dedans && !souris.active) {
        // Premier contact : on place directement le point lisse sous le
        // curseur pour éviter qu'il traverse l'écran depuis le coin.
        lisse.x = x;
        lisse.y = y;
      }
      souris = { x, y, active: dedans };
    }

    function surSortie() {
      souris.active = false;
      debut = performance.now();
    }

    dimensionner();
    const observateurTaille = new ResizeObserver(dimensionner);
    observateurTaille.observe(parent);

    let observateurVisibilite = null;
    if (!reduit) {
      observateurVisibilite = new IntersectionObserver(([entree]) => {
        visible = entree.isIntersecting;
      });
      observateurVisibilite.observe(parent);

      window.addEventListener("pointermove", surMouvement, { passive: true });
      document.documentElement.addEventListener("pointerleave", surSortie);
      idAnim = requestAnimationFrame(boucle);
    }

    return () => {
      cancelAnimationFrame(idAnim);
      observateurTaille.disconnect();
      if (observateurVisibilite) observateurVisibilite.disconnect();
      window.removeEventListener("pointermove", surMouvement);
      document.documentElement.removeEventListener("pointerleave", surSortie);
    };
  }, []);

  return <canvas ref={canvasRef} className="fond-grille" aria-hidden="true" />;
}
