import { filteredModel } from '../../models/helpers';
import { logger } from '../../utils/logging';
import { promisify } from '../../utils';
import { UserModel } from '../../types/models/user';

/**
 * Update user in mongodb
 *
 * @param {mongoose model} user - Mongoose user model instance to be updated.
 * @param {boolean} filter - If the return value must be a filtered user.
 * @param {array} fields - Fields to filter.
 *
 * @returns {object} updated user
 */
type UpdateType = (
    user: UserModel,
    filter?: boolean,
    fields?: string[],
) => Promise<object | null>;

export const update: UpdateType = async (user, filter = true, fields = []) => {
    if (typeof user.follows[0] === 'string') user.follows = [];
    if (typeof user.socialMedia[0] === 'string') user.socialMedia = [];

    const [updatedUser, updatedUserErr] = await promisify(user.save());
    if (updatedUserErr) {
        logger('Update User Service', updatedUserErr, 500);

        return Promise.reject({ code: 500, message: updatedUserErr.message });
    }

    if (!updatedUser) {
        return Promise.resolve(null);
    }

    if (filter) {
        return Promise.resolve(filteredModel(updatedUser, fields));
    }

    return Promise.resolve(updatedUser);
};
