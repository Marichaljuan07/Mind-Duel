from flask import Flask, request, jsonify
from flask_cors import CORS
from datetime import datetime
import json
import os

app = Flask(__name__)

# Permite recibir peticiones desde Vercel u otros dominios
CORS(app)

ARCHIVO = "fallos_mind.json"


def cargar_datos():
    if not os.path.exists(ARCHIVO):
        return []

    with open(ARCHIVO, "r", encoding="utf-8") as f:
        return json.load(f)


def guardar_datos(datos):
    with open(ARCHIVO, "w", encoding="utf-8") as f:
        json.dump(
            datos,
            f,
            indent=2,
            ensure_ascii=False
        )


@app.route("/api/fallo", methods=["POST"])
def guardar_fallo():

    datos = request.json

    registro = {
        "pregunta": datos.get("pregunta"),
        "personaje": datos.get("personaje"),
        "fecha": datetime.now().isoformat()
    }

    lista = cargar_datos()

    lista.append(registro)

    guardar_datos(lista)

    return jsonify({
        "estado": "guardado"
    })


@app.route("/api/fallos", methods=["GET"])
def ver_fallos():

    return jsonify(cargar_datos())


@app.route("/", methods=["GET"])
def inicio():
    return jsonify({
        "estado": "MIND DATA SERVER activo"
    })


app.run(
    host="0.0.0.0",
    port=5000
)
