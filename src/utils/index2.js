const escape = require('escape-html');

/**
 *
 * @param {object} obj
 *
 * Check if object is empty
 *
 * @returns boolean
 */
const isEmpty = function(obj) {
    for (let key in obj) {
        if (obj.hasOwnProperty(key)) {
            return false;
        }
    }

    return true;
};

/**
 *
 * @param {object} obj
 * @param {array} keys
 *
 * Returns new object with only keys
 * specified in keys param
 */
const pick = function(obj, keys) {
    return Object.assign(
        {},
        ...keys.map(k => (k in obj ? { [k]: obj[k] } : {})),
    );
};

/**
 *
 * @param {promise} promise
 *
 * Returns the value from a promise and an error if it exists.
 *
 * @returns {array} [value, error]
 */

const promisify = async function() {
    try {
        return [await promise, undefined];
    } catch (e) {
        return [undefined, e];
    }
};

/**
 *
 * @param {object} obj
 * @param {array} keys
 *
 * Returns new object without keys
 * specified in keys param
 */

const reject = function(obj, keys) {
    return Object.assign(
        {},
        ...Object.keys(obj)
            .filter(k => !keys.includes(k))
            .map(k => ({ [k]: obj[k] })),
    );
};

/**
 * Escapes and removed all extra spaces
 *
 * @param str string to be escaped
 *
 * @returns string
 */

const escapeString = function(str) {
    return escape(String(str))
        .replace(/\s+/g, ' ')
        .trim();
};

module.exports = {
    escapeString,
    isEmpty,
    pick,
    promisify,
    reject,
};
