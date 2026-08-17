import Revelation from "@/components/Revelation";
import ContactTelephone from "@/components/ContactTelephone";

/**
 * Section de contact.
 *
 * L'email reste écrit en clair : c'est le canal principal, et le rendre
 * difficile à copier coûterait plus cher que le spam évité. Le numéro,
 * lui, passe par ContactTelephone qui ne le livre pas dans le HTML.
 */
export default function Contact({ textes }) {
  return (
    <section id="contact" className="contact">
      <div className="wrap">
        <Revelation>
          <div className="sec-label">Contact</div>
          <h2>{textes.contact_titre}</h2>
          <p>{textes.contact_texte}</p>

          <a href={`mailto:${textes.email}`} className="btn btn-p">
            {textes.email}
          </a>

          <div className="socials">
            <a href={textes.github} target="_blank" rel="noopener noreferrer" className="social">
              GitHub
            </a>
            <ContactTelephone
              indicatif={textes.tel_indicatif}
              partie1={textes.tel_partie1}
              partie2={textes.tel_partie2}
            />
          </div>
        </Revelation>
      </div>
    </section>
  );
}
