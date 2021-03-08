import { chat as Chat } from '../../models/Chat/index';
import { filteredModel } from '../../models/helpers';
import { logger } from '../../utils/logging';
import { isEmpty, promisify } from '../../utils';

type FindAllType = (
    userId: string,
    filter?: boolean,
    fields?: string[],
) => Promise<object>;

export const findAll: FindAllType = async (
    userId: string,
    filter = true,
    fields = [],
) => {
    console.log(userId);
    const [chats, chatsErr] = await promisify(
        Chat.find({ members: userId })
            .populate('members', ['id', 'userName', 'profilePhoto'])
            .populate({
                path: 'messages',
                options: {
                    limit: 1,
                    sort: { createdAt: -1 },
                },
            })
            .exec(),
    );
    if (chatsErr) {
        logger('Find All Chats Service', chatsErr, 500);
        return Promise.reject({ code: 500, message: chatsErr.message });
    }
    if (!chats || isEmpty(chats)) {
        return Promise.resolve([]);
    }
    if (filter) {
        return Promise.resolve(filteredModel(chats, fields));
    }

    return Promise.resolve(chats);
};
