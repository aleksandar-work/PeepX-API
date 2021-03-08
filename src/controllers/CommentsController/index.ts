import { Router } from 'express';

class CommentsController {
    public router: Router;
    public constructor() {
        this.router = Router();
    }
}
export default new CommentsController().router;
