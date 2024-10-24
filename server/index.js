import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';

const app = express();
const server = createServer(app);

// Enable CORS
app.use(cors({
  origin: process.env.ORIGIN, // Allow requests from this origin
  credentials: true // If you want to allow cookies or credentials
}));

const io = new Server(server, {
    cors: {
        origin: process.env.ORIGIN,
        methods: ["GET", "POST"],
        credentials: true
    }
});

io.on('connection', (socket) => {
    console.log('New connection:', socket.id);

    // Handle canvas data
    socket.on('canvas-data', (data) => {
        socket.broadcast.emit('canvas-data', data);
    });

    // Handle clearing the canvas
    socket.on('clear-canvas', () => {
        socket.broadcast.emit('clear-canvas'); // Emit an event to all other clients
    });
});

server.listen(process.env.PORT, () => {
    console.log('Server running on port 5011');
});
