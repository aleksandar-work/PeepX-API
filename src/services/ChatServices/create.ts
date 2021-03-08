import { chat as Chat } from '../../models/Chat/index';
import { filteredModel } from '../../models/helpers';
import { logger } from '../../utils/logging';
import { isEmpty, promisify } from '../../utils';

type CreateType = (
    chat: object,
    filter?: boolean,
    fields?: string[],
) => Promise<object | null>;

export const create: CreateType = async (chat, filter = true, fields = []) => {
    const [newChat, newChatErr] = await promisify(Chat.create(chat));
    if (newChatErr) {
        if (Number(newChatErr.code) === 11000) {
            return Promise.reject({ code: 409, message: newChatErr.message });
        }

        logger('Create Chat Service', newChatErr, 500);

        return Promise.reject({ code: 500, message: newChatErr.message });
    }

    if (!newChat || isEmpty(newChat)) {
        return Promise.resolve(null);
    }

    if (filter) {
        return Promise.resolve(filteredModel(newChat, fields));
    }

    return Promise.resolve(newChat);
};
