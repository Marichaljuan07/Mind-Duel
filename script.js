// MIND DUEL - JS REPARADO
(() => {
'use strict';

const MAX_QUESTIONS = 20;
const MAX_GUESSES = 2;
const MIND_API_URL = "https://mind-duel-jxu8.onrender.com";

const state = {
  active:false,
  busy:false,
  questionCount:0,
  secret:null
};


function lockInput(value){
  state.busy=value;

  const input=document.getElementById("questionInput");
  const send=document.getElementById("sendBtn");

  if(input) input.disabled=value;
  if(send) send.disabled=value;
}


function addMessage(text,kind="system"){

  const chat=document.getElementById("chat");

  if(!chat) return;

  const row=document.createElement("div");

  row.className="message message-"+kind;

  row.textContent =
    (kind==="player" ? "TÚ: " :
    kind==="mind" ? "MIND: " : "")
    + text;

  chat.appendChild(row);

  chat.scrollTop=chat.scrollHeight;
}


function normalize(text){

  return String(text)
  .toLowerCase()
  .normalize("NFD")
  .replace(/[\u0300-\u036f]/g,"")
  .trim();

}



async function askQuestion(question){

  if(!state.active || state.busy) return;


  const clean=normalize(question);


  if(!clean) return;


  state.questionCount++;


  addMessage(question,"player");


  lockInput(true);



  try{


    let answer=null;



    // Usa MindLogic si existe
    if(typeof MindLogic !== "undefined" &&
       typeof MindLogic.responder==="function"){

        answer = await MindLogic.responder(
          clean,
          state.secret
        );

    }



    // Si no sabe responder
    if(answer===null){


      addMessage(
        "NO LO SÉ. Reformula la pregunta.",
        "mind"
      );



      fetch(`${MIND_API_URL}/api/fallo`,{

        method:"POST",

        headers:{
          "Content-Type":"application/json"
        },

        body:JSON.stringify({

          pregunta:clean,

          personaje:
          state.secret?.nombre || "desconocido"

        })

      })
      .then(res=>{

        console.info(
          "[MIND DATA]",
          res.ok ? "Fallo enviado" : "Error"
        );

      })
      .catch(err=>{

        console.info(
          "[MIND DATA ERROR]",
          err
        );

      });



      return;

    }



    // Respuesta normal

    addMessage(
      answer ? "Sí." : "No.",
      "mind"
    );



  }catch(error){


    console.error(
      "[MIND ERROR]",
      error
    );


    addMessage(
      "Error del sistema. Intenta otra pregunta.",
      "mind"
    );


  }finally{


    lockInput(false);


  }

}



window.askQuestion = askQuestion;



})();
