import * as faker from 'faker';

import { userServices } from '../../services/UserServices';
import { promisify } from '../../utils';
import { r, expect } from '../setup';

const genUserData = () => ({
    userName: `${faker.internet.userName()}w`,
    firstName: faker.name.firstName(),
    lastName: faker.name.lastName(),
    email: `w${faker.internet.email()}`,
    password: 'My_passwd@12',
});

describe('=> API Login Endpoint <=', () => {
    it('=> basicLogin should return user obj along with JWT token and authorization header after login', async () => {
        const userObj = genUserData();
        await promisify(userServices.create(userObj));

        const { email, password } = userObj;
        const response = await r
            .post('/v1/login')
            .set('Content-Type', 'application/json')
            .send({ email, password });

        expect(response.body.response).to.haveOwnProperty('id');
        expect(response.body.response).to.haveOwnProperty('email');
        expect(response.body.response).to.haveOwnProperty('authToken');
        expect(response.body.response).to.not.haveOwnProperty('password');
        expect(response.status).to.equal(200);
    });
    it('=> basicLogin should return 401 for invalid credentials & 404 for user not found', async () => {
        const userObj = genUserData();
        await promisify(userServices.create(userObj));

        const { email, password } = userObj;
        const response = await r
            .post('/v1/login')
            .set('Content-Type', 'application/json')
            .send({ password, email: `dsani${email}` });

        expect(response.status).to.equal(404);

        const response2 = await r
            .post('/v1/login')
            .set('Content-Type', 'application/json')
            .send({ email, password: `${password}dsa` });

        expect(response2.status).to.equal(401);
    });
});
