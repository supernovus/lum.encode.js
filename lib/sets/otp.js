const { makeSet } = require('./_inc.js');

/**
 * A module-set for working with One-Time-Passwords (OTP).
 * 
 * Includes:
 * - HOTP
 * - TOTP
 * As well as lowercase aliases for all of those,
 * and everything from the `sign` set.
 * 
 * @module @lumjs/encode/otp
 */
module.exports = makeSet({
  ...(require('./sign')),
  HOTP: require('../hotp'),
  TOTP: require('../totp'),
});
