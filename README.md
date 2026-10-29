# Trade Care — Site vitrine

Site vitrine en français : accueil, guide de 13 rubriques, abonnements et contact.

## Arborescence d'intégration

Le dépôt fournit deux modes de déploiement synchronisés :

```text
trade-care-vitrine/
├── app/
│   ├── main.py
│   ├── templates/
│   │   ├── index.html
│   │   ├── fonctionnalites.html
│   │   ├── abonnements.html
│   │   └── contact.html
│   └── static/
│       ├── css/style.css
│       ├── js/app.js
│       ├── img/logo.png
│       └── data/
├── dist/                  # livraison statique
├── build-content.cjs
├── sync-fastapi.cjs
└── requirements.txt
```

`app/` suit la même organisation FastAPI/Jinja que le projet de référence
CarestoGo. `dist/` reste disponible pour un hébergement entièrement statique.

## Prévisualiser

Exécuter `node preview.cjs`, puis ouvrir http://127.0.0.1:4173.

Pour prévisualiser la version FastAPI :

```powershell
python -m pip install -r requirements.txt
uvicorn app.main:app --reload --port 4173
```

## Déployer sur Contabo

Le mode recommandé sert directement `dist/` avec Nginx : il est plus léger et
ne nécessite aucun processus Python permanent. Une configuration FastAPI avec
Gunicorn reste fournie pour une future version dynamique.

La procédure Linux complète, les configurations Nginx et le service systemd se
trouvent dans [DEPLOIEMENT_CONTABO.md](DEPLOIEMENT_CONTABO.md) et `deploy/`.

## Modifier et vérifier

Le contenu des pages se trouve dans `build-content.cjs`, les styles dans `dist/style.css`, et les interactions dans `dist/app.js`.
Après modification : `node build-content.cjs`, puis `node prerender.cjs`, puis `node check.cjs`.
La commande de construction régénère automatiquement les templates et les
ressources de `app/` afin d'éviter deux versions différentes du site.

## Abonnements

`dist/plans.json` est un instantané du catalogue public vérifié le 27 octobre 2026. Bronze Classic comprend 3 collaborateurs dans le catalogue en ligne, contrairement aux 2 de la migration initiale. La page tente une actualisation depuis `/subscriptions/plans/public` sur le domaine API de Trade Care, avec validation et repli sur cet instantané. Les tarifs sont également pré-rendus pour rester lisibles sans JavaScript. Le formulaire de contact prépare un e-mail dans la messagerie du visiteur ; aucun envoi serveur.

Les coordonnées et descriptions viennent du code de l’application. Les modules spécialisés dépendent du métier et des accès. Les conditions commerciales restent à confirmer avec l’équipe.

## Téléchargements Android et Windows

La page d’accueil charge les versions publiées depuis
`https://trade-care.newtechnologiestg.com/app-downloads/public`. Les liens ne
sont affichés que lorsqu’ils sont activés et utilisent HTTPS. Le super
administrateur les configure dans l’application Trade Care depuis
`Paramètres → Administration Trade Care → Téléchargements de l’application`.

La version, la taille, la date de publication, les notes et l’empreinte
SHA-256 sont également affichées lorsqu’elles sont renseignées. L’absence de
version ou une indisponibilité de l’API produit un état explicite sans exposer
de lien non vérifié.

## Contact direct

Le formulaire utilise la route publique /public/contact si elle est disponible. Sinon, il prépare un e-mail. Voir RACCORDEMENT_MESSAGERIE.md pour la configuration et la mise en service de la route API. Vérification : node test-contact.cjs.
