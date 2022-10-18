/**
 * A full set of encoding utilities.
 * @module @lumjs/encode
 */

const {can,from} = require('@lumjs/core').buildModule(module);

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
from('./util', 'ord', 'numByteArray');

/**
 * @name module:@lumjs/encode.Base64
 * @see {@link module:@lumjs/encode/base64}
 */
can('Base64', true);

/**
 * @name module:@lumjs/encode.Base91
 * @see {@link module:@lumjs/encode/base91}
 */
can('Base91', true);

/**
 * @name module:@lumjs/encode.Safe64
 * @see {@link module:@lumjs/encode/safe64}
 */
can('Safe64', true);

/**
 * @name module:@lumjs/encode.Hash
 * @see {@link module:@lumjs/encode/hash}
 */
can('Hash', true);

/**
 * @name module:@lumjs/encode.Crypto
 * @see {@link module:@lumjs/encode/crypto}
 */
can('Crypto', true);
