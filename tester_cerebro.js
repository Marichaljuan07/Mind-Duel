const Logic=require('./motor_logico.js'),Cerebro=require('./cerebro.js'),fs=require('fs'),vm=require('vm');
const ctx={};vm.createContext(ctx);vm.runInContext(fs.readFileSync('./personajes.js','utf8')+';globalThis.__P=PERSONAJES;',ctx);const P=ctx.__P,g=n=>P.find(x=>x.nombre===n);
const base=JSON.parse(fs.readFileSync('./oraculo_base_v3_2.json','utf8'));let fail=0;
const t=(n,got,exp)=>{const ok=got===exp;if(!ok)fail++;console.log(ok?'OK  ':'FAIL',n,'=>',got)};
t('50+ personajes',P.length>=50,true);t('sin nombres repetidos',new Set(P.map(p=>p.nombre)).size,P.length);
for(const p of P){const c=Logic.resolverConcepto('tipo_real',p);if(typeof c!=='boolean'){fail++;console.log('FAIL dato roto',p.nombre)}}
t('Legolas arco',Logic.resolverConcepto('tiene_arco',g('Legolas')),true);t('Einstein arco',Logic.resolverConcepto('tiene_arco',g('Albert Einstein')),false);
t('Gandhi pacifista',Logic.resolverConcepto('pacifista',g('Gandhi')),true);t('Aristóteles filósofo',Logic.resolverConcepto('filosofo',g('Aristóteles')),true);
t('Cleopatra reina',Logic.resolverConcepto('reina',g('Cleopatra')),true);t('Marie Curie nobel',Logic.resolverConcepto('premio_nobel',g('Marie Curie')),true);
(async()=>{
 const r1=await Cerebro.intentar('¿Fue una mente brilliante?',base);t('typo brilliante aprende',r1&&r1.concepto,'genio');t('marca aprendio',r1&&r1.aprendio,true);
 const r2=await Cerebro.intentar('¿Fue una mente brilliante?',base);t('segunda vez exacta',r2&&r2.aprendio,false);
 t('basura => null',await Cerebro.intentar('¿Le gusta la pizza con ananá?',base),null);
 Cerebro.ensenar('¿le dicen el sabio del tiempo?','genio');const r3=await Cerebro.intentar('le dicen el sabio del tiempo',base);t('enseñado a mano',r3&&r3.concepto,'genio');
 for(const[q,c]of[['¿Es un humano?','humano'],['¿Es una humana?','humano'],['¿Es europeo?','region_europa'],['¿Es un escritor?','escritor'],['¿Es un filósofo?','filosofo'],['¿Es un jedi?','jedi'],['¿Es de Marvel?','universo_marvel'],['¿Es un dibujo animado?','medio_animacion']]){const r=await Cerebro.intentar(q,base);t('frase "'+q+'"',r&&r.concepto,c)}
 console.log(fail?`\n${fail} FALLOS`:'\nTodo OK');process.exitCode=fail?1:0})();
