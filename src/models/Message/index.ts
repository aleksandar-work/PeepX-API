import { Schema, model } from 'mongoose';
import { MessageDocument } from '../../types/models/chat';

const messageSchema: Schema = new Schema(
    {
        content: {
            required: true,
            type: String,
        },
        user: { type: Schema.Types.ObjectId, ref: 'User' },
        isRead: {
            default: false,
            type: Boolean,
        },
        isReceived: {
            default: false,
            type: Boolean,
        },
    },
    { timestamps: true },
);

export const message = model<MessageDocument>('Message', messageSchema);
