import { chat as Chat } from '../../models/Chat/index';
import { message as Message } from '../../models/Message/index';
import { filteredModel } from '../../models/helpers';
import { logger } from '../../utils/logging';
import { isEmpty, promisify } from '../../utils';

type CreateMessageType = (
    chatId: string,
    message: object,
    destinationUserId?: string,
    filter?: boolean,
    fields?: string[],
) => Promise<object | null>;

export const createMessage: CreateMessageType = async (
    chatId,
    message,
    destinationUserId = '',
    filter = true,
    fields = [],
) => {
    let [chat, chatErr] = await promisify(
        Chat.findById(chatId)
            .populate('messages')
            .populate('members', ['id', 'userName', 'profilePhoto'])
            .exec(),
    );
    if (chatErr) {
        if (Number(chatErr.code) === 11000) {
            return Promise.reject({ code: 409, message: chatErr.message });
        }

        logger('CreateMessage Chat Service', chatErr, 500);
        return Promise.reject({ code: 500, message: chatErr.message });
    }

    if (!chat || isEmpty(chat)) {
        [chat, chatErr] = await promisify(
            Chat.create({
                members: [destinationUserId, message[`user`]],
            }),
        );
        if (chatErr) {
            logger('CreateMessage Chat Service', chatErr, 500);
            return Promise.reject({ code: 500, message: chatErr.message });
        }
    }

    const [newMessage, newMessageErr] = await promisify(
        Message.create(message),
    );

    if (newMessageErr) {
        return Promise.reject({ code: 500, message: newMessageErr.message });
    }

    if (!newMessage || isEmpty(newMessage)) {
        return Promise.resolve(chat);
    }

    chat.messages.push(newMessage);
    chat.save();
    chat.execPopulate();

    if (filter) {
        return Promise.resolve(filteredModel(chat, fields));
    }

    return Promise.resolve(chat);
};
