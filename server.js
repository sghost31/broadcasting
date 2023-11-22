const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const mysql = require('mysql');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Create a MySQL connection pool
const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'admin',
    database: 'broadcasting_platform',
    connectionLimit: 10,
});

wss.on('connection', (ws) => {
    // Handle WebSocket connections, signaling, and broadcast messages
    ws.on('message', (message) => {
        const parsedMessage = JSON.parse(message);

        if (parsedMessage.type === 'offer' || parsedMessage.type === 'answer' || parsedMessage.type === 'ice-candidate') {
            // Handle WebRTC signaling messages
            // Broadcast the message to all other clients in the same room
            wss.clients.forEach((client) => {
                if (client !== ws && client.room === ws.room) {
                    client.send(JSON.stringify(parsedMessage));
                }
            });
        } else if (parsedMessage.type === 'chat') {
            // Handle chat messages
            // Save the chat message in the database
            saveChatMessage(ws.room, parsedMessage.sender, parsedMessage.text);

            // Broadcast the chat message to all other clients in the same room
            wss.clients.forEach((client) => {
                if (client !== ws && client.room === ws.room) {
                    client.send(JSON.stringify(parsedMessage));
                }
            });
        }
    });
});

// Create an API endpoint to handle room creation
app.post('/create-room', (req, res) => {
    const room = generateRandomRoomName();

    // Set up the MySQL database to store room information if needed
    // For simplicity, this example does not include database setup for room information

    res.json({ room });
});

// Serve the HTML page
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

// Serve the JavaScript file
app.get('/main.js', (req, res) => {
    res.sendFile(__dirname + '/main.js');
});

// Serve other static files or assets if needed

server.listen(3000, () => {
    console.log('Server is running on port 3000');
});

function saveChatMessage(room, sender, text) {
    // Save the chat message in the database using the MySQL connection pool
    pool.query('INSERT INTO chat_messages (room, sender, text) VALUES (?, ?, ?)', [room, sender, text], (error, results) => {
        if (error) {
            console.error('Error saving chat message:', error);
        }
    });
}

function generateRandomRoomName() {
    // Generate a random room name for simplicity
    return Math.random().toString(36).substring(7);
}
