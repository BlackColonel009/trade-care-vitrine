const fs = require('fs');
const path = require('path');

const root = __dirname;
const dist = path.join(root, 'dist');
const app = path.join(root, 'app');
const templates = path.join(app, 'templates');
const staticRoot = path.join(app, 'static');
const css = path.join(staticRoot, 'css');
const js = path.join(staticRoot, 'js');
const img = path.join(staticRoot, 'img');
const data = path.join(staticRoot, 'data');

const pages = [
  'index.html',
  'fonctionnalites.html',
  'abonnements.html',
  'contact.html',
];

function ensureDirectories() {
  [templates, css, js, img, data].forEach((directory) => {
    fs.mkdirSync(directory, { recursive: true });
  });
}

function adaptTemplate(html) {
  return html
    .replaceAll('href="assets/logo.png"', 'href="/static/img/logo.png"')
    .replaceAll('src="assets/logo.png"', 'src="/static/img/logo.png"')
    .replaceAll('href="style.css"', 'href="/static/css/style.css"')
    .replaceAll('src="app.js', 'src="/static/js/app.js')
    .replaceAll('href="index.html', 'href="/')
    .replaceAll('href="fonctionnalites.html', 'href="/fonctionnalites')
    .replaceAll('href="abonnements.html', 'href="/abonnements')
    .replaceAll('href="contact.html', 'href="/contact');
}

function adaptJavascript(source) {
  return source
    .replaceAll("fetch('plans.json'", "fetch('/static/data/plans.json'")
    .replaceAll(
      "fetch('catalog-labels.json'",
      "fetch('/static/data/catalog-labels.json'",
    )
    .replaceAll('href="contact.html?', 'href="/contact?')
    .replaceAll('href="contact.html"', 'href="/contact"');
}

function syncFastApiApp() {
  ensureDirectories();

  for (const page of pages) {
    const source = path.join(dist, page);
    if (!fs.existsSync(source)) {
      throw new Error(`Page statique introuvable : ${source}`);
    }
    fs.writeFileSync(
      path.join(templates, page),
      adaptTemplate(fs.readFileSync(source, 'utf8')),
      'utf8',
    );
  }

  fs.copyFileSync(path.join(dist, 'style.css'), path.join(css, 'style.css'));
  fs.writeFileSync(
    path.join(js, 'app.js'),
    adaptJavascript(fs.readFileSync(path.join(dist, 'app.js'), 'utf8')),
    'utf8',
  );
  fs.copyFileSync(
    path.join(dist, 'assets', 'logo.png'),
    path.join(img, 'logo.png'),
  );
  for (const file of ['plans.json', 'catalog-labels.json']) {
    fs.copyFileSync(path.join(dist, file), path.join(data, file));
  }

  console.log('Structure FastAPI/Jinja synchronisee dans app/.');
}

if (require.main === module) syncFastApiApp();

module.exports = syncFastApiApp;
