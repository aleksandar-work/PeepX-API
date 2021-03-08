import * as compression from 'compression';
import * as express from 'express';
import * as morgan from 'morgan';
import * as helmet from 'helmet';
import * as cors from 'cors';
import * as frameguard from 'frameguard';
import * as passport from 'passport';

import { controllers } from './controllers';
import { passportConfig, gate, contentType, errorHandler } from './middleware';

morgan.token('id', req => req.ip);

class Server {
    public app: express.Application;

    public constructor() {
        this.app = express();
        this.config();
        this.routes();
    }

    public config() {
        this.app.disable('x-powered-by');
        this.app.use(frameguard({ action: 'deny' }));
        this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));
        this.app.use(express.json({ limit: '10mb' }));
        this.app.use(compression());
        const loggerFormat =
            ':id [:date[web]] ":method :url" :status :response-time';
        this.app.use(
            morgan(loggerFormat, {
                stream: process.stderr,
            }),
        );
        this.app.use(helmet());
        this.app.use(
            cors({
                credentials: true,
                origin: '*',
            }),
        );
        passportConfig();
        this.app.use(passport.initialize());
    }

    routes() {
        const router = express.Router();

        // Handle bad request payloads etc
        this.app.use(gate);

        this.app.use('/v1', router);

        // Only allow specific content types
        router.use(contentType);

        router.use('/login', controllers.LoginController);
        router.use('/logout', controllers.LogoutController);
        router.use('/users', controllers.UserController);
        router.use('/nearByUsers', controllers.NearByUsersController);
        router.use('/chats', controllers.ChatController);
        router.use('/newsfeed', controllers.NewsFeedController);
        router.use('/comments', controllers.CommentsController);

        // To prevent 404 if using the API in browser
        const noContentUrls = ['/favicon.ico', '/robots.txt'];
        noContentUrls.forEach(url => {
            router.get(url, (_, res) => res.sendStatus(204));
        });

        // Catch straggling errors
        this.app.use(errorHandler);
    }
}

export default Server;
