"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabaseNavigateur } from "@/lib/supabase-navigateur";

/**
 * Page de connexion à l'administration.
 *
 * C'est Supabase qui vérifie le mot de passe, jamais nous : l'application
 * ne voit passer le mot de passe que le temps de l'envoyer, ne le stocke
 * nulle part et ne le compare à rien. En retour, Supabase dépose un
 * cookie de session signé, à durée limitée.
 *
 * Le compte se crée dans Supabase → Authentication → Users → Add user.
 * Il n'y a volontairement pas de formulaire d'inscription : ce site n'a
 * qu'un seul administrateur, et une page d'inscription ouverte serait une
 * porte d'entrée de plus à surveiller.
 */
export default function PageConnexion() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [motDePasse, setMotDePasse] = useState("");
  const [erreur, setErreur] = useState("");
  const [enCours, setEnCours] = useState(false);

  async function soumettre(evenement) {
    evenement.preventDefault();
    setErreur("");
    setEnCours(true);

    try {
      const supabase = supabaseNavigateur();
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: motDePasse,
      });

      if (error) {
        // Supabase renvoie le même « Invalid login credentials » que l'email
        // soit inconnu ou le mot de passe faux : afficher son message ne
        // renseigne donc personne sur les comptes existants. En revanche, il
        // distingue le cas du compte non confirmé — et sans cette précision,
        // on cherche un mot de passe qui était bon depuis le début.
        const brut = (error.message || "").toLowerCase();

        if (brut.includes("not confirmed")) {
          setErreur(
            "Ce compte existe mais n'est pas confirmé. Dans Supabase → Authentication → " +
              "Users, ouvre l'utilisateur et confirme-le, ou recrée-le en cochant " +
              "« Auto Confirm User »."
          );
        } else if (brut.includes("invalid login")) {
          setErreur("Email ou mot de passe incorrect.");
        } else {
          setErreur(`Connexion refusée par Supabase : ${error.message}`);
        }

        setEnCours(false);
        return;
      }

      // refresh() force le serveur à relire le cookie tout neuf, sinon la
      // page suivante croirait encore que personne n'est connecté.
      router.push("/admin");
      router.refresh();
    } catch (probleme) {
      // Ici, la requête n'a même pas atteint Supabase : variables absentes,
      // adresse invalide, ou réseau coupé. On affiche le message réel — un
      // message générique fait perdre un temps fou en diagnostic.
      setErreur(
        `La requête n'a pas atteint Supabase (${probleme?.message || "cause inconnue"}). ` +
          "Vérifie que .env.local contient bien NEXT_PUBLIC_SUPABASE_URL et " +
          "NEXT_PUBLIC_SUPABASE_ANON_KEY, noms compris, puis redémarre le serveur."
      );
      console.error(probleme);
      setEnCours(false);
    }
  }

  return (
    <div className="connexion-page">
      <div className="connexion-boite">
        <h1>Administration</h1>
        <p className="intro">Réservé à Yves. Connecte-toi pour modifier le site.</p>

        {erreur ? <div className="message erreur">{erreur}</div> : null}

        <form onSubmit={soumettre}>
          <div className="champ">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="username"
              required
            />
          </div>

          <div className="champ">
            <label htmlFor="mdp">Mot de passe</label>
            <input
              id="mdp"
              type="password"
              value={motDePasse}
              onChange={(e) => setMotDePasse(e.target.value)}
              autoComplete="current-password"
              required
            />
          </div>

          <button type="submit" className="bouton" disabled={enCours} style={{ width: "100%" }}>
            {enCours ? "Connexion…" : "Se connecter"}
          </button>
        </form>
      </div>
    </div>
  );
}
