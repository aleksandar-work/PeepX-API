import * as chai from 'chai';
import * as chaiPromises from 'chai-as-promised';
import * as faker from 'faker';

import { nearBy } from '../nearBy';
import { create } from '../create';
import { userServices } from '../../UserServices';
import { promisify } from '../../../utils';
import seedNearByUsers from '../../../database/seeders/seedNearByUsers';
import seedUsers from '../../../database/seeders/seedUsers';

chai.use(chaiPromises);
const expect = chai.expect;

const locationData = {
    latitude: faker.address.latitude(),
    longitude: faker.address.longitude(),
};

describe('=> nearByUser service <=', () => {
    it('=> should return empty array if the user doesnt have location data', async () => {
        const [usersNearby, usersNearbyErr] = await promisify(
            nearBy('96345daf-7fe7-472f-b4fa-ef49f7bf0d40', 100000),
        );
        expect(usersNearbyErr).to.equal(undefined);
        expect(usersNearby).to.eql([]);
    });
    it('=> should return users within the specified radius', async () => {
        const [user, userErr]: [any, any] = await promisify(
            userServices.create({
                userName: faker.internet.userName(),
                firstName: faker.name.firstName(),
                lastName: faker.name.lastName(),
                email: faker.internet.email(),
                password: 'My_passdswd@12',
            }),
        );
        expect(userErr).to.equal(undefined);

        const users = await seedUsers(2);
        await seedNearByUsers(users);

        const [, userLocationDataErr] = await promisify(
            create(user.id, locationData),
        );
        expect(userLocationDataErr).to.equal(undefined);

        const [, nearByUsersErr]: [any, any] = await promisify(
            nearBy(user.id, 100000),
        );
        expect(nearByUsersErr).to.equal(undefined);
    });
});
