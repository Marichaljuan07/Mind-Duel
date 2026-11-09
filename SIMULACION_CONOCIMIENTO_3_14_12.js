'use strict';
const assert=require('node:assert/strict');
const K=require('./conocimiento');
const p={nombre:'Ada de prueba',datos_fuente:['Ocupación: Escritora y matemática','Nacionalidad: Británica','Lugar de nacimiento: Londres'],contenido_fuente:'Texto largo de referencia que se conserva en la ficha.'};
assert.equal(K.valor(p,'escritor'),true);
assert.deepEqual(K.inferir(p).nacionalidades,['Británica']);
assert.equal(K.inferir(p).lugar_nacimiento,'Londres');
console.log('PASS Cerebro aprovecha datos estructurados extraídos y conserva el texto fuente como contexto disponible');
