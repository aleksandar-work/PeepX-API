import { Router, Response, Request } from 'express';

import { verify } from '../../auth/userToken';
import requireLogin from '../../middleware/requireLogin';
import * as httpMessages from '../../utils/httpMessages';
import { logger } from '../../utils/logging';
import { chatServices } from '../../services/ChatServices';
import { userServices } from '../../services/UserServices';
// import { validationRules, validationFunc } from './validation';
import { promisify, isEmpty, escapeString } from '../../utils';

class ChatController {
    public router: Router;
    public constructor() {
        this.router = Router();
        this.routes();
    }

    public routes() {
        this.router.get('/', requireLogin, this.getChats);
        this.router.post('/', requireLogin, this.createMessage);
        this.router.get(
            '/findChatWithUser/:destinationUserId',
            requireLogin,
            this.findChatWithUser,
        );
        this.router.get('/:id', requireLogin, this.getMessages);
        this.router.post('/:id', requireLogin, this.createMessage);
    }

    private getChats = async (req: Request, res: Response): Promise<any> => {
        const userId: string = await this.parseUserId(req);
        const [chats, chatsErr] = await promisify(chatServices.findAll(userId));
        if (chatsErr) {
            logger(req.ip, chatsErr, 500);
            return res.status(500).json(httpMessages.code500());
        }
        return res.status(200).json(httpMessages.code200(chats));
    };

    private createMessage = async (
        req: Request,
        res: Response,
    ): Promise<any> => {
        const userId: string = await this.parseUserId(req);
        const data = {
            userId,
        };
        const { destinationUserId } = req.body;
        let { chatId } = req.body;

        /**
         * Build message object
         */
        for (const key in req.body) {
            if (req.body.hasOwnProperty(key)) {
                data[key] = escapeString(req.body[key]).trim();
            }
        }

        if (!chatId) {
            const [chatExists, chatExistsErr] = await promisify(
                chatServices.findChatWithUser(userId, destinationUserId),
            );
            if (chatExistsErr) {
                console.log(chatExistsErr);
            }
            if (isEmpty(chatExists) || !chatExists) {
                const [newChat, newChatErr]: [any, any] = await promisify(
                    chatServices.create({
                        members: [userId, destinationUserId],
                    }),
                );
                if (newChatErr) {
                    console.log(newChatErr);
                }
                chatId = newChat.id;
            } else {
                chatId = chatExists.id;
            }
        }
        /**
         * Validate if chat already exists
         */
        const [chat, chatErr]: [any, any] = await promisify(
            chatServices.createMessage(chatId, data),
        );
        if (chatErr) {
            return res.status(500).json(httpMessages.code500());
        }

        return res.status(200).json(httpMessages.code200(chat));
    };
    private getMessages = async (req: Request, res: Response) => {
        const chatId = req.params.id;

        const [chat, chatErr]: [any, any] = await promisify(
            chatServices.findOne('id', chatId),
        );
        if (chatErr) {
            return res.status(500).json(httpMessages.code500());
        }

        return res.status(200).json(httpMessages.code200(chat));
    };

    private findChatWithUser = async (req: Request, res: Response) => {
        const userId: string = await this.parseUserId(req);
        const destinationUserId = req.params.destinationUserId;

        const [chat, chatErr] = await promisify(
            chatServices.findChatWithUser(userId, destinationUserId),
        );
        if (chatErr) {
            console.log(chatErr);
        }

        if (!chat || isEmpty(chat)) {
            const [newChat, newChatErr] = await promisify(
                chatServices.create({ members: [userId, destinationUserId] }),
            );
            if (newChatErr) {
                console.log(newChatErr);
            }
            return res.status(200).json(httpMessages.code200(newChat));
        }

        return res.status(200).json(httpMessages.code200(chat));
    };

    private parseUserId = async (req: Request): Promise<any> => {
        if (req.headers && req.headers.authorization) {
            const authorization = req.headers.authorization;
            const decoded: any = verify(authorization);

            const [user, userErr] = await promisify(
                userServices.findOne('id', decoded.sub),
            );
            if (userErr) {
                return Promise.resolve(null);
            }

            return Promise.resolve(user.id);
        }
    };
}

export default new ChatController().router;
