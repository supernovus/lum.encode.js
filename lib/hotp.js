'use strict';

const HmacEncoder = require('./hmac');
const { delimited, intToBytes, isTypedArray } = require('./util');

const DEBUG = Object.freeze({
  LOG:  1,
  INFO: 2,
});

const DEF_OPTS = { 
  algorithm: 'SHA-1',
  codeSize: 6,
  counter: 0,
  debug: 0,
  window: 50
};

const cp = Object.assign;
const isError = v => (typeof v === 'function' && Error.isPrototypeOf(v));
const isKey = key => (typeof key === 'string' || isTypedArray(key));

function needKey(key) {
  if (!isKey(key)) {
    throw new Error("No signing key was specified");
  }
}

/**
 * HMAC-based One-Time-Passwords.
 * 
 * TODO: this needs proper documentation!
 * 
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

  get defaultOptions() {
    return [DEF_OPTS];
  }

  /**
   * Generate an OTP token code.
   * @param {object} [opts] Options.
   * 
   * You can override any of the options supported by the constructor
   * by passing them here instead.
   * 
   * @param {boolean} [fromVerify=false] *INTERNAL USE ONLY*
   * 
   * Do not use this, it's used by verify() only!
   * 
   * @returns {module:@lumjs/encode~OTPGenerateResult}
   */
  async generate(opts, fromVerify=false) {
    if (isKey(opts)) {
      opts = this.getOptions({key: opts}, fromVerify);
      fromVerify = false;
    }
    else if (!fromVerify) {
      opts = this.getOptions(opts);
      needKey(opts.key);
    }

    let encoder = new HmacEncoder(opts.key, opts);
    let data = new Uint8Array(intToBytes(opts.counter));
    let hash = await encoder.sign(data);
    let hb = hash.byteArray;
    let cs = (typeof opts.checkSize === 'number') 
      ? opts.checkSize
      : (((typeof opts.codeSize === 'number') 
        ? opts.codeSize 
        : DEF_OPTS.codeSize)+1);

    let offset = hb[19] & 0xf;
    let v1 =
      (hb[offset] & 0x7f) << 24 |
      (hb[offset + 1] & 0xff) << 16 |
      (hb[offset + 2] & 0xff) << 8 |
      (hb[offset + 3] & 0xff);

    let v2 = (v1 % 1000000) + '';
    let code = Array(cs - v2.length).join('0') + v2;

    let res = {
      code,
      opts,
      toJSON() {
        return this.toString();
      },
      toString() {
        return delimited(this.code, opts.delimited ?? opts);
      },
    }

    if (opts.debug & DEBUG.INFO) {
      cp(res, {
        data,
        hash,
        hashBytes: hb,
        offset,
        v1,
        v2,
      });
    }

    if (!fromVerify && (opts.debug & DEBUG.LOG)) { 
      console.debug(res.code, res);
    }

    return res;
  }

  /**
   * Verify an OTP token code.
   * @param {string} token - Token code to verify.
   * @param {object} [opts] Options.
   * 
   * You can override any of the options supported by the constructor
   * by passing them here instead.
   * 
   * @returns {module:@lumjs/encode~OTPVerifyResult}
   */
  async verify(token, opts, oo) {
    if (isKey(opts)) {
      opts = this.getOptions({key: opts}, oo);
    }
    else {
      opts = this.getOptions(opts);
      needKey(opts.key);
    }

    let win = opts.window;
    let cnt = opts.counter;
    let info = { ok: false, delta: null };
    let di = (opts.debug & DEBUG.INFO);

    let done = (add) => {
      if (add) cp(info, add); // add final info
      if (opts.debug & DEBUG.LOG) console.debug(info);

      if (!info.ok && opts.throw) {
        let EClass = isError(opts.throw) ? opts.throw : Error;
        throw new EClass("OTP verification failure");        
      }

      return info;
    }

    if (di) info.stack = [];

    for (let i = cnt - win; i <= cnt + win; ++i) {
      opts.counter = i;
      let res = await this.generate(opts, true);
      if (di) info.stack.push(res);
      if (res.code === token) {
        return done({ ok: true, delta: i - cnt });
      }
    }

    return done();
  }

  /**
   * Generate an OTP token code (alternative notp-style arguments). 
   * @method module:@lumjs/encode/hotp#generate
   * @variation 2
   * @param {(string|Uint8Array)} key - Secret key.
   * @param {object} [opts] Same as main signature.
   * @param {boolean} [fromVerify=false] Same as main signature.
   * @returns {module:@lumjs/encode~OTPGenerateResult}
   */

  /**
   * Verify an OTP token code (alternative notp-style arguments).
   * @method module:@lumjs/encode/hotp#verify
   * @variation 2
   * @param {string} token - Token code to verify.
   * @param {(string|Uint8Array)} key - Secret key.
   * @param {object} [opts] Same as main signature.
   * @returns {module:@lumjs/encode~OTPVerifyResult}
   */
}

HOTP.DEBUG = DEBUG;
HOTP.prototype.DEBUG = DEBUG;

module.exports = HOTP;

/**
 * Result from generate() method.
 * 
 * In addition to the properties that are always a part of this object,
 * additional debugging info may be added depending on the options.
 * Read the source for a list of possible debugging properties.
 * 
 * @typedef {object} module:@lumjs/encode~OTPGenerateResult
 * @prop {string} code - The raw unformatted token code.
 * @prop {object} opts - The final compiled options that were used.
 */

/**
 * Result from verify() method.
 * 
 * Like OTPGenerateResult, see the source for properties that may be added
 * when specific debugging options are set.
 * 
 * @typedef {object} module:@lumjs/encode~OTPVerifyResult
 * @prop {boolean} ok - Did the token code pass verification?
 * @prop {(number|undefined)} delta - Offset from the *current* counter.
 * 
 * This property will be undefined if ok is false.
 * It will be `0` if the code is an exact match for the current counter.
 */
