/**
 * Base32 encoding in pure JS.
 * 
 * Originally based on an implementation from Richard Thiessen:
 * https://gist.github.com/RichardThiessen/5a4e32d57aafd5430c09122f23e4b757
 * 
 * With a lot of my own tweaks and enhancements obviously.
 * 
 * @module @lumjs/encode/base32
 */
'use strict';

const { isObj } = require('@lumjs/core/types');
const cp = Object.assign;
const lock = Object.freeze;

/**
 * Supported Base32 variants.
 * 
 * Unlike Base64 which typically only has two versions (which only have minor
 * differences), Base32 has multiple variants which use vastly different
 * encoding alphabets. We support a handful of well known variants.
 * 
 * For every lowercase property name in this object, there is
 * also an uppcase alias that is the exact same type definition.
 * 
 * This namespace object is also exported as `TYPES`.
 * 
 * @alias module:@lumjs/encode/base32.Base32Types
 */
const Base32Types = {
  /** The RFC4648 standard format. */
  rfc4648: lock(['ABCDEFGHIJKLMNOPQRSTUVWXYZ234567']),
  /** The zbase32 variant. */
  zbase32: lock(['ybndrfg8ejkmcpqxot1uwisza345h769']),
  /** The geohash variant. */
  geohash: lock(['0123456789bcdefghjkmnpqrstuvwxyz']),
  /** Douglas Crockford's variant. */
  crockford: lock(['0123456789ABCDEFGHJKMNPQRSTVWXYZ', 'O0', 'I1', 'L1']),
}

/**
 * An alias to RFC4648 recognizing that it is the default variant.
 */
Base32Types.default = Base32Types.rfc4648;

for (let lcid in Base32Types) {
  let ucid = lcid.toUpperCase();
  Base32Types[ucid] = Base32Types[lcid];
}

lock(Base32Types);

const UTF8 = 'utf-8';
const encodeText = s => new TextEncoder(UTF8).encode(s);
const decodeText = b => new TextDecoder(UTF8).decode(b);

function _opts(opts, bopt) {
  if (typeof opts === 'string' || Array.isArray(opts)) {
    opts = { type: opts };
  }
  else if (typeof opts === 'boolean') {
    return { [bopt]: opts, type: Base32Types.default };
  }
  else if (!isObj(opts)) {
    return { type: Base32Types.default }
  }

  if (typeof opts.type === 'string') {
    if (Array.isArray(Base32Types[opts.type])) {
      opts.type = Base32Types[opts.type];
    }
    else {
      console.error("unknown base32 type", opts.type, opts);
      opts.type = Base32Types.default;
    }
  }
  else if (Array.isArray(opts.type)) {
    if (typeof opts.type[0] !== 'string' || opts.type[0].length !== 32) {
      console.error("invalid base32 type def", opts.type, opts);
      opts.type = Base32Types.default;
    }
  }
  else {
    if (opts.type !== undefined) {
      console.error("invalid base32 type option value", opts.type, opts);
    }
    opts.type = Base32Types.default;
  }

  return opts;
}

function _b32_map(typedef) {
  let alphabet = typedef[0].toUpperCase();
  let aliases = typedef.slice(1);
  let lookup = new Map(alphabet.split("").map((c, i) => [c, i]));
  aliases.map(x => lookup.set(x[0], lookup.get(x[1])));
  return lookup;
}

/**
 * Decode a Base32-encoded string.
 * @param {string} str - Base32 string.
 * @param {(object|string)} [opts] Options.
 * 
 * If this is a boolean it will be used as `opts.string`.
 * 
 * If this is a string or one of the `Base32Types` properties,
 * it will be used as `opts.type`.
 * 
 * @param {(string|Array)} [opts.type] Base32 variant to use.
 * 
 * If this is a string it must be the name (uppercase or lowercase)
 * of one of the properties in the `Base32Types` object.
 * 
 * If it is an Array it is expected that it is one of the properties
 * from the Base32Types, or a compatible type def where the first
 * item in the array is a string consisting of exactly 32 unique characters.
 * 
 * @param {boolean} [opts.string=false] Return a UTF-8 string?
 * 
 * If this is true then we will assume the original encoded value was a UTF-8
 * string, and will decode it as such using a TextDecoder instance.
 * 
 * If this is false (the default) we will return a Uint8Array.
 * 
 * @returns {(Uint8Array|string)}
 * @alias module:@lumjs/encode/base32.decode
 */
