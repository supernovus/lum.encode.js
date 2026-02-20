const { makeSet } = require('./_inc.js');

/**
 * A module-set for working with encodings.
 * 
 * Includes:
 * - Base32
 * - Base64
 * - Base91
 * - Util
 * As well as lowercase aliases for all of those.
 * 
 * @module @lumjs/encode/base
 */
module.exports = makeSet({
  Base32: require('../base32'),
  Base64: require('../base64'),
  Base91: require('../base91'),
  Util: require('../util'),
});
