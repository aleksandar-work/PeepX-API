import { create } from './create';
import { findAll } from './findAll';
import { findOne } from './findOne';
import { createMessage } from './createMessage';
import { findChatWithUser } from './findChatWithUser';

export const chatServices = {
    create,
    createMessage,
    findAll,
    findChatWithUser,
    findOne,
};
