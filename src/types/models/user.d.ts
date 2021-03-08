import { Document } from 'mongoose';

declare enum OAUTH_PROVIDERS_E {
    'GOOGLE',
}
declare enum SOCIAL_MEDIA_PROVIDERS_E {
    'INSTAGRAM',
    'LINKEDIN',
    'TWITTER',
}

export interface UserOAuth {
    id: string;
    type: OAUTH_PROVIDERS_E;
}

export interface SocialMedia {
    isActive: boolean;
    link: string;
    type: SOCIAL_MEDIA_PROVIDERS_E;
}

export interface UserDocument extends Document {
    bio?: string;
    city?: string;
    country?: string;
    dateOfBirth?: string;
    email: string;
    follows: UserDocument[];
    id: string;
    isFacebookActive: boolean;
    isInstagramActive: boolean;
    isLinkedinActive: boolean;
    isTwitterActive: boolean;
    isOnline: boolean;
    oauthProviders: UserOAuth[];
    password: string;
    phone?: string;
    profilePhoto?: string;
    searchRadius?: number;
    showProfile?: boolean;
    socialMedia: SocialMedia[];
    userName: string;
    twitterLink?: string;
    facebookLink?: string;
    linkedinLink?: string;
    instagramLink?: string;
}

export type UserModel = UserDocument & Document;
