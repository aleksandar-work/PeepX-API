import { nearByUsers as NearByUsers  } from '../../models/NearByUsers/index';
import { logger } from '../../utils/logging';
import { promisify } from '../../utils';

/**
 * Creates a new user location record.
 *
 * @param {string} userId current logged in users id
 * @param {object} location the longitude and latitude of the user
 *
 * @returns {NearByUsers model}
 */
interface Location {
    longitude: string | number;
    latitude: string | number;
}

type CreateType = (
    userId: string,
    location: Location,
) => Promise<object | null>;

export const create: CreateType = async (userId, location) => {
    const user = {
        userId,
        loc: {
            type: 'Point',
            coordinates: [
                Number(location.longitude),
                Number(location.latitude),
            ],
        },
    };

    const [, err] = await promisify(NearByUsers.create(user));
    if (err) {
        logger('Create Near By User', err, 500);

        return Promise.reject({ code: 500, message: err.message });
    }

    return Promise.resolve(user);
};
