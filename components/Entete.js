"use client";

import { useState } from "react";

/**
 * Barre de navigation collée en haut de page.
 *
 * Composant client parce qu'il gère l'ouverture du menu sur mobile.
 * En dessous de 680 px, les liens disparaissent et le bouton ☰ les
 * affiche en colonne (voir .nav-links.open dans globals.css).
 */
export default function Entete() {
  const [menuOuvert, setMenuOuvert] = useState(false);

  return (
    <header>
      <div className="wrap">
        <nav>
          <a href="#" className="logo">
            Yves<span>.</span>
          </a>

          <div
            className={menuOuvert ? "nav-links open" : "nav-links"}
            id="navLinks"
            // Un clic sur un lien referme le menu : sans ça, sur mobile,
            // le menu reste ouvert par-dessus la section qu'on vient
            // d'atteindre.
            onClick={() => setMenuOuvert(false)}
          >
            <a href="#about">À propos</a>
            <a href="#skills">Compétences</a>
            <a href="#projects">Projets</a>
            <a href="#parcours">Parcours</a>
          </div>

          <a href="#contact" className="nav-cta">
            Me contacter
          </a>

          <button
            className="burger"
            aria-label={menuOuvert ? "Fermer le menu" : "Ouvrir le menu"}
            aria-expanded={menuOuvert}
            onClick={() => setMenuOuvert((ouvert) => !ouvert)}
          >
            ☰
          </button>
        </nav>
      </div>
    </header>
  );
}
