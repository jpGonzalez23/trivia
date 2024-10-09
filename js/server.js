const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;  // Puedes usar otro puerto si lo deseas

// Middleware para poder leer datos en formato JSON desde el cuerpo de la solicitud
app.use(express.json());

// Ruta para recibir y almacenar los resultados
app.post('/guardar_resultados', (req, res) => {
    const resultados = req.body;

    // Archivo donde se guardarán los resultados
    const filePath = path.join(__dirname, 'resultados_juego.json');

    // Leer el archivo actual (si existe) y agregar los nuevos resultados
    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err && err.code !== 'ENOENT') {
            return res.status(500).json({ error: 'Error al leer el archivo' });
        }

        let resultadosPrevios = [];

        if (data) {
            // Si ya hay datos en el archivo, los parseamos y añadimos los nuevos
            resultadosPrevios = JSON.parse(data);
        }

        // Agregamos los nuevos resultados al array existente
        resultadosPrevios.push(...resultados);

        // Escribimos los resultados actualizados en el archivo
        fs.writeFile(filePath, JSON.stringify(resultadosPrevios, null, 2), (err) => {
            if (err) {
                return res.status(500).json({ error: 'Error al guardar los datos' });
            }

            res.status(200).json({ message: 'Resultados guardados con éxito' });
        });
    });
});

// Iniciar el servidor
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
