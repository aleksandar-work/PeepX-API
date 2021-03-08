import * as chai from 'chai';
import * as chaiPromises from 'chai-as-promised';
import * as faker from 'faker';

import { create } from '../create';
import { find } from '../find';
import { userServices } from '../../UserServices';
import { promisify } from '../../../utils';

chai.use(chaiPromises);
const expect = chai.expect;

const locationData = {
    latitude: faker.address.latitude(),
    longitude: faker.address.longitude(),
};

describe('=> Find nearByUser service <=', () => {
    it('=> should return existing user location data', async () => {
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

        const [, userLocationDataErr] = await promisify(
            create(user.id, locationData),
        );
        expect(userLocationDataErr).to.equal(undefined);

        const [
            foundUserLocationData,
            foundUserLocationDataErr,
        ] = await promisify(find(user.id));
        expect(foundUserLocationDataErr).to.equal(undefined);

        expect(foundUserLocationData).to.haveOwnProperty('userId');
        expect(foundUserLocationData).to.haveOwnProperty('loc');
        expect(foundUserLocationData).to.not.haveOwnProperty('__v');
    });

    it('=> should return null if user location data doesnt exist', async () => {
        const [
            foundUserLocationData,
            foundUserLocationDataErr,
        ] = await promisify(find('2192'));
        expect(foundUserLocationDataErr).to.equal(undefined);
        expect(foundUserLocationData).to.equal(null);
    });
});
