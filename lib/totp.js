'use strict';

const HOTP = require('./hotp');
const DEF_OPTS = {step: 30};

/**
 * Time-based One-Time-Passwords.
 * 
 * TODO: this needs proper documentation!
 * 
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
    let step = opts.step || DEF_OPTS.step; // 0 is not allowed
    opts.counter = Math.floor(ts / step);
    opts.expires = step - Math.floor(ts) % step;
    return opts;
  }
}

module.exports = TOTP;
