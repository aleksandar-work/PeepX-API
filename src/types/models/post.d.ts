import { Document } from 'mongoose';
import { UserDocument } from './user';

export interface PostDocument extends Document {
    id: string;
    postAuthor: UserDocument;
    postType: string;
    postTitle: string;
    postText: string;
    mediaUrl: string;
    commentCount: number;
    likesCount: number;
}
