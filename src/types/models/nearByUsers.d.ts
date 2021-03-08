import { Document } from 'mongoose';

const enum LOCATION_PROVIDERS_E {
    'Point',
}

export interface Location {
    type: LOCATION_PROVIDERS_E;
    coordinates: number;
}

export interface NearByUsersDocument extends Document {
    id: string;
    userId: string;
    loc: Location;
}
