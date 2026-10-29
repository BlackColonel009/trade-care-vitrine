# Déploiement sur Contabo Linux

## Mode recommandé : site statique avec Nginx

Le site n'a pas besoin de base de données ni de processus Python pour fonctionner.
Le dossier `dist/` contient la livraison complète. Le formulaire appelle l'API
Trade Care et se replie sur un e-mail préparé lorsque cette API est indisponible.

### 1. Préparer le serveur

```bash
sudo apt update
sudo apt install -y nginx certbot python3-certbot-nginx
sudo mkdir -p /var/www/trade-care-vitrine
sudo chown -R "$USER":www-data /var/www/trade-care-vitrine
```

Copier le dépôt dans `/var/www/trade-care-vitrine`, puis vérifier que ces fichiers
existent :

```bash
test -f /var/www/trade-care-vitrine/dist/index.html
test -f /var/www/trade-care-vitrine/dist/style.css
test -f /var/www/trade-care-vitrine/dist/app.js
```

### 2. Configurer Nginx

```bash
sudo cp deploy/nginx-static.conf.example /etc/nginx/sites-available/trade-care-vitrine
sudo nano /etc/nginx/sites-available/trade-care-vitrine
```

Remplacer les deux domaines d'exemple par le domaine réellement configuré dans
le DNS, puis :

```bash
sudo ln -s /etc/nginx/sites-available/trade-care-vitrine /etc/nginx/sites-enabled/trade-care-vitrine
sudo nginx -t
sudo systemctl reload nginx
```

### 3. Activer HTTPS

Le DNS A/AAAA doit déjà pointer vers le serveur Contabo.

```bash
sudo certbot --nginx -d tradecare.example -d www.tradecare.example
sudo certbot renew --dry-run
```

Remplacer les domaines par les valeurs réelles. Certbot ajoute automatiquement
la redirection HTTP vers HTTPS.

### 4. Vérifier

```bash
curl -I https://tradecare.example/
curl -I https://tradecare.example/style.css
```

En mode statique, la vérification de `/` suffit. Un monitoring peut utiliser
une requête HEAD sur la page d'accueil.

## Mode alternatif : FastAPI + Gunicorn

Utiliser ce mode uniquement si les templates doivent devenir dynamiques sur le
serveur.

```bash
cd /var/www/trade-care-vitrine
python3 -m venv .venv
.venv/bin/pip install --upgrade pip
.venv/bin/pip install -r requirements.txt
sudo cp deploy/trade-care-vitrine.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable --now trade-care-vitrine
curl http://127.0.0.1:8010/health
```

Installer ensuite `deploy/nginx-fastapi.conf.example` dans Nginx, remplacer le
domaine, exécuter `nginx -t`, recharger Nginx et lancer Certbot.

## Mise à jour ultérieure

Après un `git pull`, le mode statique ne demande qu'un rechargement du navigateur.
Si les sources ont changé mais pas `dist/`, reconstruire localement avant le push :

```bash
node build-content.cjs
node prerender.cjs
node check.cjs
node test-contact.cjs
```

Avec FastAPI, redémarrer aussi le service :

```bash
sudo systemctl restart trade-care-vitrine
sudo journalctl -u trade-care-vitrine -n 100 --no-pager
```

## Dépendance API à déployer

La section de téléchargement dépend de la migration API
`j7g8h9i0j1k2_app_download_settings.py` et de la route `/app-downloads/public`.
Sur le serveur API, exécuter après le `git pull` :

```bash
cd /var/www/tradecare-api
source venv/bin/activate
alembic upgrade head
sudo systemctl restart tradecare-api
curl https://trade-care.newtechnologiestg.com/app-downloads/public
```

Le nom exact du service systemd peut différer sur le serveur. La réponse doit
contenir les objets `android` et `windows` avant d’activer les liens depuis
l’application.

Le catalogue public répond déjà. Au 29 octobre 2026, la route
`/public/contact` renvoie encore `404` sur l'API de production. Le site reste
utilisable grâce au repli vers la messagerie, mais l'envoi direct depuis le
formulaire exige le déploiement de `app/routes/public_contact.py` dans l'API,
son inclusion dans `app/main.py`, puis le redémarrage de l'API.
