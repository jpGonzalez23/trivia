import { Persona } from './models/persona.js';
import { preguntas } from '../public/data/preguntas.js';
import { Quiz } from '../public/models/Quiz.js';
import { UI } from '../public/models/UI.js';

// Variables globales
const nombreInput = document.getElementById('txtNombre');
const empezarBtn = document.getElementById('empezar-btn');
const cartsSection = document.getElementById('carts');
const abmForm = document.getElementById('form-abm');
const siguienteBtn = document.getElementById('siguiente-btn');
const tablaSection = document.getElementById('tabla');
const tablaResultados = document.getElementById('tabla-resultados');
const rankingBtn = document.getElementById('ver-ranking-btn');
const contadorElement = document.createElement('div');  // Contenedor para el contador de tiempo
const puntajeElement = document.createElement('div');  // Contenedor para mostrar puntaje acumulado

let jugador = null;
let puntaje = 0;
let preguntaActual = 0;
let tiempoRestante = 30;  // 30 segundos por pregunta
let contadorInterval;
let tiempoInicioPregunta = 0;

document.addEventListener('DOMContentLoaded', () => {


    // Inicializa el contador y el puntaje en pantalla
    contadorElement.className = 'contador';
    puntajeElement.className = 'puntaje';
    cartsSection.appendChild(contadorElement);
    cartsSection.appendChild(puntajeElement);

    empezarBtn.addEventListener('click', () => {
        const nombreJugador = nombreInput.value;
        console.log("Se empezo el juego");
        if (nombreJugador) {
            iniciarJuego(nombreJugador);

        } else {
            alert('Por favor, ingrese su nombre.');
        }
    });

    if (siguienteBtn) {
        siguienteBtn.addEventListener('click', procesarRespuesta);
    }

    if (rankingBtn) {
        rankingBtn.addEventListener('click', mostrarRanking);
    }
});

/**
 * Función para iniciar el juego con el nombre del jugador.
 * Oculta el formulario inicial, muestra las preguntas, y reinicia los datos de juego.
*/
function iniciarJuego(nombreJugador) {
    jugador = new Persona(nombreJugador);
    puntaje = 0;
    preguntaActual = 0;
    console.log("se crea al jugador");

    document.getElementById('form-abm').style.display = 'none';
    document.getElementById('carts').style.display = 'block';
    mostrarPregunta();
}


/**
 * Muestra la pregunta actual junto con las opciones de respuesta.
 * Reinicia el contador de tiempo para cada nueva pregunta.
*/
function mostrarPregunta() {
    if (preguntaActual < preguntas.length) {
        const pregunta = preguntas[preguntaActual];
        document.getElementById('pregunta-texto').textContent = `Pregunta: ${pregunta.pregunta}`;
        document.querySelectorAll('label span').forEach((opcion, index) => {
            opcion.textContent = pregunta.opciones[index];
        });
        console.log("se muestra la pregunta");

        iniciarContador();  // Reinicia el tiempo para la nueva pregunta

    } else {
        finalizarJuego();
    }
}

/**
 * Inicia el contador de tiempo para la pregunta actual.
 * Si se acaba el tiempo, avanza automáticamente a la siguiente pregunta.
 */
function iniciarContador() {
    console.log("se inicia el contador");
    tiempoRestante = 30;
    document.querySelector('.contador').textContent = `Tiempo restante: ${tiempoRestante} segundos`;

    // Limpiar cualquier intervalo anterior
    if (contadorInterval) {
        clearInterval(contadorInterval);
    }

    // Iniciar un nuevo intervalo de 1 segundo
    contadorInterval = setInterval(() => {
        tiempoRestante--;
        document.querySelector('.contador').textContent = `Tiempo restante: ${tiempoRestante} segundos`;

        if (tiempoRestante === 0) {
            clearInterval(contadorInterval);
            procesarRespuestaAutomatica();  // Avanza automáticamente si se acaba el tiempo
        }
    }, 1000);

    tiempoInicioPregunta = Date.now();  // Marca el inicio del tiempo de respuesta
}

