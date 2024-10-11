export default class Persona { 
    #id;
    #nombre;
    #cantPuntos;
    #tiempoTotal;


    constructor(id, nombre, cantPuntos, tiempoTotal) {
        this.#id = id;
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
        if (cantPuntos > 0 && cantPuntos < 100) {
            this.#cantPuntos = cantPuntos;
        }
    }

    set tiempoTotal(tiempoTotal) {
        if (tiempoTotal > 0 && tiempoTotal < 100) {
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