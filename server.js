const express = require('express');
const cors = require('cors');
const http = require('http');  // Importamos http para crear un servidor
const socketIo = require('socket.io');  // Importamos socket.io
const mysql = require('mysql2');  // Importamos mysql2 para conectar con la base de datos

const app = express();
const server = http.createServer(app);  // Creamos el servidor HTTP
const io = socketIo(server);  // Inicializamos Socket.io con el servidor HTTP
const PORT = process.env.PORT || 3000;  // Usa el puerto del entorno o 3000

// Middleware para procesar JSON
app.use(express.json());
app.use(cors());  // Habilita CORS

// Conexión a la base de datos MySQL
const db = mysql.createConnection({
    host: process.env.DB_HOST || '127.0.0.1',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'trivia'
});

db.connect((err) => {
    if (err) {
        console.error('Error conectando a la base de datos:', err);
        process.exit(1);
    }
    console.log('Conectado a la base de datos MySQL');
});

// Ruta para manejar la solicitud POST y almacenar los resultados en MySQL
app.post('/guardar_resultados', (req, res) => {
    const { nombre, cantPuntos, tiempoTotal } = req.body;

    if (!nombre || !cantPuntos || !tiempoTotal) {
        return res.status(400).json({ message: 'Faltan datos en la solicitud.' });
    }

    const query = 'INSERT INTO resultados (nombre, cantPuntos, tiempoTotal) VALUES (?, ?, ?)';
    db.query(query, [nombre, cantPuntos, tiempoTotal], (err, result) => {
        if (err) {
            console.error('Error al insertar los datos en la base de datos:', err);
            return res.status(500).json({ message: 'Error en el servidor al guardar los datos.' });
        }

        const nuevoResultado = { id: result.insertId, nombre, cantPuntos, tiempoTotal };

        // Enviamos un evento de Socket.io cuando los resultados se guardan
        io.emit('nuevo_resultado', nuevoResultado);

        res.json({ message: 'Resultados guardados con éxito.', resultado: nuevoResultado });
    });
});

// Ruta para obtener el ranking desde MySQL
app.get('/ranking', (req, res) => {
    const query = 'SELECT * FROM resultados ORDER BY cantPuntos DESC, tiempoTotal ASC';
    db.query(query, (err, resultados) => {
        if (err) {
            console.error('Error al obtener los datos de la base de datos:', err);
            return res.status(500).json({ message: 'Error en el servidor al leer los datos.' });
        }

        res.json(resultados);
    });
});

// Evento de conexión de Socket.io
io.on('connection', (socket) => {
    console.log('Un cliente se ha conectado a Socket.io');

    socket.emit('mensaje', 'Conexión establecida con el servidor.');

    socket.on('disconnect', () => {
        console.log('Cliente desconectado de Socket.io');
    });
});

// Inicia el servidor en el puerto definido
server.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
