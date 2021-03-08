import * as faker from 'faker';

import { UserDocument } from '../../types/models/user';

const nearByUsers = (userId: string) => ({
    userId,
    location: {
        longitude: faker.address.longitude(),
        latitude: faker.address.latitude(),
    },
});

export default function(users: UserDocument[]) {
    const locations: any[] = [];
    for (const u of users) {
        locations.push({ ...nearByUsers(u.id) });
    }

    console.log(`=> Updated ${users.length} users location`);

    return locations;
}
