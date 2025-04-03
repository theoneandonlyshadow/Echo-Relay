const WebSocket = require('ws');
const { info, succ, err } = require('../controllers/LoggerStyles.js');

function initializeWebSocketServer(server) {
    const wss = new WebSocket.Server({ server });
    const chatRooms = {}; //store the chat sessions

    wss.on('connection', (ws, req) => {
        const urlParams = new URL(req.url, `http://${req.headers.host}`);
        const shorty = urlParams.searchParams.get("chat");

        if (!shorty) {
            console.log(`${warn} connection without shorty rejected.`);
            ws.close();
            return;
        }

        if (!chatRooms[shorty]) {
            chatRooms[shorty] = new Set();
        }

        // limit to 20 users
        if (chatRooms[shorty].size >= 20) {
            console.log(`${info} chat room ${shorty} is full. connection rejected.`);
            // needs to be changed later so users get a "blocked" css anime instead of a message
            ws.send(JSON.stringify({
                type: 'error',
                message: 'chat room is full. limit is 20 users.'
            }));
            ws.close();
            return;
        }

        // assign a random username for now. later we can implement a username system
        const userName = `User${Math.floor(Math.random() * 1000)}`;
        console.log(`${info} user connected: ${userName} (chat room: ${shorty})`);

        // send the user their assigned name
        ws.send(JSON.stringify({
            type: 'name',
            name: userName
        }));

        // add user to the chat
        chatRooms[shorty].add(ws);

        // incoming message handler
        // WSC = WebSocket Chat
        ws.on('message', (message) => {
            const data = JSON.parse(message.toString());
            console.log(`[WSC ${shorty}] ${userName}: ${data.text}`); // remove later

            const msgObj = JSON.stringify({
                type: 'message',
                name: userName,
                img: data.img,
                side: data.side,
                text: data.text
            });

            ws.send(msgObj);

            // broadcast messages
            chatRooms[shorty].forEach(client => {
                if (client !== ws && client.readyState === WebSocket.OPEN) {
                    client.send(msgObj);
                }
            });
        });

        // user disconnection handler
        ws.on('close', () => {
            console.log(`${info} ${userName} disconnected (chat room: ${shorty})`);
            chatRooms[shorty].delete(ws);

            // clean up empty rooms
            if (chatRooms[shorty].size === 0) {
                delete chatRooms[shorty];
            }
        });
    });

    return wss;
}

module.exports = initializeWebSocketServer;
