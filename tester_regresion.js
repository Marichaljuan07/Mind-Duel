const Logic=require('./motor_logico.js');
const fs=require('fs'),vm=require('vm');
const code=fs.readFileSync('./personajes.js','utf8')+'\n;globalThis.__P=PERSONAJES;';
const ctx={};vm.createContext(ctx);vm.runInContext(code,ctx);const P=ctx.__P;
function get(n){return P.find(x=>x.nombre===n)}
const tests=[
 ['Einstein real','¿Es una persona real?',get('Albert Einstein'),true],
 ['Einstein mujer','¿Es una mujer?',get('Albert Einstein'),false],
 ['Leonardo artista','¿Es artista?',get('Leonardo da Vinci'),true],
 ['Messi científico','¿Es científico?',get('Lionel Messi'),false],
 ['Gandalf magia','¿Usa magia?',get('Gandalf'),true],
 ['Batman poderes','¿Tiene poderes?',get('Batman'),false],
 ['Hermione mujer','¿Es una mujer?',get('Hermione Granger'),true],
 ['typo peligroso','¿Es conocido como cientiffico?',get('Napoleón Bonaparte'),null]
];
let fail=0;for(const [name,q,p,expected] of tests){const got=Logic.evaluarPregunta(q,p);const ok=got===expected;console.log(ok?'OK  ':'FAIL',name,'=>',got);if(!ok)fail++;}
console.log(`\n${tests.length-fail}/${tests.length} controles correctos.`);process.exitCode=fail?1:0;
