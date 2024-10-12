const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 3000;
const DATA_FILE = path.join(__dirname, 'resultados.json');

// Middleware para procesar JSON
app.use(express.json());
app.use(cors());  // Habilita CORS

// Sirve los archivos estáticos desde la carpeta "public"
app.use(express.static('public'));

// Ruta para manejar la solicitud POST y almacenar los resultados
app.post('/guardar_resultados', (req, res) => {
    const nuevoResultado = req.body;

    // Lee el archivo existente y agrega los nuevos resultados
    fs.readFile(DATA_FILE, 'utf8', (err, data) => {
        if (err) {
            console.error('Error leyendo el archivo:', err);
            return res.status(500).json({ message: 'Error en el servidor al leer los datos.' });
        }

        let resultados = [];
        if (data) {
            resultados = JSON.parse(data);
        }

        // Encuentra el ID más alto y genera el nuevo ID
        const ids = resultados.map(r => r.id);
        const nuevoId = ids.length ? Math.max(...ids) + 1 : 1; // Incrementa el ID más alto o comienza en 1

        // Asigna el nuevo ID al nuevo resultado
        nuevoResultado.id = nuevoId;

        // Agrega los nuevos resultados
        resultados.push(nuevoResultado);

        // Guarda los resultados actualizados en el archivo
        fs.writeFile(DATA_FILE, JSON.stringify(resultados, null, 2), (err) => {
            if (err) {
                console.error('Error guardando los datos:', err);
                return res.status(500).json({ message: 'Error en el servidor al guardar los datos.' });
            }

            return res.json({ message: 'Resultados guardados con éxito.' });
        });
    });
});

app.get('/ranking', (req, res) => {
    fs.readFile(DATA_FILE, 'utf8', (err, data) => {
        if (err) {
            console.error('Error leyendo el archivo:', err);
            return res.status(500).json({ message: 'Error en el servidor al leer los datos.' });
        }

        let resultados = [];
        if (data) {
            resultados = JSON.parse(data);
        }

        // Ordenar por puntaje y por tiempo en caso de empate
        resultados.sort((a, b) => {
            if (b.cantPuntos === a.cantPuntos) {
                return a.tiempoTotal - b.tiempoTotal; // Ordenar por tiempo en caso de empate
            }
            return b.cantPuntos - a.cantPuntos; // Ordenar por puntaje
        });

        res.json(resultados);
    });
});

// Inicia el servidor
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
