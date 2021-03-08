import nearByUserFactory from '../factories/nearByUserFactory';
import { nearByUsersServices } from '../../services/NearByUsersServices';
import { promisify } from '../../utils';

export default async function seedNearByUsers(users: []) {
    const locations = nearByUserFactory(users);

    console.log('=> Seeding nearByUsers table');

    const userLocations = locations.map(async ({ userId, location }) => {
        const [nearByUsers, nearByUsersErr] = await promisify(
            nearByUsersServices.update(userId, location),
        );
        if (nearByUsersErr) {
            console.log(nearByUsersErr);

            return null;
        }

        return nearByUsers;
    });

    return Promise.resolve(Promise.all([...userLocations]));
}
