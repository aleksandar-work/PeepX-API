import { user as User } from '../../models/User/index';
import { filteredModel } from '../../models/helpers';
import { logger } from '../../utils/logging';
import { isEmpty, promisify } from '../../utils';

/**
 * Create a new mongodb user record.
 *
 * @param {Object} user - the user data posted from req.body.
 * @param {boolean} filter - If the return value must be a filtered user.
 * @param {array} fields - Fields to filter.
 *
 * @returns {object} new user data
 */

type CreateType = (
    user: object,
    filter?: boolean,
    fields?: string[],
) => Promise<object | null>;

export const create: CreateType = async (user, filter = true, fields = []) => {
    const [newUser, newUserErr] = await promisify(User.create(user));
    if (newUserErr) {
        if (Number(newUserErr.code) === 11000) {
            return Promise.reject({ code: 409, message: newUserErr.message });
        }

        logger('Create User Service', newUserErr, 500);

        return Promise.reject({ code: 500, message: newUserErr.message });
    }

    if (!newUser || isEmpty(newUser)) {
        return Promise.resolve(null);
    }

    if (filter) {
        return Promise.resolve(filteredModel(newUser, fields));
    }

    return Promise.resolve(newUser);
};
