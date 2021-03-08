import { Router, Response } from 'express';

import { pick, promisify, escapeString } from '../../utils';
import { sign } from '../../auth/userToken';
import { logger } from '../../utils/logging';
import { verifyPassword } from '../../auth/password';
import { filteredModel } from '../../models/helpers';
import { userServices } from '../../services/UserServices';
import { authService } from '../../services/OAuthServices';
import * as httpMessages from '../../utils/httpMessages';
import { validationFunc, validationRules } from './validation';
import { ExtendedRequest } from '../../interfaces/ExtendedRequest';

class LoginController {
    public router: Router;

    public constructor() {
        this.router = Router();
        this.routes();
    }

    public routes() {
        this.router.post(
            '/',
            [...validationRules.basicLogin],
            validationFunc,
            this.basicLogin,
        );
        this.router.post(
            '/oauth',
            [...validationRules.oauthLogin],
            validationFunc,
            this.oauthLogin,
        );
    }

    /**
     * Login a user with required fields
     * @field email
     * @field password
     */
    private basicLogin = async (
        req: ExtendedRequest,
        res: Response,
    ): Promise<any> => {
        /**
         * Build request object
         */

        const data = {};

        for (const key in req.body) {
            if (req.body.hasOwnProperty(key)) {
                data[key] = escapeString(req.body[key]).trim();
            }
        }

        /**
         * Dont allow other fields other
         * than the specified fields below
         */
        const allowedFields = ['email', 'password'];
        const { email, password } = pick(data, allowedFields);

        /**
         * Check if user exists, if not return 404
         * otherwise proceed.
         */
        const [user, userErr]: [any, any] = await promisify(
            userServices.findOne('email', email, false),
        );
        if (userErr) {
            if (userErr.code === 404) {
                logger(req.ip, userErr, 404);

                return res.status(404).json(httpMessages.code404());
            }

            logger(req.ip, userErr, 500);

            return res.status(500).json(httpMessages.code500());
        }

        if (!user) {
            return res.status(404).json(httpMessages.code404());
        }

        /**
         * Check if found users password matches the password
         * supplied to this endpoint
         */
        const [verified, verifiedErr] = await promisify(
            verifyPassword(user.password, password),
        );
        if (verifiedErr) {
            logger(req.ip, verifiedErr, 500);

            return res.status(500).json(httpMessages.code500());
        }

        if (!verified) {
            return res
                .status(401)
                .json(httpMessages.code401({}, 'Invalid credentials.'));
        }

        /**
         * Login user, send user info back
         * along with jsonwebtoken as a way to
         * verify who the user is in
         * subsequent requests
         */
        const filteredUserObj: any = filteredModel(user);
        req.login(filteredUserObj.id, (err: any) => {
            if (err) {
                logger(req.ip, err, 500);

                return res.status(500).json(httpMessages.code500());
            }

            // Generate JWT Token with user id
            const authToken = sign(user.id);

            // Return user obj with new JWT token
            const response = {
                ...filteredUserObj,
                authToken,
            };

            res.set('authorization', authToken);
            return res.status(200).json(httpMessages.code200(response));
        });

        return;
    };

    /**
     * Login a user with oauth provider
     * @field provider
     * @field oauthToken
     */
    private oauthLogin = async (
        req: ExtendedRequest,
        res: Response,
    ): Promise<any> => {
        /**
         * Build request object
         */
        const data: any = {};
        for (const key in req.body) {
            if (req.body.hasOwnProperty(key)) {
                data[key] = escapeString(req.body[key]).trim();
            }
        }

        /**
         * Build user oauth obj
         */
        const userOAuthData: any = {
            email: null,
            userName: null,
            firstName: null,
            lastName: null,
            profilePhoto: null,
            oauthProviders: {
                id: null,
                type: null,
            },
        };
        if (data.provider && data.oauthToken) {
            if (data.provider === 'GOOGLE') {
                let google = null;
                try {
                    google = await authService.google.authAsync(
                        data.oauthToken,
                    );
                } catch (error) {
                    logger(req.ip, error, 500);

                    return res.status(500).json(httpMessages.code500());
                }

                userOAuthData.email = google.email;
                userOAuthData.userName = `${google.given_name} ${google.family_name}`;
                userOAuthData.firstName = google.given_name;
                userOAuthData.lastName = google.family_name;
                userOAuthData.profilePhoto = google.picture;
                userOAuthData.oauthProviders.id = google.id;
                userOAuthData.oauthProviders.type = 'GOOGLE';
            } else {
                return res
                    .status(422)
                    .json(
                        httpMessages.code422(
                            {},
                            'OAuth provider not recognized.',
                        ),
                    );
            }
        } else {
            return res.status(422).json(httpMessages.code422());
        }

        /**
         * Attempt to find user by oauth email
         * if found contine otherwise if code = 404
         * create a new user and return it.
         */
        let code: number = 0;
        let user: any = null;
        try {
            user = await userServices.findOne(
                'email',
                userOAuthData.email,
                false,
            );
            /**
             * If user is found update oauthProviders field
             */
            if (user) {
                /**
                 * If user has used an oauth login before
                 * loop over entries and prevent duplicates.
                 * Otherwise add the new entry to oauthProviders array
                 * and update user.
                 */
                if (user.oauthProviders.length > 0) {
                    let newOAuthData = user.oauthProviders;
                    newOAuthData = newOAuthData.map(
                        (provider: any) =>
                            provider.id !== userOAuthData.oauthProviders.id,
                    );

                    // Map would return false if nothing new is there
                    if (newOAuthData[0]) {
                        user.oauthProviders = [
                            ...user.oauthProviders,
                            ...newOAuthData,
                        ];
                    }
                } else {
                    user.oauthProviders = [
                        ...user.oauthProviders,
                        userOAuthData.oauthProviders,
                    ];
                }

                user = await userServices.update(user);
            }
        } catch (error) {
            if (error.code !== 404) {
                logger(req.ip, error, 500);

                return res.status(500).json(httpMessages.code500());
            }

            code = 404;
        } finally {
            if (code === 404) {
                try {
                    user = await userServices.create({
                        ...userOAuthData,
                        password: String(process.env.DEFAULT_OAUTH_PASSWORD),
                    });
                } catch (error) {
                    logger(req.ip, error, 500);

                    res.status(500).json(httpMessages.code500());
                }
            }
        }

        /**
         * Login user, send user info back
         * along with jsonwebtoken as a way to
         * verify who the user is in
         * subsequent requests
         */
        req.login(user.id, (err: any) => {
            if (err) {
                logger(req.ip, err, 500);

                return res.status(500).json(httpMessages.code500());
            }

            // Generate JWT Token with user id
            const authToken = sign(user.id);

            // Return user obj with new JWT token
            const response = {
                ...user,
                authToken,
            };

            res.set('authorization', authToken);
            return res.status(200).json(httpMessages.code200(response));
        });

        return;
    };
}

export default new LoginController().router;
