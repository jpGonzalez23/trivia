export class Pregunta {
    constructor(pregunta, opciones, correcta) {
        this.pregunta = pregunta;
        this.opciones = opciones;
        this.correcta = correcta;
    } 

    respuestaCorrecta(opcion) {
        return opcion === this.correcta;
    }
}