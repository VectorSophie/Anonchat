const http = require('http');
const WebSocket = require('ws');
const express = require('express');
const path = require('path');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, 'public')));

wss.on('connection', (ws) => {
    ws.id = `anon-${Math.floor(Math.random() * 10000)}`;
    ws.send(JSON.stringify({ type: 'system', text: `Welcome, ${ws.id}` }));
    broadcast(`${ws.id} has joined the chat.`, ws);

    ws.on('message', (msg) => {
        try {
            const message = msg.toString().trim();

            if (message.startsWith('/confess')) {
                const confession = message.replace('/confess', '').trim();
                if (confession.length > 0) {
                    broadcast(`Someone whispered: "${confession}"`);
                }
                return;
            }

            if (message.startsWith('/vanish')) {
                const parts = message.split(' ');
                const seconds = parseInt(parts[1]) || 5;
                const vanishMsg = parts.slice(2).join(' ') || '[empty message]';

                const vanishPayload = {
                    id: Math.random().toString(36).substring(2, 10),
                    text: `${ws.id}: ${vanishMsg}`,
                    type: 'vanish',
                    duration: seconds
                };

                wss.clients.forEach(client => {
                    if (client.readyState === WebSocket.OPEN) {
                        client.send(JSON.stringify(vanishPayload));
                    }
                });
                return;
            }

            broadcast(`${ws.id}: ${message}`, ws);

        } catch (err) {
            console.error('Error handling message:', err);
        }
    });

    ws.on('close', () => {
        broadcast(`${ws.id} has left the chat.`, ws);
    });
});

function broadcast(message, sender) {
    const payload = JSON.stringify({ type: 'chat', text: message });
    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(payload);
        }
    });
}

server.listen(PORT, () => {
    console.log(`🟢 Server running at http://localhost:${PORT}`);
});
