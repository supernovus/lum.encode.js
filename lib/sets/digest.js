const { makeSet } = require('./_inc.js');

/**
 * A module-set for working with digests (aka data hashes).
 * 
 * Includes:
 * - Hash
 * As well as lowercase aliases for all of those, 
 * and everything from the `base` set.
 * 
 * @module @lumjs/encode/digest
 */
module.exports = makeSet({
  ...(require('./base.js')),
  Hash: require('../hash.js'),
});
