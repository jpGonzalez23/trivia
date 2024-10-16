//@ts-check
import { Pregunta } from "./Pregunta.js";

export class Quiz {
    preguntaIndex = 0;
    puntaje = 0;
    constructor(preguntas) {
        this.preguntas = preguntas;
    }

    getPreguntaIndex() {
        return this.preguntas[this.preguntaIndex];
    }

    preguntaFinalizadas() { 
        return this.preguntas.length === this.preguntaIndex;
    }

    adivinar(respuesta) {
        if(this.getPreguntaIndex().respuestaCorrecta(respuesta)) {
            this.puntaje++;
        }
        this.preguntaIndex++;
    }
}