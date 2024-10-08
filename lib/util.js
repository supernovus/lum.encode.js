/**
 * Low-level encoding utilities
 * @module @lumjs/encode/util
 */
const {N} = require('@lumjs/core/types');

/**
 * Return the ASCII/Unicode number for a character.
 * 
 * Originally extracted from `phpjs`, which has been deprecated and replaced by 
 * [locutus](https://locutus.io/) 
 * which has a bunch of different programming language standard libraries.
 * While I'd normally just add the library to the dependency list, I think
 * including a `4.2 MB` library for a *single function* is overkill. 
 * 
 * @param {string} string
 * @returns {number}
 */
exports.ord = function (string)
{
  //  discuss at: https://locutus.io/php/ord/
  // original by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
  // bugfixed by: Onno Marsman
  // improved by: Brett Zamir (http://brett-zamir.me)
  //    input by: incidence
  //   example 1: ord('K');
  //   returns 1: 75
  //   example 2: ord('\uD800\uDC00'); // surrogate pair to create a single Unicode character
  //   returns 2: 65536

  var str = string + '',
    code = str.charCodeAt(0);
  if (0xD800 <= code && code <= 0xDBFF) 
  {
    // High surrogate (could change last hex to 0xDB7F to treat high private surrogates as single characters)
    var hi = code;
    if (str.length === 1) 
    {
      // This is just a high surrogate with no following low surrogate, so we return its value;
      return code;
      // we could also throw an error as it is not a complete character, but someone may want to know
    }
    var low = str.charCodeAt(1);
    return ((hi - 0xD800) * 0x400) + (low - 0xDC00) + 0x10000;
  }
  if (0xDC00 <= code && code <= 0xDFFF) 
  {
    // Low surrogate
    // This is just a low surrogate with no preceding high surrogate, so we return its value;
    return code;
    // we could also throw an error as it is not a complete character, but someone may want to know
  }
  return code;
}

/**
 * Convert a numeric string into an array of byte values for encoding purposes.
 * 
 * @param {string} numStr - The numeric string
 * @param {(object|number)} [options] Options
 * 
 * If this is a `number` then it's assumed to be `options.size`.
 * 
 * @param {number} [options.size=2] The number of characters in each number.
 * 
 * With the default `size` of `2` and the default `base` of `16`, this
 * will turn the numeric string `0FD4` into `[15,212]`.
 * If you change `len` to `1`, the same string would become `[0,15,13,4]`.
 * 
 * @param {number} [options.base=16] The numeric base for the string.
 * 
 * The valid range is between `2` and `36`.
 * This defaults to `16` which is Hexadecimal.
 * 
 * @param {boolean} [options.strict=false] Do not allow indivisible strings
 * 
 * If this is `true` and the length of `numStr` is not divisible by 
 * `options.size`, then a `RangeError` will be thrown.
 * 
 * This takes priority over the `options.pad` option.
 * 
 * @param {boolean} [options.pad=false] Pad indivisible strings
 * 
 * If this is `true` and the length of `numStr` is not divisible by
 * `options.size`, then the string will be padded with leading `0`s
 * to make it divisible.
 * 
 * If both this and `options.strict` are `false` (the default),
 * then the string will be extracted in bytes of `options.size` for
 * as many blocks as it is cleanly divisible, then the remainder of
 * the string will be parsed regardless of its length.
 * 
 * @returns {Array} An array of integers.
 */
exports.numByteArray = function (numStr, options={})
{
  if (typeof options === N)
  {
    options = {size: options};
  }

  const numOpt = (name, defval, min, max) => 
  {
    const optval = options[name];
    if (typeof optval !== N)
    { // Was not a number, skip it.
      return defval;
    }
    if (optval < min)
    { // Value was lower than minimum.
      throw new RangeError(`${name} value ${optval} is less than ${min}`);
    }
    if (max !== 0 && optval > max)
    { // Value was higher than maximum.
      throw new RangeError(`${name} value ${optval} is more than ${max}`);
    }

    return optval;
  }

  const len  = numOpt('size', 2,  1, 0);
  const base = numOpt('base', 16, 2, 36);

  let strLen = numStr.length;
  let remainder = strLen % len;

  if (options.strict && remainder !== 0)
  {
    throw new RangeError(`string length ${strLen} is not divisible by ${len}`);
  }
  else if (options.pad && remainder !== 0)
  {
    const padSize = len - remainder;
    numStr = numStr.padStart(strLen+padSize, '0');
    strLen = numStr.length;
    remainder = strLen % len;
    if (remainder !== 0)
    { // Something is wrong in the universe...
      console.debug({numStr, strLen, len, remainder, arguments});
      throw new Error("string has remainder after padding");
    }
  }

  const endOf = strLen - (len-1);
  const bytes = [];

  const getBytes = (a,b) => bytes.push(parseInt(numStr.substring(a, b), base));

  for(let i=0; i < endOf; i+=len) 
  {
    getBytes(i, i+len);
  }

  if (remainder !== 0)
  {
    getBytes(strLen - remainder, strLen);
  }

  return bytes;
}

/**
 * Convert a `WordArray` object into a Uint8Array
 * 
 * @param {WordArray} wordArray
 * @returns {Uint8Array}
 */
exports.wordArrayToUint8Array = function(wordArray) 
{
  const l = wordArray.sigBytes;                                                                                                        
  const words = wordArray.words;                                                                                                       
  const result = new Uint8Array(l);                                                                                                    
  var i=0 /*dst*/, j=0 /*src*/;
  while(true) {
      // here i is a multiple of 4
      if (i==l)
          break;
      var w = words[j++];
      result[i++] = (w & 0xff000000) >>> 24;
      if (i==l)
          break;
      result[i++] = (w & 0x00ff0000) >>> 16;                                                                                            
      if (i==l)                                                                                                                        
          break;                                                                                                                       
      result[i++] = (w & 0x0000ff00) >>> 8;
      if (i==l)
          break;
      result[i++] = (w & 0x000000ff);                                                                                                  
  }
  return result;
}
