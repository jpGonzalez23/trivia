import Persona from './persona.js';

let preguntas = [
    { pregunta: "¿Cuál es la capital de Francia?", opciones: ["París", "Roma", "Madrid", "Londres"], correcta: 1 },
    { pregunta: "¿Cuál es el planeta más grande del sistema solar?", opciones: ["Tierra", "Saturno", "Júpiter", "Marte"], correcta: 3 },
    { pregunta: "¿Qué elemento químico tiene el símbolo 'O'?", opciones: ["Oro", "Oxígeno", "Osmio", "Obsidiana"], correcta: 2 },
];

let jugador = null;
let puntaje = 0;
let preguntaActual = 0;
let tiempoInicioPregunta = 0;
let tiempoRestante = 30;  // 30 segundos por pregunta
let contadorInterval;  // Para controlar el intervalo del contador

document.addEventListener('DOMContentLoaded', () => {
    const nombreInput = document.getElementById('txtNombre');
    const empezarBtn = document.getElementById('empezar-btn');
    const cartsSection = document.getElementById('carts');
    const abmForm = document.getElementById('form-abm');
    const siguienteBtn = document.getElementById('siguiente-btn');
    const tablaSection = document.getElementById('tabla');
    const tablaResultados = document.getElementById('tabla-resultados');
    const rankingBtn = document.getElementById('ver-ranking-btn');  // Botón para ver el ranking
    const contadorElement = document.createElement('div');  // Contenedor para el contador de tiempo

    // Agregar el contador a la sección de preguntas
    cartsSection.appendChild(contadorElement);
    contadorElement.className = 'contador';  // Puedes agregar estilos CSS para el contador

    empezarBtn.addEventListener('click', () => {
        const nombreJugador = nombreInput.value;
        if (nombreJugador) {
            abmForm.style.display = 'none';
            cartsSection.style.display = 'block';

            jugador = new Persona(nombreJugador);
            mostrarPregunta();
        } else {
            alert('Por favor, ingrese su nombre.');
        }
    });

    const mostrarPregunta = () => {
        if (preguntaActual < preguntas.length) {
            const pregunta = preguntas[preguntaActual];
            document.getElementById('pregunta-texto').textContent = `Pregunta: ${pregunta.pregunta}`;
            document.querySelectorAll('label span').forEach((opcion, index) => {
                opcion.textContent = pregunta.opciones[index];
            });

            // Reiniciar el tiempo para esta pregunta
            tiempoRestante = 30;
            contadorElement.textContent = `Tiempo restante: ${tiempoRestante} segundos`;

            // Limpiar cualquier intervalo anterior
            if (contadorInterval) {
                clearInterval(contadorInterval);
            }

            // Iniciar el contador de tiempo
            contadorInterval = setInterval(() => {
                tiempoRestante--;
                contadorElement.textContent = `Tiempo restante: ${tiempoRestante} segundos`;

                // Si se acaba el tiempo, pasar a la siguiente pregunta
                if (tiempoRestante === 0) {
                    clearInterval(contadorInterval);
                    preguntaActual++;
                    mostrarPregunta();
                }
            }, 1000);

            // Marca el inicio del tiempo para la pregunta
            tiempoInicioPregunta = Date.now();
        } else {
            finalizarJuego();
        }
    };

    siguienteBtn.addEventListener('click', () => {
        const respuestaSeleccionada = document.querySelector('input[name="opciones"]:checked');
        if (respuestaSeleccionada) {
            const indiceSeleccionado = parseInt(respuestaSeleccionada.value);
            if (indiceSeleccionado === preguntas[preguntaActual].correcta) {
                const tiempoRespuesta = (Date.now() - tiempoInicioPregunta) / 1000;

                if (tiempoRespuesta >= 20 && tiempoRespuesta <= 30) {
                    puntaje += 5;
                } else if (tiempoRespuesta >= 10 && tiempoRespuesta < 20) {
                    puntaje += 2;
                } else if (tiempoRespuesta < 10) {
                    puntaje += 1;
                }
            }
            preguntaActual++;

            clearInterval(contadorInterval);
            mostrarPregunta();
        } else {
            alert('Por favor, seleccione una opción.');
        }
    });

    const finalizarJuego = () => {
        const tiempoTotal = ((Date.now() - tiempoInicioPregunta) / 1000).toFixed(2);
        cartsSection.style.display = 'none';
        tablaSection.style.display = 'block';
    
        jugador.cantPuntos = puntaje;
        jugador.tiempoTotal = parseFloat(tiempoTotal);
    
        const nuevaFila = document.createElement('tr');
        nuevaFila.innerHTML = `
            <td>${jugador.nombre}</td>
            <td>${jugador.cantPuntos} /</td>
            <td>${jugador.tiempoTotal} segundos</td>
        `;
        tablaResultados.appendChild(nuevaFila);
    
        enviarResultadosAlServidor(jugador);
    };
    
    const enviarResultadosAlServidor = (jugador) => {
        fetch('/guardar_resultados', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(jugador.toJSON())
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Error en la respuesta del servidor');
            }
            return response.json();
        })
        .then(() => {
            mostrarRanking();
        })
        .catch(error => {
            console.error('Error al guardar los resultados:', error.message);
        });
    };

    const mostrarRanking = () => {
        fetch('/ranking')
        .then(response => response.json())
        .then(ranking => {
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
    };

    rankingBtn.addEventListener('click', mostrarRanking);
});
