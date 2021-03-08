import { Router, Request, Response } from 'express';

import { verify } from '../../auth/userToken';
import requireLogin from '../../middleware/requireLogin';
import * as httpMessages from '../../utils/httpMessages';
import { logger } from '../../utils/logging';
import { promisify, escapeString } from '../../utils';
import { userServices } from '../../services/UserServices';
import { nearByUsersServices } from '../../services/NearByUsersServices';

class NearByUsersController {
    public router: Router;

    public constructor() {
        this.router = Router();
        this.routes();
    }

    public routes() {
        this.router.patch('/', requireLogin, this.updateUser);
        this.router.get('/', requireLogin, this.nearByUsers);
    }

    /**
     * Takes the current logged in users id and
     * returns a list of users that are within the specified radius,
     * latitude, and longitude of the current logged in users last updated
     * location.
     *
     * @field Radius
     *
     * @returns {array} An array of user objects.
     */
    private nearByUsers = async (req: Request, res: Response): Promise<Response> => {
        if (req.headers && req.headers.authorization) {
            const authorization = req.headers.authorization;

            const decoded: any = verify(authorization);
            if (!decoded || typeof decoded !== 'object') {
                return res.status(401).json(httpMessages.code401());
            }

            let radius = 1000;
            if (req.query.radius && req.query.radius > 1) {
                radius = Number(escapeString(req.query.radius));
            }

            const [currentNearByUsers, currentNearByUsersErr]: [
                any,
                any
            ] = await promisify(
                nearByUsersServices.nearBy(decoded.sub, radius),
            );
            if (currentNearByUsersErr) {
                logger(req.ip, currentNearByUsersErr, 500);

                return res.status(500).json(httpMessages.code500());
            }

            if (!currentNearByUsers) {
                return res.status(200).json(httpMessages.code200());
            }

            // Get user records with id's returned
            const foundUsers = currentNearByUsers.map(async (u: any) => {
                const { userId, loc, dist } = u;
                const [user] = await promisify(
                    userServices.findOne('id', userId),
                );

                if (user) {
                    return Promise.resolve({
                        ...user,
                        location: {
                            ...loc,
                            // convert meters to miles
                            distance: Number((dist / 1609.344).toFixed(2)),
                        },
                    });
                }

                return undefined;
            });

            const users = await Promise.all([...foundUsers]);

            return res.status(200).json(httpMessages.code200(users));
        }
        return res.status(401).json(httpMessages.code401());
    };

    /**
     * Updates the current logged in user location data
     *
     * @field Latitude
     * @field Longitude
     *
     * @returns {object} The updated user
     */
    private updateUser = async (req: Request, res: Response): Promise<Response> => {
        if (req.headers && req.headers.authorization) {
            const authorization = req.headers.authorization;

            const decoded: any = verify(authorization);
            if (!decoded || typeof decoded !== 'object') {
                return res.status(401).json(httpMessages.code401());
            }

            const [user, userErr]: [any, any] = await promisify(
                userServices.findOne('id', decoded.sub),
            );
            if (userErr) {
                logger(req.ip, userErr, 500);

                return res.status(500).json(httpMessages.code500());
            }

            if (!user) {
                return res.status(404).json(httpMessages.code404());
            }

            const location = {
                latitude: escapeString(req.query.latitude),
                longitude: escapeString(req.query.longitude),
            };
            const [
                updatedUserLocationData,
                updatedUserLocationDataErr,
            ] = await promisify(nearByUsersServices.update(user.id, location));
            if (updatedUserLocationDataErr) {
                logger(req.ip, updatedUserLocationDataErr, 500);

                return res.status(500).json(httpMessages.code500());
            }

            return res
                .status(200)
                .json(httpMessages.code200(updatedUserLocationData));
        }
        return res.status(401).json(httpMessages.code401());
    };
}

export default new NearByUsersController().router;
