export default class Persona { 
    static contadorPersonas = 0;
    #id;
    #nombre;
    #cantPuntos;
    #tiempoTotal;


    constructor(nombre, cantPuntos = 0, tiempoTotal = 0) {
        this.#id = ++Persona.contadorPersonas;
        this.#nombre = nombre;
        this.#cantPuntos = cantPuntos;
        this.#tiempoTotal = tiempoTotal;
    }

    get id() {
        return this.#id;
    }

    get nombre() {
        return this.#nombre;
    }

    get cantPuntos() {
        return this.#cantPuntos;
    }

    get tiempoTotal() {
        return this.#tiempoTotal;
    }

    set nombre(nombre) {
        if (nombre.length > 0 && nombre.length < 20) {
            this.#nombre = nombre;
        }
    }

    set cantPuntos(cantPuntos) {
        if (cantPuntos > 0 && cantPuntos < 20) {
            this.#cantPuntos = cantPuntos;
        }
    }

    set tiempoTotal(tiempoTotal) {
        if (tiempoTotal > 0 && tiempoTotal < 30) {
            this.#tiempoTotal = tiempoTotal;
        }
    }

    toJSON() {
        return {
            id: this.#id,
            nombre: this.#nombre,
            cantPuntos: this.#cantPuntos,
            tiempoTotal: this.#tiempoTotal
        };
    }
}