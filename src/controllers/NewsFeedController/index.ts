import { Router, Request, Response } from 'express';
import { Post } from '../../models';
import requireLogin from '../../middleware/requireLogin';
import * as newsfeedServices from '../../services/NewsFeedServices';
import { promisify } from '../../utils';

class NewsFeedController {
    public router: Router;
    public constructor() {
        this.router = Router();
        this.routes();
    }
    public routes() {
        this.router.get('/:userId', requireLogin, this.getPosts);
        this.router.post('/', requireLogin, this.createNewPost);
        this.router.put('/', requireLogin, this.updatePost);
        this.router.delete('/', requireLogin, this.deletePost);
        this.router.get('/post/:id', requireLogin, this.viewPost);
        this.router.get('/more/:laspost', requireLogin, this.loadMorePosts);
    }
    private createNewPost = async (req: Request, res: Response) => {
        const { postType, postAuthor, postTitle, postText } = req.body;
        let { mediaUrl } = req.body;

        // Upload new base64 image
        if (mediaUrl && mediaUrl.startsWith('data:image/jpg;base64')) {
            const [uploadedUrl, uploadErr] = await promisify(
                newsfeedServices.uploadImages(mediaUrl),
            );

            if (!uploadErr) {
                mediaUrl = uploadedUrl;
            }
        }

        const newPost = new Post({
            postType,
            postAuthor,
            postTitle,
            postText,
            mediaUrl,
        });
        try {
            const savePost = await newPost.save();
            res.status(200).send(savePost);
        } catch (err) {
            res.status(500).send(err);
        }
    };
    private updatePost = async (req: Request, res: Response) => {
        const { _id, postType, postTitle, postText, mediaUrl } = req.body;
        const update = {
            postType,
            postTitle,
            postText,
            mediaUrl,
        };
        const options = { new: true };
        const updatePost = await Post.findByIdAndUpdate(
            _id,
            update,
            options,
        ).exec();
        if (updatePost !== null) {
            res.status(200).send(updatePost);
        } else {
            res.status(500).send({
                success: false,
                message: 'Could not find record to update',
            });
        }
    };
    private deletePost = async () => {
        return;
    };
    private getPosts = async (_: Request, res: Response) => {
        // THIS IS A WORK IN PROGRESS
        // For now just keep it simple. Will collect posts from all followed users and just collect the top 20 most recent posts.
        // const userId = req.params.userId;
        // const follows = [userId];
        const newsFeed = await Post.find()
            .populate('postAuthor', ['id', 'userName', 'profilePhoto'])
            .sort({ createdAt: -1 })
            .limit(20)
            .exec();
        if (newsFeed.length > 0) {
            // tslint:disable-next-line:object-shorthand-properties-first
            res.status(200).send({ success: true, newsFeed });
        } else if (newsFeed.length === 0) {
            res.status(200).send({ success: true, message: 'No results' });
        } else {
            res.status(404).send({
                success: false,
                message: 'Error occureed looking for a newsfeed',
            });
        }
    };
    private viewPost = async (req: Request, res: Response) => {
        const postId = req.params.id;
        const loadPost = await Post.findById(postId);
        if (loadPost !== null) {
            res.status(200).send(loadPost);
        } else {
            res.status(404).send({
                success: false,
                message: 'Could not find post with that ID',
            });
        }
    };
    private loadMorePosts = async (_: Request, res: Response) => {
        // const userId = req.params.id;
        // const follows = { userId };

        const newsFeed = await Post.find()
            .populate('postAuthor', ['id', 'userName', 'profilePhoto'])
            .sort({ createdAt: -1 })
            .limit(20)
            .exec();
        res.status(200).send({ newsFeed, success: true });
    };
}
export default new NewsFeedController().router;
