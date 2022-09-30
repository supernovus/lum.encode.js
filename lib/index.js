/**
 * A full set of encoding utilities.
 * @module @lumjs/encode
 */

/**
 * @name module:@lumjs/encode.ord
 * @function
 * @see {@link module:@lumjs/encode/util.ord}
 */

/**
 * @name module:@lumjs/encode.numByteArray
 * @function
 * @see {@link module:@lumjs/encode/util.numByteArray}
 */

const {ord, numByteArray} = require('./util');

/**
 * @see {@link module:@lumjs/encode/base64}
 * @alias module:@lumjs/encode.Base64
 */
const Base64 = require('./base64');

/**
 * @see {@link module:@lumjs/encode/base91}
 * @alias module:@lumjs/encode.Base91
 */
const Base91 = require('./base91');

/**
 * @see {@link module:@lumjs/encode/safe64}
 * @alias module:@lumjs/encode.Safe64
 */
const Safe64 = require('./safe64');

/**
 * @see {@link module:@lumjs/encode/hash}
 * @alias module:@lumjs/encode.Hash
 */
const Hash = require('./hash');

/**
 * @see {@link module:@lumjs/encode/crypto}
 * @alias module:@lumjs/encode.Crypto
 */
const Crypto = require('./crypto');

module.exports = exports = 
{
  ord, numByteArray, Base64, Safe64, Base91, Hash, Crypto,
}
