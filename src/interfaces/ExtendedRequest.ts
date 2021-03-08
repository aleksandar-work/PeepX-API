import { Request } from 'express';

/**
 * Used to add custom properties
 * to express's request type without
 * typescript complaining i.e. 'req.login()'
 */
export interface ExtendedRequest extends Request {
    [key: string]: any;
}
