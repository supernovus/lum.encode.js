const { makeSet } = require('./_inc.js');

/**
 * A module-set for working with digital signatures.
 * 
 * Includes:
 * - HMAC
 * - PEM
 * - Signature
 * - Util
 * As well as lowercase aliases for all of those.
 * 
 * @module @lumjs/encode/sign
 */
module.exports = makeSet({
  HMAC: require('../hmac.js'),
  PEM: require('../pem.js'),
  Signature: require('../signature.js'),
  Util: require('../util.js'),
});