/**
 * Procesa la respuesta seleccionada por el usuario o avanza automáticamente si no se selecciona ninguna.
*/
function procesarRespuesta() {
    const respuestaSeleccionada = document.querySelector('input[name="opciones"]:checked');
    if (respuestaSeleccionada) {
        const indiceSeleccionado = parseInt(respuestaSeleccionada.value);
        if (indiceSeleccionado === preguntas[preguntaActual].correcta) {
            calcularPuntaje();
        }

        avanzarPregunta();
    } else {
        alert('Por favor, seleccione una opción.');
    }
}

/**
 * Procesa la respuesta automática si el tiempo se agota.
*/
function procesarRespuestaAutomatica() {
    avanzarPregunta();  // Avanza a la siguiente pregunta
}

/**
 * Calcula el puntaje según el tiempo de respuesta.
 * A mayor rapidez, mayor puntaje. Se actualiza también el puntaje acumulado en la interfaz.
*/
function calcularPuntaje() {
    const tiempoRespuesta = (Date.now() - tiempoInicioPregunta) / 1000;
    let puntosObtenidos = 0;

    // Ajustar los puntos en función del tiempo de respuesta
    if (tiempoRespuesta < 10) {
        puntosObtenidos = 5;  // Respuesta rápida
    } else if (tiempoRespuesta >= 10 && tiempoRespuesta < 20) {
        puntosObtenidos = 3;  // Respuesta media
    } else {
        puntosObtenidos = 1;  // Respuesta lenta
    }

    puntaje += puntosObtenidos;

    // Actualizar la visualización del puntaje total
    document.querySelector('.puntaje').textContent = `Puntaje acumulado: ${puntaje} puntos`;
}

/**
 * Avanza a la siguiente pregunta.
*/
function avanzarPregunta() {
    preguntaActual++;
    clearInterval(contadorInterval);  // Detiene el contador de la pregunta actual
    mostrarPregunta();  // Muestra la siguiente pregunta
}

/**
 * Finaliza el juego, muestra los resultados y envía los datos al servidor.
*/
function finalizarJuego() {
    const tiempoTotal = ((Date.now() - tiempoInicioPregunta) / 1000).toFixed(2);

    document.getElementById('carts').style.display = 'none';
    document.getElementById('tabla').style.display = 'block';

    jugador.cantPuntos = puntaje;
    jugador.tiempoTotal = parseFloat(tiempoTotal);

    const nuevaFila = document.createElement('tr');
    nuevaFila.innerHTML = `
    <td>${jugador.nombre}</td>
    <td>${jugador.cantPuntos}</td>
    <td>${jugador.tiempoTotal} segundos</td>
    `;
    document.getElementById('tabla-resultados').appendChild(nuevaFila);

    enviarResultadosAlServidor(jugador);
}

/**
 * Envía los resultados del jugador al servidor mediante una solicitud POST.
*/
function enviarResultadosAlServidor(jugador) {
    fetch('/guardar_resultados', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(jugador.toJSON())
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Error en la respuesta del servidor');
            }
            return response.json();
        })
        .then(() => mostrarRanking())
        .catch(error => {
            console.error('Error al guardar los resultados:', error.message);
        });
}

/**
 * Muestra el ranking de todos los jugadores obteniendo los datos desde el servidor.
*/
function mostrarRanking() {
    fetch('/ranking')
        .then(response => response.json())
        .then(ranking => {
            const tablaResultados = document.getElementById('tabla-resultados');
            tablaResultados.innerHTML = '';  // Limpiar la tabla antes de mostrar el ranking

            ranking.forEach(jugador => {
                const nuevaFila = document.createElement('tr');
                nuevaFila.innerHTML = `
            <td>${jugador.nombre}</td>
            <td>${jugador.cantPuntos}</td>
            <td>${jugador.tiempoTotal} segundos</td>
            `;
                tablaResultados.appendChild(nuevaFila);
            });
        })
        .catch(error => {
            console.error('Error al obtener el ranking:', error.message);
        });
}