function base32Decode(str, opts) {
  opts = _opts(opts, 'string');
  let lookup = _b32_map(opts.type);
  // remove whitespace and padding
  str = str.replace(/\s+/g, "").replace(/=*$/g, "");
  let vals = str.toUpperCase().split("").map(c => lookup.get(c));
  if (vals.indexOf(undefined) != -1) {
    throw new RangeError("Base32: string includes non-Base32 characters");
  }

  let bytes = new Uint8Array((vals.length * 5 / 8) | 0);
  for (let i = 0; i < vals.length; i += 8) {
    //do all, missing indices will fail silently
    let b_o = (i / 8 * 5) | 0;
    bytes[b_o + 0] = (vals[i + 0] << 3) | (vals[i + 1] >> 2);
    bytes[b_o + 1] = (vals[i + 1] << 6) | (vals[i + 2] << 1) | (vals[i + 3] >> 4);
    bytes[b_o + 2] = (vals[i + 3] << 4) | (vals[i + 4] >> 1);
    bytes[b_o + 3] = (vals[i + 4] << 7) | (vals[i + 5] << 2) | (vals[i + 6] >> 3);
    bytes[b_o + 4] = (vals[i + 6] << 5) | (vals[i + 7] >> 0);
  }

  return opts.string ? decodeText(bytes) : bytes;
}

/**
 * Encode a value into a Base32 string.
 * 
 * @param {(ArrayBuffer|TypedArray|string)} data - Data to be encoded.
 * 
 * If this is a string it will be converted into a Uint8Array using a
 * TextEncoder instance.
 * 
 * @param {(object|string|boolean)} [opts] Options.
 * 
 * If this is a boolean it will be used as `opts.pad`.
 * 
 * If this is a string or one of the `Base32Types` properties,
 * it will be used as `opts.type`.
 * 
 * @param {(string|Array)} [opts.type] Base32 variant to use.
 * 
 * If this is a string it must be the name (uppercase or lowercase)
 * of one of the properties in the `Base32Types` object.
 * 
 * If it is an Array it is expected that it is one of the properties
 * from the Base32Types, or a compatible type def where the first
 * item in the array is a string consisting of exactly 32 unique characters.
 * 
 * @param {boolean} [opts.pad=true] Add `=` padding characters?
 * 
 * Base32 (like Base64) uses `=` as a padding character to ensure the length
 * of the encoded strings are divisible by 8. As that is a part of
 * the standard specification, this option defaults to true.
 * 
 * If you explicitly set this to false the string won't have any padding
 * added to it, regardless of its length.
 * 
 * @returns {string}
 * @alias module:@lumjs/encode/base32.encode
 */
function base32Encode(buf, opts) {
  opts = _opts(opts, 'pad');
  let alphabet = opts.type[0];
  if (buf.byteLength === undefined) { //not Arraybuffer?
    buf = encodeText(buf);
  }

  //may need extra zero at end of buf for some bits of last value
  let bytes = new Uint8Array(buf.byteLength + 1);
  bytes.set(buf, 0)
  let out = new Uint8Array(((buf.byteLength * 8 + 4) / 5) | 0);

  for (let i = 0; i < out.length; i += 8) {
    //do all,missing indices will fail silently
    let b_o = (i / 8 * 5) | 0;
    out[i + 0] = (bytes[b_o + 0] >> 3);
    out[i + 1] = (bytes[b_o + 0] << 2) | (bytes[b_o + 1] >> 6);
    out[i + 2] = (bytes[b_o + 1] >> 1);
    out[i + 3] = (bytes[b_o + 1] << 4) | (bytes[b_o + 2] >> 4);
    out[i + 4] = (bytes[b_o + 2] << 1) | (bytes[b_o + 3] >> 7);
    out[i + 5] = (bytes[b_o + 3] >> 2);
    out[i + 6] = (bytes[b_o + 3] << 3) | (bytes[b_o + 4] >> 5);
    out[i + 7] = (bytes[b_o + 4] >> 0);
  }
  
  let str = Array.from(out.entries(), x => alphabet[x[1] & 31]).join("");
  if (opts.pad ?? true) {
    str = str.padEnd(out.length + (8 - (out.length % 8)) % 8, "=");
  }
  return str;
}

module.exports = {
  Base32Types, TYPES: Base32Types,
  base32Encode, encode: base32Encode,
  base32Decode, decode: base32Decode,
}
