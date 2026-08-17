/**
 * Bandeau de retour après une action.
 *
 * Les actions serveur renvoient vers la page avec ?succes=... ou
 * ?erreur=... dans l'adresse. C'est le moyen le plus simple d'afficher un
 * message sans avoir à gérer d'état côté navigateur : un formulaire HTML
 * ordinaire suffit, et ça continue de fonctionner même si le JavaScript
 * de la page n'a pas encore été chargé.
 */
export default function MessageAdmin({ parametres }) {
  const succes = parametres?.succes;
  const erreur = parametres?.erreur;

  if (!succes && !erreur) return null;

  return (
    <div className={erreur ? "message erreur" : "message succes"}>
      {erreur || succes}
    </div>
  );
}
