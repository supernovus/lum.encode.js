'use strict';

const { str2ta } = require('./util');

const UI8_FB64 = (typeof Uint8Array.fromBase64 === 'function');
const PEM_TEXT = /^\s*-----BEGIN\s+(?<label>[A-Z\s]+)-----\n(?<base64>.*?)\n-----END\s+\k<label>-----\s*$/s;
const parseText = (str) => (PEM_TEXT.exec(str)?.groups ?? null);
const validInfo = (pem) => (pem
  && typeof pem === 'object' 
  && typeof pem.label === 'string'
  && typeof pem.base64 === 'string'
);

/**
 * A class for parsing and decoding PEM documents.
 * 
 * PEM is a format commonly used for encryption keys.
 * See: https://en.wikipedia.org/wiki/Privacy-Enhanced_Mail
 * 
 * @alias {module:@lumjs/encode/pem}
 */
class PEM {

  /**
   * Parse a string into a PEM object instance.
   * 
   * This method is strict and will throw an error on failure.
   * For a more lenient way to parse PEM documents, see the
   * {@link module:@lumjs/encode/pem.parse parse()} method. 
   * 
   * @param {string} pem - PEM format string to be parsed.
   * @throws {TypeError} If the `pem` argument is an invalid value.
   * @throws {SyntaxErrror} If the `pem` string was not able to be parsed.
   */
  constructor(pem) {

    if (typeof pem === 'string') {
      let pemStr = pem;
      pem = parseText(pemStr);
      if (!validInfo(pem)) {
        console.error('new PEM()', pemStr);
        throw new SyntaxError("invalid PEM string passed to PEM constructor");
      }
    }
    else if (!validInfo(pem)) {
      console.error('new PEM()', pem);
      throw new TypeError("invalid argument passed to PEM constructor");
    }

    // Copy the properties from the info into this.
    Object.assign(this, pem);
  }

  /**
   * Decode the base64 content.
   * 
   * @param {(boolean|function)} [typeClass=false] Return a TypedArray?
   * 
   * This may be set to the constructor function of any TypedArray class.
   * It may also be set to `true` as an alias for `Uint8Array`.
   * 
   * If it is set to `false` (the default), then the binary string output
   * from the `atob()` global function will be used as the return value.
   * 
   * If this is set to Uint8Array (either explicitly or by using `true`),
   * and a method named `Uint8Array.fromBase64` exists, then this will use
   * that to parse the base64 content rather than using the
   * {@link module:@lumjs/encode/util.str2ta str2ta()} function.
   * 
   * @returns {(string|TypedArray|Error)}
   * 
   * If an error is thrown by any functions being used to decode the base64
   * content, that error will be the return value.
   * 
   * Otherwise the `typeClass` argument will determine the returned type.
   */
  decode(typeClass=false) {
    if (typeClass === true) {
      typeClass = Uint8Array;
    }

    let val = null;

    if (UI8_FB64 && typeClass === Uint8Array) { 
      try {
        val = typeClass.fromBase64(this.base64);
      } catch (err) {
        return err;
      }
      return val;
    }

    try {
      val = atob(this.base64); 
    } catch (err) {
      return err;
    }
    
    if (typeClass && typeof val === 'string') {
      try {
        val = str2ta(val, typeClass);
      } catch (err) {
        return err;
      }
    }

    return val;
  }

  /**
   * Parse a string into a PEM object instance.
   * 
   * This is almost identical to the main class constructor,
   * except this version will simply return null if the argument
   * could not be parsed as a valid PEM string.
   * 
   * @param {string} pemText - PEM format string to be parsed.
   * @returns {?module:@lumjs/encode/pem} A PEM instance;
   * or null if the pemText could not be parsed.
   */
  static parse(pemText) {
    let info = parseText(pemText);
    return info ? new this(info) : info;
  }

}

module.exports = PEM;
