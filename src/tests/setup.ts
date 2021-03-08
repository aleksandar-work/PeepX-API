import * as chai from 'chai';
import * as request from 'supertest';
import * as chaiPromises from 'chai-as-promised';

import bootstrap from '../bootstrap';
import database from '../database';

chai.use(chaiPromises);

before(async () => {
    await bootstrap();
});

beforeEach(async () => {
    await database.clearDatabase();
});

after(async () => {
    await database.clearDatabase();
    await database.closeConnection();
    console.log('=> Connections closed');
});

export const r = request('http://localhost:8080');
export const expect = chai.expect;
