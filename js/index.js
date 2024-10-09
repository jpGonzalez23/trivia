document.addEventListener('DOMContentLoaded', () => {
    const nombreInput = document.getElementById('txtNombre');
    const empezarBtn = document.getElementById('empezar-btn');
    const cartsSection = document.getElementById('carts');
    const abmForm = document.getElementById('form-abm');
    const siguienteBtn = document.getElementById('siguiente-btn');
    const tablaSection = document.getElementById('tabla');
    const tablaResultados = document.getElementById('tabla-resultados');

    let preguntas = [
        { pregunta: "¿Cuál es la capital de Francia?", opciones: ["París", "Roma", "Madrid", "Londres"], correcta: 1 },
        { pregunta: "¿Cuál es el planeta más grande del sistema solar?", opciones: ["Tierra", "Saturno", "Júpiter", "Marte"], correcta: 3 },
        { pregunta: "¿Qué elemento químico tiene el símbolo 'O'?", opciones: ["Oro", "Oxígeno", "Osmio", "Obsidiana"], correcta: 2 },
    ];

    let nombreJugador = '';
    let puntaje = 0;
    let preguntaActual = 0;
    let tiempoInicio = 0;

    empezarBtn.addEventListener('click', () => {
        nombreJugador = nombreInput.value;
        if (nombreJugador) {
            abmForm.style.display = 'none';
            cartsSection.style.display = 'block';
            tiempoInicio = Date.now(); // Marca el inicio del tiempo
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

        // Agrega los resultados a la tabla
        const nuevaFila = document.createElement('tr');
        nuevaFila.innerHTML = `
            <td>${nombreJugador}</td>
            <td>${puntaje} / ${preguntas.length}</td>
            <td>${tiempoTotal} segundos</td>
        `;
        tablaResultados.appendChild(nuevaFila);
    };
});