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

  getOptions() {
    let opts = super.getOptions(...arguments);
    if (!opts.time) opts.time = Date.now();
    opts.counter = Math.floor((opts.time / 1000) / opts.step);
    return opts;
  }
}

module.exports = TOTP;
