# Contact du site vitrine

Destinataire autorisé : imlogang009@gmail.com. Le propriétaire a explicitement autorisé le transfert du nom, de l’e-mail, de l’entreprise et du message des visiteurs le 27 octobre 2026.

## État

`GET /public/contact` annonce la disponibilité. `POST /public/contact` utilise le service SMTP existant et le destinataire configuré par CONTACT_EMAIL (par défaut imlogang009@gmail.com). Aucun secret SMTP n’est transmis au site.

Le site vérifie la disponibilité avant de proposer un envoi direct. Si la route est absente, il prépare un e-mail dans la messagerie du visiteur. En cas d’échec ou de résultat incertain, les champs sont conservés et un lien e-mail est proposé ; aucune réussite n’est annoncée.

## Activation serveur

Déployer dans projet_delta_api les fichiers app/config.py, app/main.py et app/routes/public_contact.py. Vérifier MAIL_ENABLED et les réglages SMTP de production. CONTACT_EMAIL=imlogang009@gmail.com permet de fixer le destinataire. Redémarrer le service API selon la procédure de l’hébergeur. Aucune migration de base de données requise.

Vérifier GET https://trade-care.newtechnologiestg.com/public/contact : réponse attendue {"available":true}. Cela indique une configuration activée, sans garantir la remise SMTP ou le classement dans la boîte destinataire.

Protection : trois tentatives par adresse en dix minutes, soixante par heure par processus, validation des champs, consentement obligatoire, champ anti-robot, contenu HTML échappé et destinataire fixe. Pour plusieurs workers, compléter par une limite partagée au proxy ; vérifier les proxys de confiance sans accepter aveuglément les en-têtes des visiteurs.

## Validation

Cinq tests API réussis avec SMTP simulé : python -m unittest tests.test_public_contact -v. Contrôles site : node check.cjs, node test-contact.cjs, et contrôle visuel. Aucun e-mail réel envoyé.

La procédure et les accès de déploiement de l’API restent à fournir. Le code local est prêt ; la route doit encore être déployée sur le serveur.
