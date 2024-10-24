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

// Initialize Socket.IO
const io = new Server(server, {
    cors: {
        origin: process.env.ORIGIN,
        methods: ["GET", "POST"],
        credentials: true
    }
});

// Handle socket connection
io.on('connection', (socket) => {
    console.log('New connection:', socket.id);

    // Handle canvas data from clients
    socket.on('canvas-data', (data) => {
        socket.broadcast.emit('canvas-data', data);
    });

    // Handle clear canvas event
    socket.on('clear-canvas', () => {
        socket.broadcast.emit('clear-canvas');
    });

    // Handle disconnection
    socket.on('disconnect', () => {
        console.log('Disconnected:', socket.id);
    });
});

// Define API routes if needed
app.get('/api/status', (req, res) => {
    res.send({ message: 'Server is running' });
});

// Start the server
const PORT = process.env.PORT || 5011;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
