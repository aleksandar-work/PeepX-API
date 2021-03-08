import { Schema, model } from 'mongoose';

const commentsSchema: Schema = new Schema(
    {
        id: { type: String, unique: true },
        commentPostId: { type: Schema.Types.ObjectId, ref: 'Posts' },
        userId: { type: Schema.Types.ObjectId, ref: 'User' },
        commentParents: { type: Array, default: [] },
        commentLikesCount: { type: Number, default: 0 },
        commentContent: { type: String, default: null },
    },
    { timestamps: true },
);

export const comments = model('comments', commentsSchema);
