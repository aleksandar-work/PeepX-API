import { Socket } from 'socket.io';

import { verify } from './auth/userToken';
import { chatServices } from './services/ChatServices';
import { promisify } from './utils';

let clients: any[] = [];

const websocket = (io: any) => {
    io.on('connection', async (socket: Socket) => {
        const token = socket.handshake.query.token;

        const decoded = verify(token);
        if (!decoded || typeof decoded !== 'object') {
            return io.emit(
                'error',
                'Connection  timed out, please login again.',
            );
        }

        const userId: string = decoded['sub'];
        // get data from the connection that client added to
        const queryChatId = socket.handshake.query.chatId;
        let chatExists = false;
        clients = clients.map(client => {
            if (client.userId === userId) {
                chatExists = true;
                return {
                    userId,
                    chatId: queryChatId,
                    socketId: socket.id,
                };
            }
            return client;
        });
        if (!chatExists) {
            clients.push({ userId, chatId: queryChatId, socketId: socket.id });
        }

        socket.on('connect', () => {
            console.log('connected', socket.connected);
        });

        socket.on('sendMessage', async (data: any) => {
            const { content, destinationUserId, chatId } = data;

            const newMsg = { content, user: userId };
            const [chat, chatErr] = await promisify(
                chatServices.createMessage(chatId, newMsg, destinationUserId),
            );
            if (chatErr) {
                console.log(chatErr);
            }

            const lastMessage = chat.messages.pop();
            clients.forEach(client => {
                console.log(
                    `Message sent by ${userId} and ${chatId}, socket of chat[${client.chatId}] user[${client.userId}]`,
                );
                console.log(`Emit to ${client.socketId}`);
                if (
                    client.chatId === chatId &&
                    client.userId === destinationUserId
                ) {
                    io.to(client.socketId).emit('newMessage', lastMessage);
                }
                if (client.chatId === chatId && client.userId === userId) {
                    io.to(client.socketId).emit('sendSucceed', lastMessage);
                }
            });
        });

        socket.on('disconnect', reason => {
            console.log('disconnected', socket.disconnected, reason);
            clients = clients.filter(client => client.socketId !== socket.id);
        });
    });
};

export default websocket;
