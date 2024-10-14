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
let tiempoRestante = 30;  // 30 segundos por pregunta
let contadorInterval;
let tiempoInicioPregunta = 0;

document.addEventListener('DOMContentLoaded', () => {
    const nombreInput = document.getElementById('txtNombre');
    const empezarBtn = document.getElementById('empezar-btn');
    const cartsSection = document.getElementById('carts');
    const contadorElement = document.createElement('div');  // Contenedor para el contador de tiempo
    const puntajeElement = document.createElement('div');  // Contenedor para mostrar puntaje acumulado

    // Inicializa el puntaje en pantalla
    puntajeElement.className = 'puntaje';
    cartsSection.appendChild(contadorElement);
    cartsSection.appendChild(puntajeElement);

    empezarBtn.addEventListener('click', () => {
        const nombreJugador = nombreInput.value;
        if (nombreJugador) {
            iniciarJuego(nombreJugador);
        } else {
            alert('Por favor, ingrese su nombre.');
        }
    });
});

/**
 * Función para iniciar el juego con el nombre del jugador.
 * Oculta el formulario inicial, muestra las preguntas, y reinicia los datos de juego.
 */
function iniciarJuego(nombreJugador) {
    jugador = new Persona(nombreJugador);
    puntaje = 0;
    preguntaActual = 0;

    document.getElementById('form-abm').style.display = 'none';
    document.getElementById('carts').style.display = 'block';
    manejarPreguntaYRespuesta();
}

function manejarPreguntaYRespuesta() {
    // Mostrar la pregunta actual y opciones
    if (preguntaActual < preguntas.length) {
        resetearOpciones();  // Restablece las opciones visuales y de selección
        const pregunta = preguntas[preguntaActual];
        document.getElementById('pregunta-texto').textContent = `Pregunta: ${pregunta.pregunta}`;
        document.querySelectorAll('label span').forEach((opcion, index) => {
            opcion.textContent = pregunta.opciones[index];
        });

        habilitarOpciones();  // Asegúrate de que todas las opciones estén habilitadas
        iniciarContador();  // Reinicia el tiempo para la nueva pregunta
    } else {
        finalizarJuego();
    }

    // Procesar la respuesta seleccionada por el usuario
    const respuestaSeleccionada = document.querySelector('input[name="opciones"]:checked');
    if (respuestaSeleccionada) {
        const indiceSeleccionado = parseInt(respuestaSeleccionada.value);
        deshabilitarOpciones();  // Deshabilita las opciones después de seleccionar una

        console.log(`Opción seleccionada: ${preguntaActual} - ${respuestaSeleccionada.value}`); // Debug: Opción seleccionada
        calcularPuntaje();  // Sumar el puntaje según el tiempo de respuesta

        // Mostrar respuesta correcta antes de avanzar a la siguiente pregunta
        mostrarRespuestaCorrecta();  

        setTimeout(() => {
            avanzarPregunta();  // Avanza a la siguiente pregunta después de unos segundos
        }, 2000);  // Pausa de 2 segundos para que el jugador vea su selección antes de avanzar
    } else {
        alert('Por favor, seleccione una opción.');
    }
}

/**
 * Inicia el contador de tiempo para la pregunta actual.
 * Si se acaba el tiempo, muestra la respuesta correcta antes de avanzar automáticamente.
 */
