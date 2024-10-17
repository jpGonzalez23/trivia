import Persona from './persona.js';

// Variables globales
let preguntas = [
    { pregunta: "¿Cuál es la capital de Francia?", opciones: ["París", "Roma", "Madrid", "Londres"], correcta: 1 },
    { pregunta: "¿Cuál es el planeta más grande del sistema solar?", opciones: ["Tierra", "Saturno", "Júpiter", "Marte"], correcta: 3 },
    { pregunta: "¿Qué elemento químico tiene el símbolo 'O'?", opciones: ["Oro", "Oxígeno", "Osmio", "Obsidiana"], correcta: 2 },
];

let jugador = null;
let puntaje = 0;
let preguntaActual = 0;
let tiempoRestante = 20;  // 30 segundos por pregunta
let contadorInterval;
let tiempoInicioPregunta = 0;

document.addEventListener('DOMContentLoaded', () => {
    const nombreInput = document.getElementById('txtNombre');
    const empezarBtn = document.getElementById('btn-empezar');
    const cartsSection = document.getElementById('carts');
    const rankingBtn = document.getElementById('ver-ranking-btn');
    const contadorElement = document.createElement('div');  // Contenedor para el contador de tiempo
    const puntajeElement = document.createElement('div');  // Contenedor para mostrar puntaje acumulado

    // Inicializa el contador y el puntaje en pantalla
    contadorElement.className = 'contador';
    puntajeElement.className = 'puntaje';
    cartsSection.appendChild(contadorElement);
    cartsSection.appendChild(puntajeElement);

    empezarBtn?.addEventListener('click', () => {
        const nombreJugador = nombreInput.value;
        if (nombreJugador) {
            iniciarJuego(nombreJugador);
        } else {
            alert('Por favor, ingrese su nombre.');
        }
    });

    rankingBtn?.addEventListener('click', mostrarRanking);
});

/**
 * Función para iniciar el juego con el nombre del jugador.
 */
function iniciarJuego(nombreJugador) {
    jugador = new Persona(nombreJugador);
    puntaje = 0;
    preguntaActual = 0;

    document.getElementById('form-abm').style.display = 'none';
    document.getElementById('carts').style.display = 'block';
    mostrarPregunta();
}

/**
 * Muestra la pregunta actual junto con las opciones de respuesta.
 */
function mostrarPregunta() {
    if (preguntaActual < preguntas.length) {
        resetearOpciones();
        const pregunta = preguntas[preguntaActual];
        document.getElementById('pregunta-texto').textContent = `Pregunta: ${pregunta.pregunta}`;
        document.querySelectorAll('label span').forEach((opcion, index) => {
            opcion.textContent = pregunta.opciones[index];
        });

        habilitarOpciones();
        iniciarContador();
    } else {
        finalizarJuego();
    }
}

/**
 * Inicia el contador de tiempo para la pregunta actual.
 * Si se acaba el tiempo, muestra la respuesta correcta y avanza automáticamente.
 */
function iniciarContador() {
    tiempoRestante = 20;
    document.querySelector('.contador').textContent = `Tiempo restante: ${tiempoRestante} segundos`;

    if (contadorInterval) {
        clearInterval(contadorInterval);
    }

    contadorInterval = setInterval(() => {
        tiempoRestante--;
        document.querySelector('.contador').textContent = `Tiempo restante: ${tiempoRestante} segundos`;

        if (tiempoRestante === 0) {
            clearInterval(contadorInterval);
            mostrarRespuestaCorrecta();
        }
    }, 1000);

    tiempoInicioPregunta = Date.now();
}

/**
 * Procesa la respuesta seleccionada por el usuario y avanza a la siguiente pregunta.
 */

function procesarRespuesta() {
    const respuestaSeleccionada = document.querySelector('input[name="opciones"]:checked');
    console.log(respuestaSeleccionada);
    if (respuestaSeleccionada) {
        const indiceSeleccionado = parseInt(respuestaSeleccionada.value);
        deshabilitarOpciones();
        console.log(respuestaSeleccionada);
        console.log(preguntas[preguntaActual].correcta);
        if (indiceSeleccionado === preguntas[preguntaActual].correcta) {
            calcularPuntaje();
        }
        
        mostrarRespuestaCorrecta();
    } else {
        alert('Por favor, seleccione una opción.');
    }
}

/**
 * Asigna el evento onclick a los radio buttons de las opciones.
 */
document.addEventListener('DOMContentLoaded', () => {
    const opciones = document.querySelectorAll('input[name="opciones"]');
    opciones.forEach(opcion => {
        opcion.addEventListener('click', procesarRespuesta);
    });
});

/**
 * Muestra la respuesta correcta y avanza automáticamente a la siguiente pregunta después de 2 segundos.
 */
function mostrarRespuestaCorrecta() {
    const correcta = preguntas[preguntaActual].correcta;
    const opciones = document.querySelectorAll('input[name="opciones"]');

    opciones.forEach((opcion, index) => {
        if (index === correcta) {
            document.querySelectorAll('label')[index].style.backgroundColor = 'lightgreen';
        }
    });

    setTimeout(() => {
        avanzarPregunta();
    }, 2000);
}

/**
 * Calcula el puntaje según el tiempo de respuesta.
 */
function calcularPuntaje() {
    const tiempoRespuesta = (Date.now() - tiempoInicioPregunta) / 1000;
    let puntosObtenidos = 0;

    if (tiempoRespuesta < 8) {
        puntosObtenidos = 5;  // Respuesta rápida
    } else if (tiempoRespuesta >= 8 && tiempoRespuesta < 15) {
        puntosObtenidos = 3;  // Respuesta media
    } else {
        puntosObtenidos = 1;  // Respuesta lenta
    }

    puntaje += puntosObtenidos;
    console.log(puntaje);
    //document.querySelector('.puntaje').textContent = `Puntaje acumulado: ${puntaje} puntos`;
}

/**
 * Avanza a la siguiente pregunta automáticamente.
 */
function avanzarPregunta() {
    preguntaActual++;
    clearInterval(contadorInterval);
    mostrarPregunta();
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
            tablaResultados.innerHTML = '';

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

/**
 * Deshabilita todas las opciones de respuesta para evitar cambiar la selección.
 */
function deshabilitarOpciones() {
    document.querySelectorAll('input[name="opciones"]').forEach(opcion => {
        opcion.disabled = true;
    });
}

/**
 * Habilita todas las opciones de respuesta para una nueva pregunta.
 */
function habilitarOpciones() {
    document.querySelectorAll('input[name="opciones"]').forEach(opcion => {
        opcion.disabled = false;
    });
}

/**
 * Restablece las opciones de respuesta al estado inicial para la siguiente pregunta.
 */
function resetearOpciones() {
    document.querySelectorAll('input[name="opciones"]').forEach(opcion => {
        opcion.checked = false;
    });
    document.querySelectorAll('label').forEach(label => {
        label.style.backgroundColor = '';
    });
}
