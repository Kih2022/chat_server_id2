// Creación y configuración del SERVER
const http = require('http');
const app = require('./src/app');
const ChatMessage = require('./src/models/chat-message.model');

// Config .env
require('dotenv').config();
require('./src/config/db');

// Creación server
const server = http.createServer(app);

const PORT = process.env.PORT || 3000;
server.listen(PORT);

// Listeners
server.on('listening', () => {
    console.log(`Servidor escuchando sobre el puerto ${PORT}`);
});

server.on('error', (error) => {
    console.log(error);
})

// Config WS server
const io = require('socket.io')(server, {
    cors: {
        origin: "*"
    }
});

io.on('connection', async (socket) => {
    console.log('Se ha conectado un nuevo cliente');
    socket.broadcast.emit('chat_message_server', {
        nombre: 'INFO',
        mensaje: 'se ha conectado un nuevo usuario'


    })
    io.emit('clientes_online', io.engine.clientsCount);


    // Extraemos los mensajes iniciales del chat
    const messages = await ChatMessage.find().sort({ createdAt: -1 }).limit(5);
    socket.emit(socket.emit('chat_init', messages))


    socket.on('chat_message_client', async (data) => {
        console.log(data);
        await ChatMessage.create(data);
        io.emit('chat_message_server', data);
    });

    socket.on('disconnect', () => {
        io.emit('chat_message_server', {
            nombre: 'INFO',
            mensaje: 'Se ha desconectado un usuario'
        });

        io.emit('clients_online', io.engine.clientsCount);
    });

});


/**
 * Cuando me llega un mensaje del front, almacenar en DB
 */

/**
 * Cuando se conecta un nuevo usuario:
 * 1- recuperar los  ultimos mensajes del chat
 * (investigar como se puede limitar el numero de mensajes en mongoose)
 * 2- emitir un nuevo evento "caht_init" hacia el cliente enviando el array de
 * mansajes (sockect.emit)
 */