import Persona from './persona.js';

document.addEventListener('DOMContentLoaded', () => {
    const nombreInput = document.getElementById('txtNombre');
    const empezarBtn = document.getElementById('empezar-btn');
    const cartsSection = document.getElementById('carts');
    const abmForm = document.getElementById('form-abm');
    const siguienteBtn = document.getElementById('siguiente-btn');
    const tablaSection = document.getElementById('tabla');
    const tablaResultados = document.getElementById('tabla-resultados');
    const rankingBtn = document.getElementById('ver-ranking-btn');  // Botón para ver el ranking

    let preguntas = [
        { pregunta: "¿Cuál es la capital de Francia?", opciones: ["París", "Roma", "Madrid", "Londres"], correcta: 1 },
        { pregunta: "¿Cuál es el planeta más grande del sistema solar?", opciones: ["Tierra", "Saturno", "Júpiter", "Marte"], correcta: 3 },
        { pregunta: "¿Qué elemento químico tiene el símbolo 'O'?", opciones: ["Oro", "Oxígeno", "Osmio", "Obsidiana"], correcta: 2 },
    ];

    let jugador = null;
    let puntaje = 0;
    let preguntaActual = 0;
    let tiempoInicio = 0;
    let idJugador = 0;

    empezarBtn.addEventListener('click', () => {
        const nombreJugador = nombreInput.value;
        if (nombreJugador) {
            abmForm.style.display = 'none';
            cartsSection.style.display = 'block';
            tiempoInicio = Date.now(); // Marca el inicio del tiempo

            // Crear una nueva instancia de Persona para el jugador
            jugador = new Persona(++idJugador, nombreJugador);
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
        } else {
            finalizarJuego();
        }
    };

    siguienteBtn.addEventListener('click', () => {
        const respuestaSeleccionada = document.querySelector('input[name="opciones"]:checked');
        if (respuestaSeleccionada) {
            const indiceSeleccionado = parseInt(respuestaSeleccionada.value);
            if (indiceSeleccionado === preguntas[preguntaActual].correcta) {
                puntaje++;
            }
            preguntaActual++;
            mostrarPregunta();
        } else {
            alert('Por favor, seleccione una opción.');
        }
    });

    const finalizarJuego = () => {
        const tiempoTotal = ((Date.now() - tiempoInicio) / 1000).toFixed(2);
        cartsSection.style.display = 'none';
        tablaSection.style.display = 'block';
    
        // Actualiza la información de puntaje y tiempo del jugador
        jugador.cantPuntos = puntaje;
        jugador.tiempoTotal = parseFloat(tiempoTotal);
    
        // Agrega los resultados a la tabla local
        const nuevaFila = document.createElement('tr');
        nuevaFila.innerHTML = `
            <td>${jugador.nombre}</td>
            <td>${jugador.cantPuntos} / ${preguntas.length}</td>
            <td>${jugador.tiempoTotal} segundos</td>
        `;
        tablaResultados.appendChild(nuevaFila);
    
        // Enviar el resultado actual al servidor
        enviarResultadosAlServidor(jugador);
    };
    
    const enviarResultadosAlServidor = (jugador) => {
        fetch('/guardar_resultados', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(jugador.toJSON())  // Convierte la instancia de Persona a JSON
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Error en la respuesta del servidor');
            }
            return response.json();
        })
        .then(() => {
            // Después de guardar el resultado, muestra el ranking
            mostrarRanking();
        })
        .catch(error => {
            console.error('Error al guardar los resultados:', error.message);
        });
    };

    // Función para obtener y mostrar el ranking
    const mostrarRanking = () => {
        fetch('/ranking')
        .then(response => response.json())
        .then(ranking => {
            tablaResultados.innerHTML = '';  // Limpia la tabla antes de mostrar el ranking

            ranking.forEach(jugador => {
                const nuevaFila = document.createElement('tr');
                nuevaFila.innerHTML = `
                    <td>${jugador.nombre}</td>
                    <td>${jugador.cantPuntos} / ${preguntas.length}</td>
                    <td>${jugador.tiempoTotal} segundos</td>
                `;
                tablaResultados.appendChild(nuevaFila);
            });
        })
        .catch(error => {
            console.error('Error al obtener el ranking:', error.message);
        });
    };

    // Opcional: Botón para ver el ranking en cualquier momento
    rankingBtn.addEventListener('click', mostrarRanking);
});
