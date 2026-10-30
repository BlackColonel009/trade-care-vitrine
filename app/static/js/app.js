const menu=document.querySelector('.menu-toggle');menu?.addEventListener('click',()=>{const n=document.querySelector('nav');const open=n.classList.toggle('open');menu.setAttribute('aria-expanded',String(open));menu.setAttribute('aria-label',open?'Fermer la navigation':'Ouvrir la navigation')});
document.querySelectorAll('nav a').forEach(a=>a.addEventListener('click',()=>{document.querySelector('nav').classList.remove('open');menu?.setAttribute('aria-expanded','false')}));
const escapeHtml=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const TRADE_CARE_API='https://trade-care.newtechnologiestg.com';
const money=n=>new Intl.NumberFormat('fr-FR',{maximumFractionDigits:0}).format(n);let plans=[],labels={},cycle='monthly';const quota=n=>n===null?'Illimité':money(n);const capacity=(n,singular,plural=singular+'s')=>n===null?plural+' illimités':money(n)+' '+(n===1?singular:plural);
function renderPlans(){const cards=document.getElementById('plan-cards');if(!cards)return;cards.innerHTML=plans.map((p,i)=>`<article class="plan ${p.is_featured?'featured':''}">${p.is_featured?'<span class="recommend">OFFRE MISE EN AVANT</span>':''}<div class="plan-tier">FORMULE ${String(i+1).padStart(2,'0')}</div><h3>${escapeHtml(p.name)}</h3><p>${escapeHtml(p.description)}</p><div class="price">${money(cycle==='annual'?p.annual_price:p.monthly_price)} <small>${escapeHtml(p.currency==='XOF'?'FCFA':p.currency)}</small></div><div class="period">${p.monthly_price===0?'Gratuit, sans échéance':cycle==='annual'?'par an · total facturé annuellement':'par mois'}</div><a class="btn" href="/contact?offre=${encodeURIComponent(p.name)}&cycle=${cycle}">${p.monthly_price===0?'Découvrir cette formule':'Demander cette offre'} ↗</a><h4>Votre capacité de gestion</h4><ul class="checks"><li>${p.max_enterprises===null?'Entreprises illimitées':capacity(p.max_enterprises,'entreprise')}</li><li>${p.max_sub_users===0?'Aucun collaborateur supplémentaire':quota(p.max_sub_users)+' collaborateurs'}</li><li>${capacity(p.max_products,'produit')}</li><li>${capacity(p.max_clients,'client')}</li><li>${p.max_invoices_per_month===null?'Factures illimitées':money(p.max_invoices_per_month)+' factures / mois'}</li><li>${p.max_invoice_shares_per_month===null?'Partages de factures illimités':money(p.max_invoice_shares_per_month)+' partages de factures / mois'}</li></ul><h4>Fonctionnalités incluses</h4><ul class="checks">${p.features.map(f=>`<li>${escapeHtml(labels[f]||f)}</li>`).join('')}</ul><a class="plan-more" href="#comparatif">Comparer en détail ↓</a></article>`).join('');
const limits=[['Entreprises au total','max_enterprises'],['Collaborateurs supplémentaires','max_sub_users'],['Produits','max_products'],['Clients','max_clients'],['Factures par mois','max_invoices_per_month'],['Partages de factures par mois','max_invoice_shares_per_month']];const all=[...new Set(plans.flatMap(p=>p.features))];document.getElementById('comparison').innerHTML=`<thead><tr><th scope="col">Capacités & fonctionnalités</th>${plans.map(p=>`<th scope="col">${escapeHtml(p.name)}</th>`).join('')}</tr></thead><tbody><tr class="category"><th colspan="${plans.length+1}">Volumes inclus</th></tr>${limits.map(([label,key])=>`<tr><th scope="row">${label}</th>${plans.map(p=>`<td>${quota(p[key])}</td>`).join('')}</tr>`).join('')}<tr class="category"><th colspan="${plans.length+1}">Fonctionnalités incluses</th></tr>${all.map(f=>`<tr><th scope="row">${escapeHtml(labels[f]||f)}</th>${plans.map(p=>`<td>${p.features.includes(f)?'<span class="yes" aria-label="Inclus">✓</span>':'<span class="no" aria-label="Non inclus">—</span>'}</td>`).join('')}</tr>`).join('')}</tbody>`;
}
function validCatalog(data){return Array.isArray(data)&&data.length>0&&data.every(p=>typeof p.name==='string'&&typeof p.description==='string'&&typeof p.currency==='string'&&['monthly_price','annual_price'].every(k=>typeof p[k]==='number'&&Number.isFinite(p[k])&&p[k]>=0)&&['max_products','max_clients','max_sub_users','max_enterprises','max_invoices_per_month','max_invoice_shares_per_month'].every(k=>p[k]===null||(Number.isInteger(p[k])&&p[k]>=0))&&Array.isArray(p.features)&&p.features.every(f=>typeof f==='string'))}
async function fetchPublicPlans(){const r=await fetch(`${TRADE_CARE_API}/subscriptions/plans/public`,{cache:'no-store',headers:{Accept:'application/json'},signal:AbortSignal.timeout(7000)});if(!r.ok)throw Error('remote');const live=await r.json();if(!validCatalog(live))throw Error('schema');const active=live.filter(p=>p.is_active!==false).sort((a,b)=>(a.sort_order??0)-(b.sort_order??0)||a.monthly_price-b.monthly_price);if(!active.length)throw Error('empty');return active}
async function loadPlans(){const status=document.getElementById('catalog-status');try{const labelResponse=await fetch('/static/data/catalog-labels.json',{cache:'no-store'});labels=labelResponse.ok?await labelResponse.json():{};plans=await fetchPublicPlans();renderPlans();const lastUpdate=plans.map(p=>new Date(p.updated_at)).filter(d=>!Number.isNaN(d.getTime())).sort((a,b)=>b-a)[0];status.textContent='Offres synchronisées avec l’administration Trade Care'+(lastUpdate?' · mises à jour le '+lastUpdate.toLocaleDateString('fr-FR'):'')+'.';}catch{try{const responses=await Promise.all([fetch('/static/data/plans.json',{cache:'no-store'}),fetch('/static/data/catalog-labels.json',{cache:'no-store'})]);if(responses.some(r=>!r.ok))throw Error('catalog');[plans,labels]=await Promise.all(responses.map(r=>r.json()));plans=plans.map(p=>({...p,max_invoice_shares_per_month:p.max_invoice_shares_per_month??null}));renderPlans();status.textContent='Le service des offres est momentanément indisponible · catalogue de secours affiché.';}catch{document.getElementById('plan-cards').innerHTML='<p>Le catalogue ne peut pas être chargé. <a href="/contact">Contactez Trade Care pour connaître les offres.</a></p>';status.textContent='Impossible de vérifier les offres actuellement.'}}}
if(document.getElementById('plan-cards'))loadPlans();document.querySelectorAll('[data-cycle]').forEach(b=>b.addEventListener('click',()=>{cycle=b.dataset.cycle;document.querySelectorAll('[data-cycle]').forEach(x=>{x.classList.toggle('active',x===b);x.setAttribute('aria-pressed',String(x===b))});renderPlans()}));
const form=document.getElementById('contact-form');
if(form){
 const endpoint=`${TRADE_CARE_API}/public/contact`;
 const recipient='imlogang009@gmail.com';
 const params=new URLSearchParams(location.search);
 const offer=params.get('offre');
 if(offer&&[...form.elements.plan.options].some(o=>o.value===offer))form.elements.plan.value=offer;
 async function syncContactPlanOptions(){
  try{
   const publicPlans=await fetchPublicPlans();
   const select=form.elements.plan;
   const selected=offer||select.value;
   select.replaceChildren(new Option('À définir ensemble','À définir ensemble'),...publicPlans.map(plan=>new Option(plan.name,plan.name)));
   if([...select.options].some(option=>option.value===selected))select.value=selected;
  }catch{}
 }
 syncContactPlanOptions();
 const submit=form.querySelector('button[type="submit"]');
 const status=document.getElementById('form-status');
 const mode=document.getElementById('contact-mode');
 let direct=false,ready=false,busy=false;
 const billing=['annual','monthly'].includes(params.get('cycle'))?params.get('cycle'):'unspecified';
 function emailLink(d){
  const subject=`Trade Care — ${d.get('plan')} — ${d.get('company')||d.get('name')}`;
  const body=`Bonjour,\n\nJe souhaite échanger sur Trade Care.\n\nNom : ${d.get('name')}\nE-mail : ${d.get('email')}\nEntreprise : ${d.get('company')}\nActivité : ${d.get('business')}\nOffre : ${d.get('plan')}\nPériodicité : ${billing==='annual'?'annuelle':billing==='monthly'?'mensuelle':'à préciser'}\n\n${d.get('message')}\n\nCordialement,\n${d.get('name')}`;
  return `mailto:${recipient}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
 }
 function fallback(text,url){
  status.replaceChildren(document.createTextNode(text+' '));
  const a=document.createElement('a');a.href=url;a.className='download-link';a.textContent='Ouvrir mon e-mail préparé';
  status.append(a,document.createTextNode(' ou contactez-nous sur WhatsApp.'));
 }
 async function detect(){
  try{const r=await fetch(endpoint,{signal:AbortSignal.timeout(5000)});if(r.ok){const data=await r.json();direct=data.available===true}}catch{}
  ready=true;submit.disabled=false;
  submit.textContent=direct?'Envoyer ma demande ↗':'Préparer mon e-mail ↗';
  mode.textContent=direct?'Votre demande sera transmise à l’équipe Trade Care.':'Le service d’envoi direct est indisponible. Préparez votre demande dans votre messagerie.';
 }
 detect();
 form.addEventListener('submit',async e=>{
  e.preventDefault();if(!ready||busy||!form.reportValidity())return;
  const d=new FormData(form);const url=emailLink(d);
  if(d.get('website')){status.textContent='Demande invalide.';return}
  if(!direct){location.href=url;fallback('Votre e-mail est prêt. Envoyez-le depuis votre messagerie.',url);return}
  busy=true;submit.disabled=true;submit.textContent='Envoi en cours…';status.textContent='Transmission de votre demande…';
  try{
   const payload=Object.fromEntries(['name','email','company','business','plan','message','website'].map(k=>[k,String(d.get(k)||'').trim()]));
   payload.billing_cycle=billing;payload.consent=form.elements.consent.checked;
   const r=await fetch(endpoint,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload),signal:AbortSignal.timeout(35000)});
   const result=await r.json().catch(()=>({}));
   if(!r.ok||result.status!=='sent'){
    const message=r.status===429?'Trop de demandes. Patientez avant de réessayer.':r.status===422?'Vérifiez les champs du formulaire.':'L’envoi n’a pas pu être confirmé. Vérifiez votre réception avant de réessayer.';
    fallback(message,url);return;
   }
   status.textContent='Votre demande a été transmise. Référence : '+String(result.reference||'')+'. Merci, l’équipe pourra vous répondre à l’adresse indiquée.';
   form.reset();
  }catch{fallback('L’envoi n’a pas pu être confirmé. Vérifiez votre réception avant de réessayer.',url)}
  finally{busy=false;submit.disabled=false;submit.textContent='Envoyer ma demande ↗'}
 });
}

const downloadCards=document.getElementById('download-cards');
if(downloadCards){
 const downloadStatus=document.getElementById('download-status');
 const platformDetails={
  android:{title:'Trade Care pour Android',subtitle:'Application Android · fichier APK',icon:'◆',action:'Télécharger l’APK'},
  windows:{title:'Trade Care pour Windows',subtitle:'Application de bureau · Windows',icon:'▦',action:'Télécharger pour Windows'}
 };
 const validRelease=(value,platform)=>value&&typeof value==='object'&&value.platform===platform&&typeof value.enabled==='boolean';
 const safeHttps=value=>{try{const url=new URL(String(value));return url.protocol==='https:'?url.href:null}catch{return null}};
 const dateLabel=value=>{const date=new Date(value);return Number.isNaN(date.getTime())?'':date.toLocaleDateString('fr-FR',{day:'2-digit',month:'long',year:'numeric'})};
 function releaseCard(platform,release){
  const details=platformDetails[platform];
  const url=safeHttps(release.download_url);
  if(!release.enabled||!url)return '';
  const meta=[];
  if(release.version)meta.push('Version '+escapeHtml(release.version));
  if(release.file_size_label)meta.push(escapeHtml(release.file_size_label));
  if(release.published_at)meta.push(dateLabel(release.published_at));
  const checksum=typeof release.sha256==='string'&&/^[0-9a-f]{64}$/i.test(release.sha256)?release.sha256.toLowerCase():'';
  return `<article class="download-card"><div class="download-card-head"><span class="download-icon" aria-hidden="true">${details.icon}</span><div><small>${details.subtitle}</small><h3>${details.title}</h3></div></div>${meta.length?`<p class="download-meta">${meta.filter(Boolean).join(' · ')}</p>`:''}${release.release_notes?`<p class="download-notes">${escapeHtml(release.release_notes)}</p>`:''}<a class="btn" href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer">${details.action} <span>↓</span></a>${checksum?`<details class="checksum"><summary>Vérifier l’intégrité du fichier</summary><code>${checksum}</code></details>`:''}</article>`;
 }
 async function loadDownloads(){
  try{
   const response=await fetch(`${TRADE_CARE_API}/app-downloads/public`,{cache:'no-store',signal:AbortSignal.timeout(6000)});
   if(!response.ok)throw Error('remote');
   const data=await response.json();
   if(!validRelease(data.android,'android')||!validRelease(data.windows,'windows'))throw Error('schema');
   const cards=['android','windows'].map(platform=>releaseCard(platform,data[platform])).filter(Boolean);
   downloadCards.innerHTML=cards.length?cards.join(''):'<div class="download-empty"><span>↗</span><h3>Les téléchargements seront bientôt disponibles.</h3><p>Les versions publiques ne sont pas encore activées. Contactez Trade Care si vous souhaitez être prévenu.</p><a class="text-link" href="/contact">Contacter l’équipe →</a></div>';
   downloadStatus.textContent=cards.length?'Téléchargez uniquement depuis cette page officielle. Vérifiez la version et l’empreinte SHA-256 lorsqu’elle est fournie.':'Aucune version publique activée pour le moment.';
  }catch{
   downloadCards.innerHTML='<div class="download-empty"><span>!</span><h3>Impossible de vérifier les téléchargements.</h3><p>Le service est momentanément indisponible. Aucun lien non vérifié ne sera proposé.</p><a class="text-link" href="/contact">Contacter Trade Care →</a></div>';
   downloadStatus.textContent='Réessayez plus tard ou contactez l’équipe Trade Care.';
  }finally{downloadCards.setAttribute('aria-busy','false')}
 }
 loadDownloads();
}
