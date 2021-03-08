import { user as User } from '../../models/User/index';
import { filteredModel } from '../../models/helpers';
import { logger } from '../../utils/logging';
import { isEmpty, promisify } from '../../utils';

/**
 * Find all users in db
 *
 * @param {boolean} filter - If the return value must be a filtered user.
 * @param {array} fields - Fields to filter.
 *
 * @returns {array} users
 */

type FindAllType = (filter?: boolean, fields?: string[]) => Promise<object>;

export const findAll: FindAllType = async (filter = true, fields = []) => {
    const [users, usersErr] = await promisify(User.find({}).exec());
    if (usersErr) {
        logger('Find All User Service', usersErr, 500);
        return Promise.reject({ code: 500, message: usersErr.message });
    }
    if (!users || isEmpty(users)) {
        return Promise.resolve([]);
    }
    if (filter) {
        return Promise.resolve(filteredModel(users, fields));
    }

    return Promise.resolve(users);
};
