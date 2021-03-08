import 'dotenv-safe/config';
import 'reflect-metadata';
import * as socketIo from 'socket.io';
import { createServer } from 'http';

import { logger } from './utils/logging';
import database from './database';
import server from './server';
import websocket from './websocket';

const port = process.env.PORT || 8080;

let httpServer = createServer();
async function main() {
    await database.init();

    const apiServer = new server().app;
    apiServer.set('port', port);
    httpServer = createServer(apiServer);
    const io = socketIo(httpServer);
    httpServer.listen(port);
    httpServer.on('error', onError);
    websocket(io);

    console.log(`Server Listening on port ${port}`);
}

function onError(error: NodeJS.ErrnoException): void {
    logger('Error in index', error, 500);
    console.error('Error in Index: ', error);

    if (error.syscall !== 'listen') {
        throw error;
    }
    const bind = typeof port === 'string' ? `Pipe ${port}` : `Port ${port}`;
    switch (error.code) {
        case 'EACCES':
            console.error(`${bind} requires elevated privileges`);
            closeDBConnection();
            closeServer();
            process.exit(1);
            break;
        case 'EADDRINUSE':
            console.error(`${bind} is already in use`);
            closeDBConnection();
            closeServer();
            process.exit(1);
            break;
        default:
            throw error;
    }
}

function closeDBConnection() {
    database.closeConnection().then(() => console.log('DB connection closed.'));
}

function closeServer() {
    httpServer.close();
}

process.on('uncaughtException', (exception: NodeJS.ErrnoException): void => {
    logger('uncaughtException in index', exception, 500);
    console.error('uncaughtException: ', exception);
    closeDBConnection();
    closeServer();

    process.exit(1);
});

process.on('unhandledRejection', (reason: any, promise: any): void => {
    logger('unhandledRejection in index', { reason, promise }, 500);
    console.error('unhandledRejection: ', promise, ' reason: ', reason);
    closeDBConnection();
    closeServer();

    process.exit(1);
});

// Clean up on nodemon restarts
process.once('SIGUSR2', () => {
    closeDBConnection();
    process.kill(process.pid, 'SIGUSR2');
});

process.on('SIGINT', () => {
    closeDBConnection();
    closeServer();
    process.exit(0);
});

process.on('SIGTERM', () => {
    closeDBConnection();
    closeServer();
    process.exit(0);
});

export default main;
