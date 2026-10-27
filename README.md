# Trade Care — Site vitrine

Site statique en français : accueil, guide de 13 rubriques, abonnements et contact.

## Prévisualiser

Exécuter `node preview.cjs`, puis ouvrir http://127.0.0.1:4173.

## Modifier et vérifier

Le contenu des pages se trouve dans `build-content.cjs`, les styles dans `dist/style.css`, et les interactions dans `dist/app.js`.
Après modification : `node build-content.cjs`, puis `node prerender.cjs`, puis `node check.cjs`.

## Abonnements

`dist/plans.json` est un instantané du catalogue public vérifié le 27 octobre 2026. Bronze Classic comprend 3 collaborateurs dans le catalogue en ligne, contrairement aux 2 de la migration initiale. La page tente une actualisation depuis `/subscriptions/plans/public` sur le domaine API de Trade Care, avec validation et repli sur cet instantané. Les tarifs sont également pré-rendus pour rester lisibles sans JavaScript. Le formulaire de contact prépare un e-mail dans la messagerie du visiteur ; aucun envoi serveur.

Les coordonnées et descriptions viennent du code de l’application. Les modules spécialisés dépendent du métier et des accès. Les conditions commerciales restent à confirmer avec l’équipe.

## Contact direct

Le formulaire utilise la route publique /public/contact si elle est disponible. Sinon, il prépare un e-mail. Voir RACCORDEMENT_MESSAGERIE.md pour la configuration et la mise en service de la route API. Vérification : node test-contact.cjs.
