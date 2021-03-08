import { Router, Response, Request } from 'express';

import { sign, verify } from '../../auth/userToken';
import requireLogin from '../../middleware/requireLogin';
import * as httpMessages from '../../utils/httpMessages';
import { logger } from '../../utils/logging';
import { userServices } from '../../services/UserServices';
import { validationRules, validationFunc } from './validation';
import seedUsers from '../../database/seeders/seedUsers';
import seedNearByUsers from '../../database/seeders/seedNearByUsers';
import { promisify, escapeString } from '../../utils';
import { ExtendedRequest } from '../../interfaces/ExtendedRequest';

class UserController {
    public router: Router;

    public constructor() {
        this.router = Router();
        this.routes();
    }

    public routes() {
        this.router.get('/', requireLogin, this.getUsers);
        this.router.get('/me', requireLogin, this.me);
        this.router.post(
            '/seed',
            [...validationRules.seeder],
            validationFunc,
            this.seeder,
        );
        this.router.post(
            '/',
            [...validationRules.createUser],
            validationFunc,
            this.createUser,
        );
        this.router.get(
            '/:id',
            [...validationRules.getUser],
            validationFunc,
            this.getUser,
        );
        this.router.patch(
            '/:id',
            [...validationRules.updateUser],
            validationFunc,
            requireLogin,
            this.updateUser,
        );
        this.router.delete(
            '/:id',
            [...validationRules.deleteUser],
            validationFunc,
            requireLogin,
            this.deleteUser,
        );
    }

    /**
     * Seeds db with users,
     *
     * @field {number} amount of users to create
     */
    private seeder = async (req: Request, res: Response): Promise<any> => {
        const amountOfUsers = Number(escapeString(req.query.amount));

        await seedUsers(amountOfUsers);

        const [users, usersErr]: [any, any] = await promisify(
            userServices.findAll(),
        );
        if (usersErr) {
            return res.status(500).json(httpMessages.code500());
        }

        await seedNearByUsers(users);

        const existingUsersCount = users.length;

        return res
            .status(200)
            .json(
                httpMessages.code200(
                    {},
                    `${amountOfUsers} users created. There are ${existingUsersCount} users now in DB.`,
                ),
            );
    };

    /**
     * Returns a user object based on the
     * auth token sent with request
     */
    private me = async (req: Request, res: Response): Promise<any> => {
        if (req.headers && req.headers.authorization) {
            const authorization = req.headers.authorization;

            /**
             * Check JWT token, if not valid return 401 error
             */
            const decoded: any = verify(authorization);
            if (!decoded || typeof decoded !== 'object') {
                return res.status(401).json(httpMessages.code401());
            }

            /**
             * Attempt to find user from JWT token subject value
             */
            const [user, userErr] = await promisify(
                userServices.findOne('id', decoded.sub),
            );
            if (userErr) {
                if (userErr.code === 404) {
                    logger(req.ip, userErr, 404);

                    return res.status(404).json(httpMessages.code404());
                }

                logger(req.ip, userErr, 500);

                return res.status(500).json(httpMessages.code500());
            }

            return res.status(200).json(httpMessages.code200(user));
        }

        return res.status(401).json(httpMessages.code401());
    };

    /**
     * Creates a user with required fields
     * @field firstName
     * @field lastName
     * @field username
     * @field email
     * @field password
     */
    private createUser = async (
        req: ExtendedRequest,
        res: Response,
    ): Promise<any> => {
        /**
         * Build user object
         */
        const data = {};
        for (const key in req.body) {
            if (req.body.hasOwnProperty(key)) {
                data[key] = escapeString(req.body[key]).trim();
            }
        }
        /**
         * Create & save new user
         */
        const [user, userErr]: [any, any] = await promisify(
            userServices.create(data),
        );
        if (userErr) {
            if (Number(userErr.code) === 409) {
                logger(req.ip, userErr, 409);

                return res.status(409).json(httpMessages.code409());
            }

            logger(req.ip, userErr, 500);

            return res.status(500).json(httpMessages.code500());
        }

        /**
         * Find new user
         */
        const [newUser, newUserErr]: [any, any] = await promisify(
            userServices.findOne('email', user.email),
        );
        if (newUserErr) {
            if (newUserErr.code === 404) {
                logger(req.ip, newUserErr, 404);

                return res.status(404).json(httpMessages.code404());
            }

            logger(req.ip, newUserErr, 500);

            return res.status(500).json(httpMessages.code500());
        }

        /**
         * Login user, send user info back
         * along with jsonwebtoken as a way to
         * verify who the user is in
         * subsequent requests
         */
        req.login(newUser.id, err => {
            if (err) {
                logger(req.ip, err, 500);

                return res.status(500).json(httpMessages.code500());
            }

            // Generate JWT Token with user id
            const authToken = sign(newUser.id);

            // Return user obj with new JWT token
            const response = {
                ...newUser,
                authToken,
            };

            res.set('authorization', authToken);
            return res.status(201).json(httpMessages.code200(response));
        });

        return;
    };

