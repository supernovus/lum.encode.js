const { makeSet } = require('./_inc.js');

/**
 * A module-set that includes all sub-modules except `polyfill`.
 * 
 * More specifically this composes together the `digest` and `otp`
 * module-sets (which in turn compose `base` and `sign` respectively).
 * 
 * @alias module:@lumjs/encode/all
 */
module.exports = makeSet({
  ...(require('./digest')),
  ...(require('./otp')),
});
