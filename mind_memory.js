// ===============================
// MIND MEMORY - VERSION 1
// Memoria temporal de una partida
// ===============================


const MindMemory = {
  
  
  datos: {
    
    conceptos: {},
    
    preguntas: []
    
  },
  
  
  // Guarda información aprendida
  guardar(concepto, respuesta) {
    
    
    this.datos.conceptos[concepto] = respuesta;
    
    
  },
  
  
  // Comprueba si ya sabe algo
  tiene(concepto) {
    
    
    return Object.prototype.hasOwnProperty.call(
      
      this.datos.conceptos,
      
      concepto
      
    );
    
    
  },
  
  
  // Obtiene información guardada
  obtener(concepto) {
    
    
    return this.datos.conceptos[concepto];
    
    
  },
  
  
  // Guarda una pregunta realizada
  registrarPregunta(pregunta, concepto, respuesta) {
    
    
    this.datos.preguntas.push({
      
      
      pregunta: pregunta,
      
      
      concepto: concepto,
      
      
      respuesta: respuesta
      
      
    });
    
    
  },
  
  obtenerEstado() {

  const estado = {};

  this.datos.preguntas.forEach(item => {

    if (!item.concepto) return;

    estado[item.concepto] = item.respuesta;

  });


  return estado;

},
  
  
  // Buscar una pregunta repetida
  buscarPregunta(pregunta) {
    
    
    return this.datos.preguntas.find(
      
      p => p.pregunta === pregunta
      
    );
    
    
  },
  
  
  // Mostrar memoria en consola
  mostrar() {
    
    
    console.log("=== MEMORIA MIND ===");
    
    
    console.log("CONCEPTOS:");
    
    console.table(this.datos.conceptos);
    
    
    console.log("PREGUNTAS:");
    
    console.table(this.datos.preguntas);
    
    
  },
  
  
  // Reiniciar partida
  limpiar() {
    
    
    this.datos = {
      
      
      conceptos: {},
      
      
      preguntas: []
      
      
    };
    
    
  }
  
  
};


// hacerlo visible para el juego

window.MindMemory = MindMemory;