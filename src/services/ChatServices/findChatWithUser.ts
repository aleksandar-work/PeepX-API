import { chat as Chat } from '../../models/Chat/index';
import { filteredModel } from '../../models/helpers';
import { logger } from '../../utils/logging';
import { isEmpty, promisify } from '../../utils';

type findChatWithUserType = (
    userId: string,
    destinationUserId: string,
    filters?: boolean,
    fields?: string[],
) => Promise<object>;

export const findChatWithUser: findChatWithUserType = async (
    userId,
    destinationUserId,
    filter = true,
    fields = [],
) => {
    const [chat, chatErr] = await promisify(
        Chat.findOne({
            $and: [{ members: userId }, { members: destinationUserId }],
        })
            .populate('messages')
            .populate('members', ['id', 'userName', 'profilePhoto'])
            .exec(),
    );

    if (chatErr) {
        logger('Find Chat By Users Service', chatErr, 500);

        return Promise.reject({ code: 500, message: chatErr.message });
    }

    if (!chat || isEmpty(chat)) {
        return Promise.reject({ code: 404, message: 'Chat not found' });
    }

    if (filter) {
        return Promise.resolve(filteredModel(chat, fields));
    }

    return Promise.resolve(chat);
};
