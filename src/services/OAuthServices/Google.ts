import axios from 'axios';

import { logger } from '../../utils/logging';
import { promisify } from '../../utils';

const BASE_URL = 'https://www.googleapis.com/userinfo/v2/me';

async function authAsync(token: string) {
    const [response, responseErr]: [any, any] = await promisify(
        axios.get(BASE_URL, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
            timeout: 5000,
        }),
    );

    if (responseErr) {
        logger('Google OAuth Error', responseErr, 500);

        return Promise.reject(new Error(responseErr.message));
    }

    if (!response || response.status !== 200) {
        logger('Google OAuth Error', response, 500);

        return Promise.reject(new Error('Google OAuth Error'));
    }

    return Promise.resolve(response.data);
}

export const google = {
    authAsync,
};
