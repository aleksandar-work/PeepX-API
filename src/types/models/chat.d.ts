import { Document } from 'mongoose';
import { UserDocument } from './user';

export interface MessageDocument extends Document {
    id: string;
    user: UserDocument;
    text: string;
    files?: string[];
    isRead: Boolean;
    isReceived: Boolean;
}

export interface ChatDocument extends Document {
    id: string;
    members: UserDocument[];
    messages: MessageDocument[];
}
