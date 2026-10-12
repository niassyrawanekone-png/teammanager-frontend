import { Link } from "react-router-dom";

function Section({ title, children }) {
  return (
    <section className="space-y-3 rounded-2xl border border-[var(--tm-border)] bg-[var(--tm-surface)] p-5 shadow-sm sm:p-6">
      <h2 className="text-lg font-bold">{title}</h2>
      <div className="space-y-3 text-sm leading-6 text-[var(--tm-text-muted)]">{children}</div>
    </section>
  );
}

export default function PolitiqueConfidentialite() {
  return (
    <article className="mx-auto max-w-4xl space-y-6">
      <header className="space-y-4">
        <h1 className="text-3xl font-extrabold sm:text-4xl">Politique de confidentialité</h1>
        <p className="text-sm text-[var(--tm-text-muted)]">
          Dernière mise à jour : 11 octobre 2026
        </p>
        <p className="text-sm leading-6 text-[var(--tm-text-muted)]">
          Cette politique décrit les données traitées par TeamManager, une application de gestion
          d’équipes, de projets, de tâches et de discussions. Elle s’applique aux personnes qui
          utilisent le site et ses fonctions.
        </p>
      </header>

      <Section title="1. Responsable et contact">
        <p>
          Le responsable du traitement est <strong>Rawane Kone Niassy</strong>, qui exploite le
          service TeamManager.
        </p>
        <p>Adresse communiquée par le responsable : Pikine, 19176 Dakar, Sénégal.</p>
        <p>
          Pour toute question ou demande relative aux données personnelles, écrivez à{" "}
          <a className="break-all text-blue-700 underline dark:text-blue-300" href="mailto:niassyrawanekone@gmail.com">
            niassyrawanekone@gmail.com
          </a>
          . Une preuve d’identité proportionnée pourra être demandée pour éviter de communiquer des
          données à une personne non autorisée.
        </p>
      </Section>

      <Section title="2. Données traitées">
        <ul className="list-disc space-y-2 pl-5">
          <li>
            Compte : prénom, nom, adresse e-mail, mot de passe sous forme de hash, rôle, équipe,
            appartenance à un espace de travail et informations de session.
          </li>
          <li>
            Utilisation du service : projets, tâches, affectations, notifications, messages, dates
            et états de lecture.
          </li>
          <li>
            Contenus partagés : fichiers joints, notamment images et messages vocaux, ainsi que
            leur nom, type et date d’envoi.
          </li>
          <li>
            Sécurité et récupération de compte : empreintes cryptographiques de l’adresse e-mail et
            de l’adresse IP utilisées pour limiter les demandes de réinitialisation, ainsi que
            leurs dates. Les liens d’activation et de récupération sont à usage unique et expirent.
          </li>
          <li>
            Préférences du navigateur : thème, choix d’affichage, session et, lorsque cette
            fonction est utilisée, historique local de l’assistant IA.
          </li>
          <li>
            Données techniques de fonctionnement et de sécurité susceptibles d’être consignées par
            les hébergeurs, selon leurs propres politiques.
          </li>
        </ul>
        <p>
          Les mots de passe ne sont pas conservés en clair. Les jetons de session sont conservés
          dans le stockage du navigateur utilisé par l’application ; déconnectez-vous et évitez un
          appareil partagé pour limiter les accès non autorisés.
        </p>
      </Section>

      <Section title="3. Utilisation des données">
        <p>
          Les données sont utilisées pour créer et sécuriser les comptes, fournir les fonctions
          d’équipe, afficher les projets et tâches, permettre les discussions et pièces jointes,
          gérer les notifications, répondre aux demandes d’assistance et prévenir les abus.
        </p>
        <p>
          Les adresses e-mail sont saisies lors de l’inscription ou fournies par un responsable
          d’équipe qui envoie une invitation. Elles servent aux communications nécessaires au
          compte, notamment aux invitations et à la réinitialisation du mot de passe. TeamManager
          n’utilise pas de listes achetées et n’envoie pas de newsletters marketing dans le cadre
          des fonctions actuellement proposées.
        </p>
        <p>
          L’assistant IA n’est pas actuellement configuré pour traiter les demandes. S’il est
          activé ultérieurement, les messages et le contexte de projet explicitement sélectionné
          pourront être transmis au fournisseur IA configuré ; les informations correspondantes
          seront alors mises à jour avant cette activation.
        </p>
      </Section>

      <Section title="4. Base et caractère nécessaire du traitement">
        <p>
          Les données de compte et de travail sont nécessaires à la fourniture des fonctions
          demandées. Les données de sécurité sont utilisées pour protéger les comptes et le service.
          Les e-mails transactionnels sont nécessaires à l’inscription, aux invitations et à la
          récupération de compte. Les informations non nécessaires à ces fonctions ne doivent pas
          être ajoutées aux messages ou pièces jointes.
        </p>
        <p>
          Lorsque le droit applicable l’exige, le traitement repose sur la base légale pertinente
          pour la fonction concernée. Vous pouvez contacter le responsable pour obtenir des
          précisions sur une situation particulière.
        </p>
      </Section>

      <Section title="5. Hébergement et destinataires">
        <p>
          L’interface est hébergée par Vercel. L’API et la base de données sont hébergées par Render ;
          la région configurée pour ces ressources est Virginia, aux États-Unis. Ces prestataires
          peuvent traiter des données techniques nécessaires à l’hébergement, à la sécurité et au
          fonctionnement du service, conformément à leurs conditions et politiques.
        </p>
        <p>
          Mailjet n’est pas encore activé pour TeamManager. S’il est configuré, il recevra les
          adresses des destinataires et le contenu strictement nécessaire à l’envoi des e-mails
          transactionnels. Les données ne sont pas vendues. Elles ne sont communiquées à d’autres
          personnes que lorsque cela est nécessaire au service, requis par la loi ou autorisé par
          la personne concernée.
        </p>
        <p>
          L’hébergement hors du pays de résidence peut entraîner un transfert international de
          données. Les informations de localisation, garanties et sous-traitants applicables
          dépendent des services effectivement activés et de leurs conditions en vigueur.
        </p>
      </Section>

      <Section title="6. Durée de conservation et suppression">
        <p>
          Les données de compte et de travail sont conservées pendant l’utilisation du compte.
          Pour demander l’accès, la rectification ou la suppression d’un compte et des données
          associées, contactez le responsable à l’adresse indiquée à la section 1. Les demandes sont
          examinées et traitées après vérification raisonnable de l’identité et des droits sur le
          compte.
        </p>
        <p>
          Certaines données peuvent devoir être conservées pour satisfaire une obligation légale,
          résoudre un litige ou protéger le service. Des copies techniques peuvent subsister pendant
          le cycle de sauvegarde des hébergeurs ; leur suppression suit les délais et modalités
          prévus par leurs services.
        </p>
      </Section>

      <Section title="7. Sécurité">
        <p>
          TeamManager applique notamment le hachage des mots de passe, des contrôles d’accès par
          espace de travail, des liens d’activation et de récupération à usage limité, et des
          échanges HTTPS entre le navigateur et le service. Aucun système n’étant infaillible,
          veuillez éviter de transmettre des données sensibles dans les discussions ou pièces
          jointes.
        </p>
      </Section>

      <Section title="8. Vos demandes et droits">
        <p>
          Selon le droit applicable, vous pouvez demander l’accès à vos données, leur rectification
          ou suppression, la limitation de certains traitements, vous y opposer ou demander leur
          portabilité lorsque ce droit s’applique. Pour exercer ces droits, écrivez à{" "}
          <a className="break-all text-blue-700 underline dark:text-blue-300" href="mailto:niassyrawanekone@gmail.com">
            niassyrawanekone@gmail.com
          </a>
          , en précisant votre demande et le compte concerné.
        </p>
        <p>
          Vous pouvez également saisir l’autorité de contrôle compétente selon votre lieu de
          résidence et la législation applicable.
        </p>
      </Section>

      <Section title="9. Modifications">
        <p>
          Cette politique peut être mise à jour si les fonctions, les prestataires ou les
          obligations applicables évoluent. La date de dernière mise à jour figure en haut de la
          page.
        </p>
      </Section>

      <p className="text-sm text-[var(--tm-text-muted)]">
        Cette information décrit les pratiques actuellement connues de TeamManager et ne remplace
        pas un avis juridique.{" "}
        <Link className="font-medium text-blue-700 underline dark:text-blue-300" to="/">
          Retour à l’accueil
        </Link>
      </p>
    </article>
  );
}
