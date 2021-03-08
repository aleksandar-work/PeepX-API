import * as mongoose from 'mongoose';

import { promisify } from './utils';

const isTesting = process.env.NODE_ENV === 'test';
const uri = isTesting
    ? String(process.env.TEST_DB_URI)
    : String(process.env.DB_URI); // DB_REMOTE should be used in the future, when the data is moved to an external database

const mongooseOptions = {
    auto_reconnect: true,
    useCreateIndex: true,
    useNewUrlParser: true,
    useUnifiedTopology: true,
    reconnectTries: Number.MAX_VALUE,
    reconnectInterval: 1000,
};

class Database {
    conn: mongoose.Connection;
    constructor() {
        this.conn = mongoose.createConnection(uri, mongooseOptions);
    }

    public get connection() {
        return this.conn;
    }

    public async init() {
        await this.closeConnection();
        const [, err] = await promisify(mongoose.connect(uri, mongooseOptions));
        if (err) {
            console.log('Error in mongodb connection: ', err);
        } else {
            console.log(`Mongoose successfully connected at ${uri}`);
            this.conn = mongoose.connection;
        }
    }

    public async closeConnection() {
        await this.conn.close();
    }

    public async clearDatabase() {
        await this.conn.dropDatabase();
    }
}

export default new Database();
