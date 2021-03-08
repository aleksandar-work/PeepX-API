import { Schema, model } from 'mongoose';
import * as uuid from 'uuid/v4';

import { NearByUsersDocument } from '../../types/models/nearByUsers';

const nearByUsersSchema: Schema = new Schema(
    {
        id: {
            type: String,
            required: true,
            unique: true,
            default: uuid(),
        },
        userId: {
            type: String,
            required: true,
            unique: true,
        },
        loc: {
            type: {
                type: String,
                enum: ['Point'],
                required: true,
            },
            coordinates: {
                type: [Number],
                required: true,
            },
        },
    },
    { timestamps: true },
);

nearByUsersSchema.index({ loc: '2dsphere' }, { background: false });

nearByUsersSchema.pre<NearByUsersDocument>('save', async function(next) {
    this.id = this._id;

    next();
});

export const nearByUsers = model<NearByUsersDocument>('NearByUser', nearByUsersSchema);
