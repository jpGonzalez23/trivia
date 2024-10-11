import Persona from './persona.js';

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
    const abmForm = document.getElementById('form-abm');
    const siguienteBtn = document.getElementById('siguiente-btn');
    const tablaSection = document.getElementById('tabla');
    const tablaResultados = document.getElementById('tabla-resultados');
    const rankingBtn = document.getElementById('ver-ranking-btn');
    const contadorElement = document.createElement('div');  // Contenedor para el contador de tiempo
    const puntajeElement = document.createElement('div');  // Contenedor para mostrar puntaje acumulado

    // Inicializa el contador y el puntaje en pantalla
    contadorElement.className = 'contador';
    puntajeElement.className = 'puntaje';
    cartsSection.appendChild(contadorElement);
    cartsSection.appendChild(puntajeElement);

    // Inicia el juego al hacer clic en el botón "Empezar"
    empezarBtn.addEventListener('click', () => {
        const nombreJugador = nombreInput.value;
        if (nombreJugador) {
            iniciarJuego(nombreJugador);
        } else {
            alert('Por favor, ingrese su nombre.');
        }
    });

    // Avanza a la siguiente pregunta al hacer clic en "Siguiente"
    siguienteBtn.addEventListener('click', procesarRespuesta);

    // Muestra el ranking al hacer clic en el botón de "Ver Ranking"
    rankingBtn.addEventListener('click', mostrarRanking);
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

        // Reiniciar el tiempo y el contador para esta pregunta
        iniciarContador();

    } else {
        finalizarJuego();
    }
}

/**
 * Inicia el contador de tiempo para la pregunta actual.
 * Si se acaba el tiempo, avanza automáticamente a la siguiente pregunta.
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
        document.querySelector('.contador').textContent = `Tiempo restante: ${tiempoRestante} segundos`;

        if (tiempoRestante === 0) {
            clearInterval(contadorInterval);
            preguntaActual++;
            mostrarPregunta();
        }
    }, 1000);

    tiempoInicioPregunta = Date.now();  // Marca el inicio del tiempo de respuesta
}

/**
 * Procesa la respuesta seleccionada por el usuario.
 * Calcula el puntaje según la rapidez de la respuesta y avanza a la siguiente pregunta.
 */
function procesarRespuesta() {
    const respuestaSeleccionada = document.querySelector('input[name="opciones"]:checked');
    if (respuestaSeleccionada) {
        const indiceSeleccionado = parseInt(respuestaSeleccionada.value);
        if (indiceSeleccionado === preguntas[preguntaActual].correcta) {
            calcularPuntaje();
        }

        preguntaActual++;
        clearInterval(contadorInterval);
        mostrarPregunta();

    } else {
        alert('Por favor, seleccione una opción.');
    }
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
 * Finaliza el juego, muestra los resultados y envía los datos al servidor.
 */
function finalizarJuego() {
    const tiempoTotal = ((Date.now() - tiempoInicioPregunta) / 1000).toFixed(2);

    // Oculta la sección de preguntas y muestra los resultados
    document.getElementById('carts').style.display = 'none';
    document.getElementById('tabla').style.display = 'block';

    jugador.cantPuntos = puntaje;
    jugador.tiempoTotal = parseFloat(tiempoTotal);

    // Agregar los resultados a la tabla
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
