
const {S,isObj} = require('@lumjs/core/types');
const Base64 = require('crypto-js/enc-base64');
const Utf8 = require('crypto-js/enc-utf8');

/**
 * Base64 functions.
 * 
 * Provides friendlier wrappers around the `crypto-js` libraries.
 * 
 * @module @lumjs/encode/base64
 */

/**
 * Encode data as a `Base64` string.
 *
 * @param {(string|WordArray)} rawdata - The data we want to encode.
 * 
 * If this is a `string` we'll convert it into a `WordArray` using
 * the `stringFormat` object.
 * 
 * @param {object} [stringFormat=Utf8] The string format.
 * 
 * Can be any encoding module from the `crypto-js` library.
 * Default is `CryptoJS.enc.Utf8`
 *
 * @return {string} The encoded string.
 */
exports.encode = function(rawdata, stringFormat=Utf8)
{
  const data = typeof rawdata === S ? stringFormat.parse(rawdata) : rawdata;
  return Base64.stringify(data);
}

/**
 * Decode a `Base64` string back into raw data.
 *
 * @param {string} string - The Base64 string to decode.
 * 
 * @param {(object|false)} [stringFormat=Utf8] The string format.
 * 
 * Can be any encoder library from the `crypto-js` library.
 * Default is `CryptoJS.enc.Utf8`
 * 
 * If this is `false`, we'll return a `WordArray` object.
 *
 * @return {(string|WordArray)} The decoded output.
 */
exports.decode = function(string, stringFormat=Utf8)
{
  const data = Base64.parse(string);
  return (isObj(stringFormat) ? data.toString(stringFormat) : data);
}

exports.Utf8 = Utf8;
