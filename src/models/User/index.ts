import { Schema, model } from 'mongoose';
import * as uuid from 'uuid/v4';

import { hashPassword } from '../../auth/password';
import { UserDocument } from '../../types/models/user';

export const OAUTH_PROVIDERS = ['GOOGLE'];
export const SOCIAL_MEDIAS = ['INSTAGRAM', 'TWITTER', 'LINKEDIN'];
export const passwordRegex = new RegExp(
    /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,30}$/,
    'i',
);

export const passwordValidationMessage =
    'A valid password consists of atleast 1 uppercase letter, 1 special character, 1 number, and is between 5 - 30 characters long.';

const userSchema: Schema = new Schema(
    {
        bio: {
            type: String,
            default: null,
        },
        id: {
            type: String,
            required: true,
            unique: true,
            default: uuid(),
        },
        isOnline: {
            type: String,
            default: false,
        },
        userName: {
            type: String,
            unique: true,
            required: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
        },
        password: {
            type: String,
            required: true,
            min: [5, 'Your password must be atleast 5 characters'],
            max: [30, 'Your password must be less than 30 characters long'],
            /*validate: {
                validator: (password: string) => {
                    // Skip password validation if password is already hashed and hasn't changed
                    if (password.startsWith('$argon2d')) {
                        return true;
                    }

                    return passwordRegex.test(password);
                },
                message: passwordValidationMessage,
            },*/
        },
        phone: {
            type: String,
            min: 7,
            default: null,
        },
        showProfile: {
            type: Boolean,
            default: true,
        },
        dateOfBirth: {
            type: String,
            default: null,
        },
        city: {
            type: String,
            default: null,
        },
        country: {
            type: String,
            default: null,
        },
        profilePhoto: {
            type: String,
            default: null,
        },
        twitterLink: {
            type: String,
            default: null,
        },
        isTwitterActive: {
            type: Boolean,
            default: true,
        },
        facebookLink: {
            type: String,
            default: null,
        },
        isFacebookActive: {
            type: Boolean,
            default: true,
        },
        linkedinLink: {
            type: String,
            default: null,
        },
        isLinkedinActive: {
            type: Boolean,
            default: true,
        },
        instagramLink: {
            type: String,
            default: null,
        },
        isInstagramActive: {
            type: Boolean,
            default: true,
        },
        searchRadius: {
            type: Number,
            default: 10000, // In meters
        },
        oauthProviders: [
            {
                _id: false,
                id: {
                    required: true,
                    type: String,
                },
                type: {
                    enum: OAUTH_PROVIDERS,
                    required: true,
                    type: String,
                },
            },
        ],
        socialMedia: [
            {
                _id: false,
                active: Boolean,
                type: {
                    enum: SOCIAL_MEDIAS,
                    required: true,
                    type: String,
                },
                link: {
                    required: true,
                    type: String,
                },
            },
        ],
        follows: [],
    },
    { timestamps: true },
);

userSchema.pre<UserDocument>('save', async function(next) {
    // DEFAULT_OAUTH_PASSWORD is default password for oauth
    // want to keep it plain text until user creates the password
    if (this.password !== String(process.env.DEFAULT_OAUTH_PASSWORD)) {
        const hashedPassword = await hashPassword(this.password);
        if (hashedPassword) {
            this.password = hashedPassword;
        } else {
            throw new Error('in password hash');
        }
    }

    this.email = this.email.toLowerCase();
    this.id = this._id;

    next();
});

userSchema.index({ userName: 1, email: 1 }, { unique: true });

export const user = model<UserDocument>('User', userSchema);
