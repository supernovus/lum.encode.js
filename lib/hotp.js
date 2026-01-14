'use strict';

const HmacEncoder = require('./hmac');
const { intToBytes } = require('./util');

const DEF_OPTS = { 
  algorithm: 'SHA-1',
  checkSize: 7,
  counter: 0, 
  window: 50 
};

const cp = Object.assign;
const isError = v => (typeof v === 'function' && Error.isPrototypeOf(v));

function needKey(key) {
  if (!key) {
    throw new Error("No signing key was specified");
  }
}

/**
 * HMAC-based One-Time-Passwords.
 * @exports module:@lumjs/encode/hotp
 */
class HOTP {
  constructor(options) {
    this.setOptions(options);
  }

  setOptions(options) {
    if (this.options) {
      cp(this.options, options);
    }
    else {
      this.options = cp({}, ...this.defaultOptions, options);
    }
    return this;
  }

  getOptions() {
    return cp({}, this.options, ...arguments);
  }

  get defaultKey() {
    return this.options.key;
  }

  get defaultOptions() {
    return [DEF_OPTS];
  }

  async generate(key = this.defaultKey, opts) {
    needKey(key);
    opts = this.getOptions(opts);

    let encoder = new HmacEncoder(key, opts);
    let data = new Uint8Array(intToBytes(opts.counter));
    let hash = await encoder.sign(data);
    let hb = hash.byteArray;

    let offset = hb[19] & 0xf;
    let v1 =
      (hb[offset] & 0x7f) << 24 |
      (hb[offset + 1] & 0xff) << 16 |
      (hb[offset + 2] & 0xff) << 8 |
      (hb[offset + 3] & 0xff);

    let v2 = (v1 % 1000000) + '';
    let code = Array(opts.checkSize - v2.length).join('0') + v2;

    let res = {
      opts,
      data,
      hash,
      hashBytes: hb,
      offset,
      v1,
      v2,
      code,
      toString() {
        return this.code;
      },
    }

    if (opts.debug) console.debug(res.code, res);

    return res;
  }

  async verify(token, key = this.defaultKey, opts) {
    needKey(key);
    opts = this.getOptions(opts);

    let win = opts.window;
    let cnt = opts.counter;
    let info = { ok: false };

    if (opts.debug) info.stack = [];

    for (let i = cnt - win; i <= cnt + win; ++i) {
      opts.counter = i;
      let res = this.generate(key, opts);
      if (opts.debug) info.stack.push(res);
      if (res.code === token) {
        return cp(info, { ok: true, delta: i - cnt });
      }
    }

    if (opts.throw) {
      let EClass = isError(opts.throw) ? opts.throw : Error;
      throw new EClass("OTP verification failure");
    }

    return info;
  }
}

module.exports = HOTP;
