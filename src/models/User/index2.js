const mongoose = require('mongoose');
const { hashPassword } = require('../../auth/password2');
const uuid = require('uuid');
const OAUTH_PROVIDERS = ['GOOGLE'];
const passwordRegex = new RegExp(
    /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,30}$/,
    'i',
);
const passwordValidationMessage =
    'A valid password consists of atleast 1 uppercase letter, 1 special character, 1 number, and is between 5 - 30 characters long.';

const userSchemas = mongoose.Schema(
    {
        bio: {
            default: null,
            type: String,
        },
        city: {
            default: null,
            type: String,
        },
        country: {
            default: null,
            type: String,
        },
        dateOfBirth: {
            default: null,
            type: String,
        },
        email: {
            lowercase: true,
            required: true,
            type: String,
            unique: true,
        },
        facebookLink: {
            default: null,
            type: String,
        },
        id: {
            default: uuid.v4(),
            required: true,
            type: String,
            unique: true,
        },
        instagramLink: {
            default: null,
            type: String,
        },
        isFacebookActive: {
            default: true,
            type: Boolean,
        },
        isInstagramActive: {
            default: true,
            type: Boolean,
        },
        isLinkedinActive: {
            default: true,
            type: Boolean,
        },
        isTwitterActive: {
            default: true,
            type: Boolean,
        },
        linkedinLink: {
            default: null,
            type: String,
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
        password: {
            max: [30, 'Your password must be less than 30 characters long'],
            min: [5, 'Your password must be atleast 5 characters'],
            required: true,
            type: String,
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
            default: null,
            min: 7,
            type: String,
        },
        profilePhoto: {
            default: null,
            type: String,
        },
        searchRadius: {
            default: 10000, // In meters
            type: Number,
        },
        showProfile: {
            default: true,
            type: Boolean,
        },
        social_Media: {
            facebook: {
                isActive: Boolean,
                link: String,
            },
            instagram: {
                isActive: Boolean,
                link: String,
            },
            twitter: {
                isActive: Boolean,
                link: String,
            },
        },
        twitterLink: {
            default: null,
            type: String,
        },
        userName: {
            required: true,
            type: String,
            unique: true,
        },
    },

    { timestamps: true },
);

userSchemas.pre('save', async function(next) {
    // DEFAULT_OAUTH_PASSWORD is default password for oauth
    // want to keep it plain text until user creates the password
    if (this.password !== String(process.env.DEFAULT_OAUTH_PASSWORD)) {
        let hashedPassword = await hashPassword(this.password);

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

userSchemas.index({ userName: 1, email: 1 }, { unique: true });

module.exports = mongoose.model('Users2', userSchemas);
