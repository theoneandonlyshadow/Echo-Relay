const WebSocket = require('ws');

function initializeWebSocketServer(server) {
    const wss = new WebSocket.Server({ server });
    const chatRooms = {};
    
    wss.on('connection', (ws, req) => {
        const urlParams = new URLSearchParams(req.url.split('?')[1]);
        const shorty = urlParams.get("chat");
        
        if (!shorty) {
            ws.close();
            return;
        }
        
        if (!chatRooms[shorty]) {
            chatRooms[shorty] = {
                clients: new Set(),
                messages: []
            };
        }
        
        const room = chatRooms[shorty];
        
        if (room.clients.size >= 20) {
            ws.send(JSON.stringify({
                type: 'error',
                message: 'chat room is full'
            }));
            ws.close();
            return;
        }
        
        room.clients.add(ws);
        
        const connectionMsg = {
            type: 'connection', 
            message: `Someone has joined the chat. Total users: ${room.clients.size}`
        };
        
        broadcastToRoom(room, connectionMsg);
        
        if (room.messages.length > 0) {
            ws.send(JSON.stringify({
                type: 'history',
                messages: room.messages
            }));
        }
        
        broadcastToRoom(room, {
            type: 'userCount',
            count: room.clients.size
        });
        
        ws.on('message', (message) => {
            try {
                const data = JSON.parse(message.toString());
                
                if (data.type === 'name') {
                    userName = data.name || userName;
                    
                    ws.send(JSON.stringify({
                        type: 'name',
                        name: userName
                    }));
                    
                    return;
                }
                
                if (data.type === 'getHistory') {
                    ws.send(JSON.stringify({
                        type: 'history',
                        messages: room.messages
                    }));
                    return;
                }
                
                if (data.type === 'getUserCount') {
                    ws.send(JSON.stringify({
                        type: 'userCount',
                        count: room.clients.size
                    }));
                    return;
                }
                
                if (data.type === 'message') {
                    const messageId = data.messageId || `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
                    
                    const msgForHistory = {
                        type: 'message',
                        name: data.name || userName,
                        img: data.img || '',
                        side: 'left',
                        text: data.text,
                        messageId: messageId
                    };
                    
                    room.messages.push(msgForHistory);
                    // limit history for memory issues
                    if (room.messages.length > 100) {
                        room.messages.shift();
                    }
                    
                    room.clients.forEach(client => {
                        if (client !== ws && client.readyState === WebSocket.OPEN) {
                            client.send(JSON.stringify({
                                type: 'message',
                                name: data.name || userName,
                                img: data.img || '',
                                side: 'left',
                                text: data.text,
                                messageId: messageId
                            }));
                        }
                    });
                }
            } catch (error) {
                console.error('Failed to process message:', error);
            }
        });
        
        ws.on('close', () => {
            room.clients.delete(ws);
            
            const disconnectMsg = {
                type: 'connection',
                message: `${userName} has left the chat. Total users: ${room.clients.size}`
            };
            
            broadcastToRoom(room, disconnectMsg);
            
            broadcastToRoom(room, {
                type: 'userCount',
                count: room.clients.size
            });
            // clean up empty rooms
            if (room.clients.size === 0) {
                delete chatRooms[shorty];
                console.log(`Room ${shorty} is now empty and has been removed`);
            }
        });
        
        ws.on('error', (error) => {
            console.error('WebSocket error:', error);
        });
    });
    
    function broadcastToRoom(room, message) {
        room.clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify(message));
            }
        });
    }
    
    // ping all clients every 30 seconds to keep connections alive
    setInterval(() => {
        for (const shorty in chatRooms) {
            const room = chatRooms[shorty];
            room.clients.forEach(client => {
                if (client.readyState === WebSocket.OPEN) {
                    client.ping();
                }
            });
        }
    }, 30000);
    
    return wss;
}

module.exports = initializeWebSocketServer;