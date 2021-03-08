import { logger } from '../../utils/logging';
import { isEmpty, promisify } from '../../utils';
import { nearByUsers as NearByUsers  } from '../../models/NearByUsers/index';
import { filteredModel } from '../../models/helpers';
import { find } from './find';
import { NearByUsersDocument } from '../../types/models/nearByUsers';

/**
 * Finds all of the user near to the current logged in users
 * last logged location based on radius provided.
 *
 * @param {string} userId current logged in users id.
 * @param {number} radius the search radius around the current
 * users last logged location.
 *
 * @returns {[NearByUsers]}
 */
type NearByType = (
    userId: string,
    radius: number,
) => Promise<NearByUsersDocument[] | [] | object>;

export const nearBy: NearByType = async (userId, radius) => {
    if (!userId || typeof userId !== 'string') {
        throw new Error('A user id must be provided and be type of string.');
    }

    if (!radius) {
        throw new Error('A radius must be provided.');
    }

    const [currentUser, currentUserErr]: [any, any] = await promisify(
        find(userId),
    );
    if (currentUserErr) {
        logger('Get Near By Users', currentUserErr, 500);

        return Promise.reject(new Error(currentUserErr.message));
    }

    if (!currentUser || isEmpty(currentUser)) {
        return Promise.resolve([]);
    }

    // Conduct magic location search
    const [longitude, latitude] = currentUser.loc.coordinates;
    const [users, usersErr]: [any, any] = await promisify(
        NearByUsers.aggregate()
            .near({
                near: {
                    type: 'Point',
                    coordinates: [Number(longitude), Number(latitude)],
                },
                // convert meters to miles
                maxDistance: Number((radius * 1609.344).toFixed(2)),
                spherical: true,
                distanceField: 'dist',
            })
            .exec(),
    );
    if (usersErr) {
        logger('Get Near By Users', usersErr, 500);

        return Promise.reject(new Error(usersErr.message));
    }

    if (!users || isEmpty(users)) {
        return Promise.resolve([]);
    }

    // Remove the current users location data from array
    const usersFound = users.filter(
        (u: NearByUsersDocument) => u.userId !== userId,
    );

    if (usersFound.length > 0) {
        return Promise.resolve(filteredModel(usersFound));
    }

    return Promise.resolve([]);
};
