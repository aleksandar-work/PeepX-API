import { logger } from '../../utils/logging';
import { promisify } from '../../utils';
import { UserModel } from '../../types/models/user';

/**
 * Remove one user in mongodb by mongoose user model
 *
 * @param {mongoose model} user - Mongoose user model instance to be deleted.
 *
 * @returns {string}
 */
type RemoveType = (key: UserModel) => Promise<any>;

export const remove: RemoveType = async user => {
    const [, removeUserErr] = await promisify(user.remove());
    if (removeUserErr) {
        logger('Remove User Service', removeUserErr, 500);

        return Promise.reject({ code: 500, message: removeUserErr.message });
    }

    return Promise.resolve(null);
};
