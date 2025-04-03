const WebSocket = require('ws');
const { info, succ, err } = require('../controllers/LoggerStyles.js');

function initializeWebSocketServer(server) {
    const wss = new WebSocket.Server({ server });
    const chatRooms = {};

    wss.on('connection', (ws, req) => {
        const urlParams = new URL(req.url, `http://${req.headers.host}`);
        const shorty = urlParams.searchParams.get("chat");

        if (!shorty) {
            console.log(`${err} connection without shorty rejected.`);
            ws.close();
            return;
        }

        if (!chatRooms[shorty]) {
            chatRooms[shorty] = {
                clients: new Set(),
                messages: []
            };
        }

        if (chatRooms[shorty].clients.size >= 20) {
            console.log(`${info} chat room ${shorty} is full. connection rejected.`);
            ws.send(JSON.stringify({
                type: 'error',
                message: 'chat room is full. limit is 20 users.'
            }));
            ws.close();
            return;
        }

        const userName = `User${Math.floor(Math.random() * 1000)}`;
        console.log(`${info} user connected: ${userName} (chat room: ${shorty})`);

        ws.send(JSON.stringify({
            type: 'name',
            name: userName
        }));

        chatRooms[shorty].clients.add(ws);

        if (chatRooms[shorty].messages.length > 0) {
            ws.send(JSON.stringify({
                type: 'history',
                messages: chatRooms[shorty].messages
            }));
        }

        ws.on('message', (message) => {
            try {
                const data = JSON.parse(message.toString());
                
                if (data.type === 'getHistory') {
                    ws.send(JSON.stringify({
                        type: 'history',
                        messages: chatRooms[shorty].messages
                    }));
                    return;
                }
                
                console.log(`[WSC ${shorty}] ${userName}: ${data.text}`);
                
                const msgObj = {
                    type: 'message',
                    name: userName,
                    img: data.img,
                    side: data.side,
                    text: data.text
                };
                
                chatRooms[shorty].messages.push(msgObj);
                
                chatRooms[shorty].clients.forEach(client => {
                    if (client.readyState === WebSocket.OPEN) {
                        client.send(JSON.stringify(msgObj));
                    }
                });
            } catch (error) {
                console.error(`${err} Failed to process message:`, error);
            }
        });

        ws.on('close', () => {
            console.log(`${info} ${userName} disconnected (chat room: ${shorty})`);
            chatRooms[shorty].clients.delete(ws);
        });
    });

    return wss;
}

module.exports = initializeWebSocketServer;
