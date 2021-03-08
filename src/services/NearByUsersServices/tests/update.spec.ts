import * as chai from 'chai';
import * as chaiPromises from 'chai-as-promised';
import * as faker from 'faker';

import { create } from '../create';
import { update } from '../update';
import { userServices } from '../../UserServices';
import { promisify } from '../../../utils';

chai.use(chaiPromises);
const expect = chai.expect;

const locationData = {
    latitude: faker.address.latitude(),
    longitude: faker.address.longitude(),
};

describe('=> Update nearByUser service <=', () => {
    it('=> should return updated user location data', async () => {
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

        const newLocationData = {
            latitude: faker.address.latitude(),
            longitude: faker.address.longitude(),
        };

        const [updatedUserLocationData, updatedUserLocationDataErr]: [
            any,
            any
        ] = await promisify(update(user.id, newLocationData));
        expect(updatedUserLocationDataErr).to.equal(undefined);

        expect(updatedUserLocationData.loc.coordinates).to.not.eql([
            locationData[0],
            locationData[1],
        ]);
        expect(updatedUserLocationData).to.haveOwnProperty('loc');
        expect(updatedUserLocationData).to.not.haveOwnProperty('__v');
    });
    it('=> should return new user location data if it didnt exist before', async () => {
        const [userLocationData, userLocationDataErr] = await promisify(
            update('96345daf-7fe7-472f-b4fa-ef49f7bf0d40', locationData),
        );

        expect(userLocationDataErr).to.equal(undefined);
        expect(userLocationData).to.haveOwnProperty('loc');
        expect(userLocationData).to.not.haveOwnProperty('__v');
    });
});
