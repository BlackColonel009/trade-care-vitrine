const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');
const script=fs.readFileSync(__dirname+'/dist/app.js','utf8');
async function scenario(available,statusCode=200,networkError=false){
 let handler,reset=false;const calls=[];const values={name:'Visiteur test',email:'visitor@example.com',company:'Entreprise test',business:'Commerce',plan:'Or',message:'Demande de démonstration',website:''};
 const button={disabled:true,textContent:''},status={textContent:'',replaceChildren(...nodes){this.textContent=nodes.join('')},append(...nodes){this.textContent+=nodes.map(n=>typeof n==='string'?n:n.textContent).join('')}},mode={textContent:''};
 const form={elements:{plan:{options:[{value:'Or'}]},consent:{checked:true}},querySelector:()=>button,reportValidity:()=>true,reset(){reset=true},addEventListener:(name,fn)=>{handler=fn}};
 const document={querySelector:()=>null,querySelectorAll:()=>[],getElementById:id=>id==='contact-form'?form:id==='form-status'?status:id==='contact-mode'?mode:null,createTextNode:s=>s,createElement:()=>({})};
 const location={search:'?offre=Or&cycle=annual',href:''};
 class FormData{get(k){return values[k]}}
 const fetch=async(url,options={})=>{calls.push(options);if(options.method==='POST'){if(networkError)throw Error('network');return {ok:statusCode===200,status:statusCode,json:async()=>({status:'sent',reference:'test-ref'})}}return {ok:available,json:async()=>({available})}};
 const ctx={document,location,FormData,fetch,URLSearchParams,Intl,AbortSignal};vm.createContext(ctx);vm.runInContext(script,ctx);await new Promise(r=>setImmediate(r));assert.equal(button.disabled,false);await handler({preventDefault(){}});return {calls,status,location,reset,button};
}
(async()=>{let r=await scenario(false);assert.equal(r.calls.length,1);assert.ok(r.location.href.startsWith('mailto:imlogang009@gmail.com'));r=await scenario(true);assert.equal(r.calls.length,2);const body=JSON.parse(r.calls[1].body);assert.equal(body.consent,true);assert.equal(body.billing_cycle,'annual');assert.ok(r.status.textContent.includes('test-ref'));assert.equal(r.reset,true);r=await scenario(true,503);assert.equal(r.reset,false);assert.ok(r.status.textContent.includes('pas pu être confirmé'));r=await scenario(true,429);assert.ok(r.status.textContent.includes('Trop de demandes'));r=await scenario(true,200,true);assert.equal(r.reset,false);assert.equal(r.button.disabled,false);console.log('Contact OK : envoi simulé, consentement, annualité, erreur SMTP, limite 429, coupure réseau et repli e-mail.');})().catch(e=>{console.error(e);process.exitCode=1});
