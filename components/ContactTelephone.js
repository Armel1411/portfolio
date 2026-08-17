"use client";

import { useState } from "react";

/**
 * Numéro de téléphone protégé des robots.
 *
 * Le numéro n'est jamais écrit en entier dans le HTML envoyé au
 * navigateur : il arrive découpé en trois morceaux (indicatif, deux
 * moitiés) et n'est recomposé qu'au moment de l'affichage, dans le
 * navigateur du visiteur.
 *
 * Ça n'arrête pas un humain déterminé — ce n'est pas le but. Ça arrête
 * les robots qui aspirent le code source des pages en masse pour
 * revendre des listes de numéros, et c'est eux qui remplissent une
 * boîte de spam.
 *
 * Les trois morceaux sont modifiables depuis l'admin (section Textes),
 * il n'y a donc pas à toucher au code si le numéro change.
 */
export default function ContactTelephone({ indicatif, partie1, partie2 }) {
  const [numeroAffiche, setNumeroAffiche] = useState(false);

  // Assemblé ici, jamais dans le HTML livré.
  const numeroComplet = `${indicatif}${partie1}${partie2}`;

  const numeroLisible =
    `+${indicatif} ` +
    `${partie1.replace(/(\d{2})(\d{2})/, "$1 $2")} ` +
    `${partie2.replace(/(\d{2})(\d{2})(\d{2})/, "$1 $2 $3")}`;

  return (
    <>
      <a
        className="social"
        href={`https://wa.me/${numeroComplet}`}
        target="_blank"
        rel="noopener noreferrer"
      >
        WhatsApp
      </a>

      {numeroAffiche ? (
        <a className="social" href={`tel:+${numeroComplet}`}>
          {numeroLisible}
        </a>
      ) : (
        <button className="social" onClick={() => setNumeroAffiche(true)}>
          Afficher mon numéro
        </button>
      )}
    </>
  );
}
