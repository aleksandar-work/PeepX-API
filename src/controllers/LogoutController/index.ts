import { Router, Response } from 'express';

import requireLogin from '../../middleware/requireLogin';
import { ExtendedRequest } from '../../interfaces/ExtendedRequest';

class LogoutController {
    public router: Router;

    public constructor() {
        this.router = Router();
        this.routes();
    }

    public routes() {
        this.router.post('/', requireLogin, this.logout);
    }

    private logout = (req: ExtendedRequest, res: Response): Response => {
        req.user = undefined;
        delete req.user;

        return res.sendStatus(200);
    };
}

export default new LogoutController().router;
