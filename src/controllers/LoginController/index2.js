// import { pick, promisify, escapeString } from '../../utils';
const { pick } = require('../../utils/index2');
const mongoose = require('mongoose');
const { logger } = require('../../utils/logging2');
const Users2 = require('../../models/User/index2');
const { verifyPassword } = require('../../auth/password2');
const httpMessages = require('../../utils/httpMessages2');
const { filteredModel } = require('../../models/helpers2');
const { sign } = require('../../auth/userToken2');

const basicLogin = async (req, res, next) => {
    /**
     * Build request object
     */

    let data = {};

    for (let key in req.body) {
        // console.log('18 key=', key)
        if (req.body.hasOwnProperty(key)) {
            data[key] = req.body[key].trim();
        }
    }

    /**
     * Dont allow other fields other
     * than the specified fields below
     */

    let allowedFields = ['email', 'password'];
    let { email, password } = pick(data, allowedFields);

    /**
     * Check if user exists, if not return 404
     * otherwise proceed.
     */

    let user = {};

    await mongoose
        .model('Users2')
        .find({ email: email })
        .then(response => (user = response))
        .catch(err => null); // console.log('Danger! unable to find user in db basicLogin()' + err),

    /**
     * Check if found users password matches the password
     * supplied to this endpoint
     */

    let verified = await verifyPassword(user[0].password, password)
        .then(response => response)
        .catch(err => null); //console.log('Danger! unable to match password'));

    if (!verified) {
        return res
            .status(401)
            .json(httpMessages.code401({}, 'Invalid credentials.'));
    }

    /**
     * Login user, send user info back
     * along with jsonwebtoken as a way to
     * verify who the user is in
     * subsequent requests
     */

    let filteredUserObj = filteredModel(user);

    req.login(filteredUserObj.id, err => {
        // Generate JWT Token with filteredUserObj id
        let authToken = sign(filteredUserObj.id);

        // Return filteredUserObj obj with new JWT token
        let response = {
            ...filteredUserObj,
            authToken,
        };

        res.set('authorization', authToken);
        return res.status(200).json(response);
    });
};

const oauthLogin = async (req, res, next) => {
    // private oauthLogin = async (req: ExtendedRequest, res: Response): Promise<any> => {
    //     /**
    //      * Build request object
    //      */
    //     const data: any = {};
    //     for (const key in req.body) {
    //         if (req.body.hasOwnProperty(key)) {
    //             data[key] = escapeString(req.body[key]).trim();
    //         }
    //     }
    //     /**
    //      * Build user oauth obj
    //      */
    //     const userOAuthData: any = {
    //         email: null,
    //         userName: null,
    //         firstName: null,
    //         lastName: null,
    //         profilePhoto: null,
    //         oauthProviders: {
    //             id: null,
    //             type: null,
    //         },
    //     };
    //     if (data.provider && data.oauthToken) {
    //         if (data.provider === 'GOOGLE') {
    //             let google = null;
    //             try {
    //                 google = await authService.google.authAsync(
    //                     data.oauthToken,
    //                 );
    //             } catch (error) {
    //                 logger(req.ip, error, 500);
    //                 return res.status(500).json(httpMessages.code500());
    //             }
    //             userOAuthData.email = google.email;
    //             userOAuthData.userName = `${google.given_name} ${
    //                 google.family_name
    //             }`;
    //             userOAuthData.firstName = google.given_name;
    //             userOAuthData.lastName = google.family_name;
    //             userOAuthData.profilePhoto = google.picture;
    //             userOAuthData.oauthProviders.id = google.id;
    //             userOAuthData.oauthProviders.type = 'GOOGLE';
    //         } else {
    //             return res
    //                 .status(422)
    //                 .json(
    //                     httpMessages.code422(
    //                         {},
    //                         'OAuth provider not recognized.',
    //                     ),
    //                 );
    //         }
    //     } else {
    //         return res.status(422).json(httpMessages.code422());
    //     }
    //     /**
    //      * Attempt to find user by oauth email
    //      * if found contine otherwise if code = 404
    //      * create a new user and return it.
    //      */
    //     let code: number = 0;
    //     let user: any = null;
    //     try {
    //         user = await userServices.findOne(
    //             'email',
    //             userOAuthData.email,
    //             false,
    //         );
    //         /**
    //          * If user is found update oauthProviders field
    //          */
    //         if (user) {
    //             /**
    //              * If user has used an oauth login before
    //              * loop over entries and prevent duplicates.
    //              * Otherwise add the new entry to oauthProviders array
    //              * and update user.
    //              */
    //             if (user.oauthProviders.length > 0) {
    //                 let newOAuthData = user.oauthProviders;
    //                 newOAuthData = newOAuthData.map(
    //                     (provider: any) =>
    //                         provider.id !== userOAuthData.oauthProviders.id,
    //                 );
    //                 // Map would return false if nothing new is there
    //                 if (newOAuthData[0]) {
    //                     user.oauthProviders = [
    //                         ...user.oauthProviders,
    //                         ...newOAuthData,
    //                     ];
    //                 }
    //             } else {
    //                 user.oauthProviders = [
    //                     ...user.oauthProviders,
    //                     userOAuthData.oauthProviders,
    //                 ];
    //             }
    //             user = await userServices.update(user);
    //         }
    //     } catch (error) {
    //         if (error.code !== 404) {
    //             logger(req.ip, error, 500);
    //             return res.status(500).json(httpMessages.code500());
    //         }
    //         code = 404;
    //     } finally {
    //         if (code === 404) {
    //             try {
    //                 user = await userServices.create({
    //                     ...userOAuthData,
    //                     password: String(process.env.DEFAULT_OAUTH_PASSWORD),
    //                 });
    //             } catch (error) {
    //                 logger(req.ip, error, 500);
    //                 res.status(500).json(httpMessages.code500());
    //             }
    //         }
    //     }
    //     /**
    //      * Login user, send user info back
    //      * along with jsonwebtoken as a way to
    //      * verify who the user is in
    //      * subsequent requests
    //      */
    //     // req.login(user.id, err => {
    //     //     if (err) {
    //     //         logger(req.ip, err, 500);
    //     //         return res.status(500).json(httpMessages.code500());
    //     //     }
    //     //     // Generate JWT Token with user id
    //     //     const authToken = sign(user.id);
    //     //     // Return user obj with new JWT token
    //     //     const response = {
    //     //         ...user,
    //     //         authToken,
    //     //     };
    //     //     res.set('authorization', authToken);
    //     //     return res.status(200).json(httpMessages.code200(response));
    //     // });
    //     return;
    // };
};

module.exports = {
    basicLogin,
    oauthLogin,
};
