/**
 * A full set of encoding utilities.
 * 
 * This module includes alias properties for all sub-modules except `polyfill`.
 * 
 * This currently uses lazy-loading for everything other than `util`,
 * but in version 3.0 I will be rewriting this package into ESM format,
 * and the default module will become an alias for the `all` sub-module.
 * 
 * I'd suggest using one of the named sub-modules or module-sets if you
 * want to load only specific components.
 * 
 * @module @lumjs/encode
 */

const {df,lazy} = require('@lumjs/core');
const E = {enumerable: true};
const util = require('./util');

/**
 * @alias module:@lumjs/encode.util
 * @see {@link module:@lumjs/encode/util}
 */
df(exports, 'Util', {value: util}, E);

/**
 * @alias module:@lumjs/encode.util
 * @see {@link module:@lumjs/encode/util}
 */
df(exports, 'util', {value: util}, E);

/**
 * @alias module:@lumjs/encode.ord
 * @deprecated this alias to `util.ord` will be removed in 3.x.
 * @see {@link module:@lumjs/encode/util.ord}
 */
df(exports, 'ord', util.ord, E);

/**
 * @name module:@lumjs/encode.numByteArray
 * @function
 * @deprecated this alias to `util.numByteArray` will be removed in 3.x.
 * @see {@link module:@lumjs/encode/util.numByteArray}
 */
df(exports, 'numByteArray', util.numByteArray, E);

/**
 * @name module:@lumjs/encode.Base32
 * @see {@link module:@lumjs/encode/base32}
 */
lazy(exports, 'Base32', () => require('./base32'), E);

/**
 * @name module:@lumjs/encode.Base64
 * @see {@link module:@lumjs/encode/base64}
 */
lazy(exports, 'Base64', () => require('./base64'), E);

/**
 * @name module:@lumjs/encode.Base91
 * @see {@link module:@lumjs/encode/base91}
 */
lazy(exports, 'Base91', () => require('./base91'), E);

/**
 * @name module:@lumjs/encode.Hash
 * @see {@link module:@lumjs/encode/hash}
 */
lazy(exports, 'Hash', () => require('./hash'), E);

/**
 * @name module:@lumjs/encode.HMAC
 * @see {@link module:@lumjs/encode/hmac}
 */
lazy(exports, 'HMAC', () => require('./hmac'), E);

/**
 * @name module:@lumjs/encode.HOTP
 * @see {@link module:@lumjs/encode/hotp}
 */
lazy(exports, 'HOTP', () => require('./hotp'), E);

/**
 * @name module:@lumjs/encode.PEM
 * @see {@link module:@lumjs/encode/pem}
 */
lazy(exports, 'PEM', () => require('./pem'), E);

/**
 * @name module:@lumjs/encode.TOTP
 * @see {@link module:@lumjs/encode/totp}
 */
lazy(exports, 'TOTP', () => require('./totp'), E);

/**
 * @name module:@lumjs/encode.Signature
 * @see {@link module:@lumjs/encode/signature}
 */
lazy(exports, 'Signature', () => require('./signature'), E);
