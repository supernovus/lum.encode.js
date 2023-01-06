/**
 * A full set of encoding utilities.
 * @module @lumjs/encode
 */

const {def,lazy} = require('@lumjs/core/types');

const E = def.e;

const util = require('./util');

/**
 * @alias module:@lumjs/encode.ord
 * @see {@link module:@lumjs/encode/util.ord}
 */
def(exports, 'ord', util.ord, E);

/**
 * @name module:@lumjs/encode.numByteArray
 * @function
 * @see {@link module:@lumjs/encode/util.numByteArray}
 */
def(exports, 'numByteArray', util.numByteArray, E);

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
 * @name module:@lumjs/encode.Safe64
 * @see {@link module:@lumjs/encode/safe64}
 */
lazy(exports, 'Safe64', () => require('./safe64'), E);

/**
 * @name module:@lumjs/encode.Hash
 * @see {@link module:@lumjs/encode/hash}
 */
lazy(exports, 'Hash', () => require('./hash'), E);

/**
 * @name module:@lumjs/encode.Crypto
 * @see {@link module:@lumjs/encode/crypto}
 */
lazy(exports, 'Crypto', () => require('./crypto'), E);
