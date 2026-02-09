'use strict';

const HOTP = require('./hotp');
const DEF_OPTS = {step: 30};

/**
 * Time-based One-Time-Passwords.
 * @exports module:@lumjs/encode/totp
 */
class TOTP extends HOTP {
  get defaultOptions() {
    return [...super.defaultOptions, DEF_OPTS];
  }

  getExpiry(opts) {
    return this.getOptions(opts).expires;
  }

  getOptions() {
    let opts = super.getOptions(...arguments);
    if (!opts.time) opts.time = Date.now();
    let ts = opts.time / 1000;
    opts.counter = Math.floor(ts / opts.step);
    opts.expires = 30 - Math.floor(ts) % 30;
    return opts;
  }
}

module.exports = TOTP;
