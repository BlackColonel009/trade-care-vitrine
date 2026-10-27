# Messagerie du site Trade Care

Mis à jour le 27 octobre 2026.

Le propriétaire a indiqué que contact@tradecare.app n’existe pas encore et a demandé d’utiliser imlogang009@gmail.com à sa place.

## Modifications appliquées

- Adresse affichée et liens e-mail du site : imlogang009@gmail.com.
- Formulaire : préparation d’un e-mail vers cette adresse dans la messagerie du visiteur.
- Écrans Contact, À propos et Confidentialité de l’application : adresse remplacée.
- Aucun envoi automatique ni secret SMTP ajouté au site.

## Service existant dans l’API

`app/core/mail.py` fournit `send_email_message`. La configuration SMTP est renseignée localement et chargée côté serveur. Les demandes d’abonnement existantes requièrent une connexion ; aucune route de contact public n’est disponible en production.

Le contrôle automatique d’approbation a refusé l’ajout d’une route publique d’envoi. Il demande une autorisation explicite pour transmettre nom, e-mail, entreprise et message des visiteurs au destinataire. Aucun changement n’a été appliqué à l’API.

L’envoi direct nécessitera cette autorisation, puis l’implémentation et le déploiement de la route sur le serveur API. Les tests devront simuler SMTP et vérifier les erreurs sans envoyer de messages réels.
