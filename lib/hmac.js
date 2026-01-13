'use strict';

const Signature = require('./signature');

const CKEY = Symbol('@lumjs/encore/hmac~key');
const HMAC = 'HMAC';
const DEF_OPTS = {
  algorithm: 'SHA-256',
  extractable: false,
  keyFormat: 'raw', 
  usages: ['sign'] 
};

/**
 * The main class to perform HMAC signing.
 * @exports module:@lumjs/encode/hmac
 */
class HmacEncoder {
  /**
   * Create an encoder.
   * 
   * @param {(string|TypedArray|ArrayBuffer)} keyValue - The secret key value.
   * Will be used to generate the crypto key.
   * @param {object} [options] Options
   * @param {string} [options.algorithm="SHA-256"] Digest algorithm for HMAC.
   */
  constructor(keyValue, options) {
    this.te = new TextEncoder();
    this.keyBytes = ArrayBuffer.isView(keyValue)
      ? keyValue
      : this.te.encode(keyValue);
    this.options = Object.assign({}, DEF_OPTS, options);
  }

  /**
   * Get the crypto key for this encoder instance.
   * @returns {Promise<CryptoKey>}
   */
  async getKey() {
    if (this[CKEY]) {
      return this[CKEY];
    }

    let hmac = { name: HMAC, hash: this.options.algorithm }
    let key = await crypto.subtle.importKey(
      this.options.keyFormat,   // Key format
      this.keyBytes,            // Key data
      hmac,                     // Algorithm
      this.options.extractable, // Is key extractable
      this.options.usages,      // Allowed key usages
    );

    this[CKEY] = key;
    return key;
  }

  /**
   * Sign a message (any kind of data).
   * @param {(string|TypedArray|ArrayBuffer)} message - Message to be signed.
   * @returns {Promise<module:@lumjs/encode/signature>}
   */
  async sign(message) {
    if (!ArrayBuffer.isView(message)) {
      message = this.te.encode(message);
    }

    let key = await this.getKey();
    let sig = await crypto.subtle.sign(
      HMAC,            // Algorithm
      key,             // HMAC CryptoKey
      message,         // Data to sign
    );

    return new Signature(sig);
  }

}

module.exports = HmacEncoder;
