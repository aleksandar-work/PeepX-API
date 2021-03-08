import * as cloudinary from 'cloudinary';

import { Post } from '../../models';
import { logger } from '../../utils/logging';
import { promisify } from '../../utils';

export const findById = async (postId: string) => {
    Post.findById(postId, (err, doc) => {
        if (err) return err;
        return doc;
    });
};

/**
 * Uploads image to cloudinary
 *
 * @param {base64} image base64 file
 *
 * @returns {string} image url
 */
type UploadImageType = (image: string) => Promise<object | string>;

export const uploadImages: UploadImageType = async image => {
    cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
    });

    const [newImage, newImageErr]: [any, any] = await promisify(
        cloudinary.v2.uploader.upload(image),
    );
    if (newImageErr) {
        logger('Upload image', newImageErr, 500);

        return Promise.reject({ code: 500, message: newImageErr.message });
    }

    if (!newImage) {
        throw new Error('Error with image upload');
    }

    return Promise.resolve(newImage.secure_url);
};
