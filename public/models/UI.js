export class  UI {
    constructor() {}

    mostrarPregunta(texto) {
        const tituloPregunta = document.getElementById('preguntas');
        tituloPregunta.innerHTML = texto;
    }  

    mostrarOpcioes(opciones, callback) {
        const containerOpciones = document.getElementById('opciones');
        containerOpciones.innerHTML = '';

        for (let i = 0; i < opciones.length; i++) {
            const btnOpcion = document.createElement('button');
            btnOpcion.textContent = opciones[i];
            btnOpcion.className = 'button';
            btnOpcion.addEventListener('click', () => callback(opciones[i]));
            containerOpciones.appendChild(btnOpcion);
        }
    }
}