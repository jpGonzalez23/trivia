import Persona from './persona.js';

// Variables globales
let preguntas = [
    { pregunta: "¿Cuántas variedades tiene la nueva línea de shampoo y acondicionador?", opciones: ["4 variedades", "5 variedades", "6 variedades"], correcta: 2 },
    { pregunta: "¿Qué activos tiene Reparación Profunda – Argán Oil?", opciones: ["Óleo de Argán de Morocco y Miel", "Óleo de Argán de Morocco y Jalea Real", "Aceite de Argán y Miel"], correcta: 1 },
    { pregunta: "¿Para qué tipo de cabellos es el Brillo Fabuloso – Extra Ácido?", opciones: ["Débiles y sin vida", "Teñidos y/o alisados", "Dañados con frizz"], correcta: 2 },
    { pregunta: "¿Cuántos años tiene Inecto?", opciones: ["98 años", "100 años", "102 años"], correcta: 3 },
    { pregunta: "¿Cuál es el shampoo y ACO acorde para el cabello dañado y con frizz?", opciones: ["Coconut Oil", "Fuerza Extrema", "Carbón Purificante"], correcta: 1 },
    { pregunta: "¿Cuál es el shampoo y ACO que tiene como activos Carbón de Bambú y Agua de Rosas?", opciones: ["Carbón Purificante - PH Neutro", "Fuerza Extrema - Control Caída", "Control Frizz - Coconut Oil"], correcta: 1 },
    { pregunta: "¿Las oficinas comerciales de la empresa en qué calle están actualmente?", opciones: ["Pacheco", "Álvarez Jonte", "Caracas"], correcta: 3 },
    { pregunta: "¿Cuál es el beneficio principal del jengibre en la variedad Brillo Fabuloso?", opciones: ["Brillo y suavidad", "Antioxidante y estimulante", "Elasticidad e hidratación"], correcta: 2 },
    { pregunta: "¿Cuál es la variedad ideal para el cabello débil y con caída?", opciones: ["Argán Oil", "Fuerza Extrema", "Coconut Oil"], correcta: 2 },
    { pregunta: "¿Cuál es el apellido de Francisco y Martín?", opciones: ["Prado", "Pardo", "Di Prada"], correcta: 1 }
];


let jugador = null;
let puntaje = 0;
let preguntaActual = 0;
let tiempoRestante = 20; 
let contadorInterval;
let tiempoInicioPregunta = 0;

const socket = io.connect('http://localhost:3000');  // Conectar al servidor de Socket.io

// Variables de UI
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

document.addEventListener('DOMContentLoaded', () => {
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

// Conectar al servidor y escuchar el evento de nuevos resultados
socket.on('nuevo_resultado', (nuevoResultado) => {
    const tablaResultados = document.getElementById('tabla-resultados');
    const nuevaFila = document.createElement('tr');
    nuevaFila.innerHTML = `
        <td>${nuevoResultado.nombre}</td>
        <td>${nuevoResultado.cantPuntos}</td>
        <td>${nuevoResultado.tiempoTotal} segundos</td>
    `;
    tablaResultados.appendChild(nuevaFila);
});

// Función para iniciar el juego con el nombre del jugador.
function iniciarJuego(nombreJugador) {
    jugador = new Persona(nombreJugador);
    puntaje = 0;
    preguntaActual = 0;

    document.getElementById('form-abm').style.display = 'none';
    document.getElementById('carts').style.display = 'block';
    mostrarPregunta();
}

// Muestra la pregunta actual junto con las opciones de respuesta.
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

// Inicia el contador de tiempo para la pregunta actual.
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

// Procesa la respuesta seleccionada por el usuario.
function procesarRespuesta() {
    const respuestaSeleccionada = document.querySelector('input[name="opciones"]:checked');
    if (respuestaSeleccionada) {
        const indiceSeleccionado = parseInt(respuestaSeleccionada.value);
        deshabilitarOpciones();
        if (indiceSeleccionado === preguntas[preguntaActual].correcta) {
            calcularPuntaje();
        }
        
        mostrarRespuestaCorrecta();
    } else {
        alert('Por favor, seleccione una opción.');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const opciones = document.querySelectorAll('input[name="opciones"]');
    opciones.forEach(opcion => {
        opcion.addEventListener('click', procesarRespuesta);
    });
});

// Muestra la respuesta correcta y avanza automáticamente a la siguiente pregunta después de 2 segundos.
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

// Calcula el puntaje según el tiempo de respuesta.
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

// Avanza a la siguiente pregunta automáticamente.
function avanzarPregunta() {
    preguntaActual++;
    clearInterval(contadorInterval);
    mostrarPregunta();
}

// Finaliza el juego, muestra los resultados y envía los datos al servidor.
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

    // Enviar los resultados al servidor para actualizarlos globalmente
    enviarResultadosAlServidor(jugador);
}

// Envía los resultados del jugador al servidor mediante una solicitud POST.
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

// Muestra el ranking de todos los jugadores obteniendo los datos desde el servidor.
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

// Deshabilita todas las opciones de respuesta para evitar cambiar la selección.
function deshabilitarOpciones() {
    document.querySelectorAll('input[name="opciones"]').forEach(opcion => {
        opcion.disabled = true;
    });
}

// Habilita todas las opciones de respuesta para una nueva pregunta.
function habilitarOpciones() {
    document.querySelectorAll('input[name="opciones"]').forEach(opcion => {
        opcion.disabled = false;
    });
}

// Restablece las opciones de respuesta al estado inicial para la siguiente pregunta.
function resetearOpciones() {
    document.querySelectorAll('input[name="opciones"]').forEach(opcion => {
        opcion.checked = false;
    });
    document.querySelectorAll('label').forEach(label => {
        label.style.backgroundColor = '';
    });
}
