import { Schema, model } from 'mongoose';
import * as uuid from 'uuid/v4';
import { PostDocument } from '../../types/models/post';

const postSchema = new Schema(
    {
        id: { default: uuid(), type: String, unique: true },
        postAuthor: { type: Schema.Types.ObjectId, ref: 'User' },
        postType: {
            type: String,
            enum: ['Image', 'Text', 'Video'],
            default: null,
        },
        postTitle: { type: String, default: null },
        postText: { type: String, default: null },
        mediaUrl: { type: String, default: null },
        commentCount: { type: Number, default: 0 },
        likesCount: { type: Number, default: 0 },
    },
    { timestamps: true },
);

postSchema.pre<PostDocument>('save', async function(next) {
    this.id = this._id;

    next();
});

export const post = model<PostDocument>('Post', postSchema);
