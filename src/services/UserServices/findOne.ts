import { user as User } from '../../models/User/index';
import { filteredModel } from '../../models/helpers';
import { logger } from '../../utils/logging';
import { isEmpty, promisify } from '../../utils';

/**
 * Find one user in mongodb by key, value
 *
 * @param {string} key - Name of field to search for user record.
 * @param {string} value - Value to search for.
 * @param {boolean} filter - If the return value must be a filtered user.
 * @param {array} fields - Fields to filter.
 *
 * return {object} user
 */
type FindOneType = (
    key: string,
    value: string | number,
    filter?: boolean,
    fields?: string[],
) => Promise<object>;

export const findOne: FindOneType = async (
    key,
    value,
    filter = true,
    fields = [],
) => {
    const [user, userErr] = await promisify(
        User.findOne({ [key]: value }).exec(),
    );

    if (userErr) {
        logger('Find One User Service', userErr, 500);

        return Promise.reject({ code: 500, message: userErr.message });
    }

    if (!user || isEmpty(user)) {
        return Promise.reject({ code: 404, message: 'User not found' });
    }

    if (filter) {
        return Promise.resolve(filteredModel(user, fields));
    }

    return Promise.resolve(user);
};