    /**
     * Returns a single user object
     */
    private getUser = async (req: Request, res: Response): Promise<any> => {
        const userId = escapeString(req.params.id);
        const [user, userErr] = await promisify(
            userServices.findOne('id', userId),
        );
        if (userErr) {
            if (userErr.code === 404) {
                logger(req.ip, userErr, 404);

                return res.status(404).json(httpMessages.code404());
            }

            logger(req.ip, userErr, 500);

            return res.status(500).json(httpMessages.code500());
        }
        return res.status(200).json(httpMessages.code200(user));
    };

    /**
     * Returns an array of users
     */
    private getUsers = async (req: Request, res: Response): Promise<any> => {
        const [users, usersErr] = await promisify(userServices.findAll());
        if (usersErr) {
            logger(req.ip, usersErr, 500);
            return res.status(500).json(httpMessages.code500());
        }
        return res.status(200).json(httpMessages.code200(users));
    };

    /**
     * Updates a user
     */
    private updateUser = async (req: Request, res: Response): Promise<any> => {
        const userId = escapeString(req.params.id);
        req.user = req.user || {};

        /**
         * Check if user can perform this action
         */
        if (req.user['id'] !== userId) {
            return res.status(403).json(httpMessages.code403());
        }

        /**
         * Find user
         */
        const [user, userErr]: [any, any] = await promisify(
            userServices.findOne('id', userId, false),
        );
        if (userErr) {
            if (userErr.code === 404) {
                logger(req.ip, userErr, 404);

                return res.status(404).json(httpMessages.code404());
            }

            logger(req.ip, userErr, 500);

            return res.status(500).json(httpMessages.code500());
        }

        /**
         * Update fields
         */
        for (const key in req.body) {
            if (key !== 'profilePhoto') {
                user[key] = escapeString(req.body[key]).trim();
            }
        }

        // Upload new base64 image
        if (
            req.body.profilePhoto &&
            /^data:image\/(jpg|jpeg);base64/.test(req.body.profilePhoto)
        ) {
            const [profilePhotoUrl, profilePhotoUrlErr] = await promisify(
                userServices.uploadImages(req.body.profilePhoto),
            );

            if (!profilePhotoUrlErr) {
                user.profilePhoto = profilePhotoUrl;
            }
        }

        /**
         * Save updated user
         */
        const [updatedUser, updatedUserErr]: [any, any] = await promisify(
            userServices.update(user),
        );

        if (updatedUserErr) {
            logger(req.ip, updatedUserErr, 500);

            return res.status(500).json(httpMessages.code500());
        }
        return res
            .status(200)
            .json(
                httpMessages.code200(updatedUser, 'User successfully updated.'),
            );
    };

    /**
     * Deletes user found by id
     */
    private deleteUser = async (req: Request, res: Response): Promise<any> => {
        const userId = escapeString(req.params.id);
        req.user = req.user || {};

        /**
         * Check if user can perform this action
         */
        if (req.user['id'] !== userId) {
            return res.status(403).json(httpMessages.code403());
        }

        /**
         * Find user
         */
        const [user, userErr]: [any, any] = await promisify(
            userServices.findOne('id', userId, false),
        );

        if (userErr) {
            if (userErr.code === 404) {
                logger(req.ip, userErr, 404);

                return res.status(404).json(httpMessages.code404());
            }

            logger(req.ip, userErr, 500);

            return res.status(500).json(httpMessages.code500());
        }

        /**
         * Remove user
         */
        const deleteUserErr = await promisify(await userServices.remove(user));
        if (deleteUserErr) {
            logger(req.ip, deleteUserErr, 500);

            return res.status(500).json(httpMessages.code500());
        }

        return res.status(200).json(httpMessages.code200({}));
    };
}

export default new UserController().router;
