import { Schema, model } from 'mongoose';
import * as uuid from 'uuid/v4';
import { ChatDocument } from '../../types/models/chat';

const chatSchema: Schema = new Schema(
    {
        id: {
            default: uuid(),
            required: true,
            type: String,
            unique: true,
        },
        // chatName: {
        //     default: null,
        //     required: false,
        //     type: String,
        // },
        members: [{ type: Schema.Types.ObjectId, ref: 'User' }],
        messages: [{ type: Schema.Types.ObjectId, ref: 'Message' }],
    },
    { timestamps: true },
);

chatSchema.pre<ChatDocument>('save', async function(next) {
    this.id = this._id;
    this.members = [
        ...this.members.filter(
            (value, index, self) => self.indexOf(value) === index,
        ),
    ];

    next();
});

export const chat = model<ChatDocument>('Chat', chatSchema);