function iniciarContador() {
    tiempoRestante = 30;
    document.querySelector('.contador').textContent = `Tiempo restante: ${tiempoRestante} segundos`;

    // Limpiar cualquier intervalo anterior
    if (contadorInterval) {
        clearInterval(contadorInterval);
    }

    // Iniciar un nuevo intervalo de 1 segundo
    contadorInterval = setInterval(() => {
        tiempoRestante--;
        console.log(`Tiempo restante: ${tiempoRestante} segundos`); // Debug: Mostrar tiempo restante

        // Aumentar la velocidad del contador cada 10 segundos
        if (tiempoRestante % 10 === 0 && tiempoRestante > 0) {
            console.log(`Aumentando la velocidad del contador a cada 10 segundos`); // Debug
            clearInterval(contadorInterval);  // Limpiar el intervalo anterior
            // Iniciar un nuevo intervalo más rápido
            contadorInterval = setInterval(() => {
                tiempoRestante--;
                document.querySelector('.contador').textContent = `Tiempo restante: ${tiempoRestante} segundos`;

                if (tiempoRestante === 0) {
                    clearInterval(contadorInterval);
                    mostrarRespuestaCorrecta();  // Muestra la respuesta correcta si el tiempo se acaba
                }
            }, 800);  // Reducir el tiempo a 800 ms (0.8 segundos) para aumentar la velocidad
        }

        // Actualizar el contador
        document.querySelector('.contador').textContent = `Tiempo restante: ${tiempoRestante} segundos`;

        if (tiempoRestante === 0) {
            clearInterval(contadorInterval);
            mostrarRespuestaCorrecta();  // Muestra la respuesta correcta si el tiempo se acaba
        }
    }, 1000); // Mantener el intervalo original de 1 segundo al principio

    tiempoInicioPregunta = Date.now();  // Marca el inicio del tiempo de respuesta
}

/**
 * Muestra la respuesta correcta resaltando la opción correcta.
 */
function mostrarRespuestaCorrecta() {
    if (preguntaActual < preguntas.length) {  // Verifica si hay una pregunta actual
        const correcta = preguntas[preguntaActual].correcta;
        const opciones = document.querySelectorAll('input[name="opciones"]');

        opciones.forEach((opcion, index) => {
            if (index === correcta) {
                document.querySelectorAll('label')[index].style.backgroundColor = 'lightgreen';  // Resalta la respuesta correcta
            }
        });
    }

    // Esperar 2 segundos antes de avanzar a la siguiente pregunta
    setTimeout(() => {
        avanzarPregunta();
    }, 2000);
}

/**
 * Calcula el puntaje según el tiempo de respuesta.
 * A mayor rapidez, mayor puntaje. Se actualiza también el puntaje acumulado en la interfaz.
 */
function calcularPuntaje() {
    const tiempoRespuesta = (Date.now() - tiempoInicioPregunta) / 1000;
    let puntosObtenidos = 0;

    // Ajustar los puntos en función del tiempo de respuesta
    if (tiempoRespuesta > 20 && tiempoRespuesta <= 30) {
        puntosObtenidos = 5;  // Respuesta entre 20 y 30 segundos
    } else if (tiempoRespuesta > 10 && tiempoRespuesta <= 20) {
        puntosObtenidos = 2;  // Respuesta entre 10 y 20 segundos
    } else if (tiempoRespuesta <= 10) {
        puntosObtenidos = 1;  // Respuesta por debajo de 10 segundos
    }

    puntaje += puntosObtenidos;

    // Actualizar la visualización del puntaje total
    console.log(`Puntaje acumulado: ${puntaje} puntos`); // Debug: Mostrar puntaje acumulado
    document.querySelector('.puntaje').textContent = `Puntaje acumulado: ${puntaje} puntos`;
}

/**
 * Avanza a la siguiente pregunta automáticamente.
 */
function avanzarPregunta() {
    preguntaActual++;
    clearInterval(contadorInterval);  // Detiene el contador de la pregunta actual
    manejarPreguntaYRespuesta();  // Muestra la siguiente pregunta
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

/**
 * Deshabilita todas las opciones de respuesta para evitar cambiar la selección.
 */
function deshabilitarOpciones() {
    document.querySelectorAll('input[name="opciones"]').forEach(opcion => {
        opcion.disabled = true;  // Deshabilita todas las opciones
    });
}

/**
 * Habilita todas las opciones de respuesta para una nueva pregunta.
 */
function habilitarOpciones() {
    document.querySelectorAll('input[name="opciones"]').forEach(opcion => {
        opcion.disabled = false;  // Habilita todas las opciones
    });
}

/**
 * Restablece las opciones de respuesta al estado inicial para la siguiente pregunta.
 */
function resetearOpciones() {
    document.querySelectorAll('input[name="opciones"]').forEach(opcion => {
        opcion.checked = false;  // Desmarca todas las opciones
    });
    document.querySelectorAll('label').forEach(label => {
        label.style.backgroundColor = '';  // Elimina el color de fondo
    });
}
