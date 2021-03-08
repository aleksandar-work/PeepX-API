import { logger } from '../../utils/logging';
import { isEmpty, promisify } from '../../utils';
import { filteredModel } from '../../models/helpers';
import { find } from './find';
import { create } from './create';

/**
 * Updates a users location log.
 *
 * @param {string} userId current logged in users id
 * @param {object} location the longitude and latitude of
 * the current logged in users last logged location.
 *
 * @returns {NearByUsers}
 */
interface Location {
    longitude: string | number;
    latitude: string | number;
}

type UpdateType = (
    userId: string,
    location: Location,
) => Promise<object | null>;

export const update: UpdateType = async (userId, location) => {
    const [currentUserLocationData, currentUserLocationDataErr]: [
        any,
        any
    ] = await promisify(find(userId, false));
    if (currentUserLocationDataErr) {
        logger('Update Near By Users', currentUserLocationDataErr, 500);

        return Promise.reject({
            code: 500,
            message: currentUserLocationDataErr.message,
        });
    }

    /**
     * If the user doesn't have a last logged location
     * create the location record, otherwise update the current
     * user location info.
     */
    if (!currentUserLocationData || isEmpty(currentUserLocationData)) {
        // Create
        const [newUserLocationData, newUserLocationDataErr] = await promisify(
            create(userId, location),
        );

        if (newUserLocationDataErr) {
            logger('Update Near By Users', newUserLocationDataErr, 500);

            return Promise.reject({
                code: 500,
                message: newUserLocationDataErr.message,
            });
        }

        if (!newUserLocationData) {
            return Promise.resolve(null);
        }

        return Promise.resolve(newUserLocationData);
    }

    // Update
    currentUserLocationData.loc.type = 'Point';
    currentUserLocationData.loc.coordinates = [
        location.longitude,
        location.latitude,
    ];

    const [
        updatedUserLocationData,
        updatedUserLocationDataErr,
    ] = await promisify(currentUserLocationData.save());
    if (updatedUserLocationDataErr) {
        logger('Update Near By Users', updatedUserLocationDataErr, 500);

        return Promise.reject({
            code: 500,
            message: updatedUserLocationDataErr.message,
        });
    }

    if (!updatedUserLocationData) {
        return Promise.resolve(null);
    }

    return Promise.resolve(filteredModel(updatedUserLocationData));
};
