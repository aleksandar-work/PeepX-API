import { nearByUsers as NearByUsers  } from '../../models/NearByUsers/index';
import { logger } from '../../utils/logging';
import { isEmpty, promisify } from '../../utils';
import { filteredModel } from '../../models/helpers';

/**
 * Find a user's last location by the given id
 *
 * @param {string} userId the current logged in user's id
 *
 * @returns {object} NearByUsers model / null
 */
type FindType = (
    userId: string,
    filter?: boolean,
    fields?: [],
) => Promise<object | null>;

export const find: FindType = async (userId, filter = true, fields = []) => {
    const [
        currentUserLocationData,
        currentUserLocationDataErr,
    ] = await promisify(NearByUsers.findOne({ userId }).exec());

    if (currentUserLocationDataErr) {
        logger('Find Near By User', currentUserLocationDataErr, 500);

        return Promise.reject({
            code: 500,
            message: currentUserLocationDataErr.message,
        });
    }

    if (!currentUserLocationData || isEmpty(currentUserLocationData)) {
        return Promise.resolve(null);
    }

    if (filter) {
        return Promise.resolve(filteredModel(currentUserLocationData, fields));
    }

    return Promise.resolve(currentUserLocationData);
};
