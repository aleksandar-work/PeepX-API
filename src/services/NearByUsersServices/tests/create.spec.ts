import * as chai from 'chai';
import * as chaiPromises from 'chai-as-promised';
import * as faker from 'faker';

import { create } from '../create';
import { userServices } from '../../UserServices';
import { promisify } from '../../../utils';

chai.use(chaiPromises);
const expect = chai.expect;

const locationData = {
    latitude: faker.address.latitude(),
    longitude: faker.address.longitude(),
};

describe('=> Create nearByUser service <=', () => {
    it('=> should create new user location data', async () => {
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

        const [userLocationData, userLocationDataErr] = await promisify(
            create(user.id, locationData),
        );
        expect(userLocationDataErr).to.equal(undefined);

        expect(userLocationData).to.haveOwnProperty('userId');
        expect(userLocationData).to.haveOwnProperty('loc');
        expect(userLocationData).to.not.haveOwnProperty('__v');
    });
});
