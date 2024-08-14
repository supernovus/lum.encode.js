const {S,F,isObj,isNil} = require('@lumjs/core/types');

const util   = require('./util');
const base64 = require('./base64');
const base91 = require('./base91');

const D_ALGO     = 'SHA-256';
const D_ADD_ENC  = 'base64';
const D_TIMEOUT  = 60000;
const D_TRY_TIME = 5000;

const ALGO_ALIASES = 
{
  SHA1:   'SHA-1',
  SHA256: 'SHA-256',
  SHA384: 'SHA-384',
  SHA512: 'SHA-512',
}

const ALGO_INFO =
{
  'SHA-1':   {length: 160, block: 512},
  'SHA-256': {length: 256, block: 512},
  'SHA-384': {length: 384, block: 1024},
  'SHA-512': {length: 512, block: 1024},
}

const DATA_ENCODERS = 
{
  base64, base91,
};

/**
 * Algorithm info object
 * @typedef {object} module:@lumjs/encode/hash~Algo
 * @property {string} id     - The formal id/name of the algorithm
 * @property {number} length - The output length (in bits)
 * @property {number} block  - The block size (in bits)
 */

/**
 * A simple yet flexible class for building cryptographic hashes.
 * 
 * @property {module:@lumjs/encode/hash~Algo} algo - Digest algorithm in use
 * @property {object} current - Progressive digest generation data (internal)
 * @property {object} defaults - Default options for various methods.
 * 
 * @exports module:@lumjs/encode/hash
 */
module.exports = class
{
  /**
   * Build a new Hashifier
   *
   * @param {(object|string)} [options] Options
   * 
   * If this is a `string`, it's assumed to be the `options.algo` option.
   * 
   * @param {string} [options.algo="SHA-256"] Digest (hash) algorithm
   *
   * By default we use `SHA-256` for backwards compatibility with my
   * older libraries and apps. You can set it to any *digest algorithm*
   * supported by the `SubtleCrypto` API.
   * 
   * We look up the algorithm with 
   * [getAlgorithm()]{@link module:@lumjs/encode/hash#getAlgorithm},
   * and so support hyphenless aliases and case-insensitive ids.
   * 
   * For more information on supported digest algorithms, see:
   * https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/digest
   * 
   * @param {object} [options.base64] Default options for `base64()`
   * 
   * If specified, this will become the default options for the
   * [base64()]{@link module:@lumjs/encode/hash#base64} method.
   * 
   * @param {object} [options.base91] Default options for `base91()`
   * 
   * If specified, this will become the default options for the
   * [base91()]{@link module:@lumjs/encode/hash#base91} method.
   * 
   * @param {(string|function|object)} [options.addUsing="base64"]
   * Encoder for `add()` to use when non-string values are passed.
   * 
   * If this is a `string`, it may be either `"base64"` or `"base91"`.
   * 
   * If it is a `function`, it will be sent the data value and must
   * return an encoded string representation of that value.
   * 
   * If this is an `object`, it must have a method called `encode()`
   * that works the same way as if you'd passed a `function`.
   *
   * @param {(string|function)} [options.joinWith=""]
   * What `hash()` will use to join progressive data values.
   * 
   * If this is a `string` the array of data values will be joined
   * using the `array.join()` method.
   * 
   * If it is a `function`, it will be sent the array of values,
   * and must return an encoded representation of those values
   * having been joined together in some fashion.
   * 
   * The default value is an empty string, which means the data
   * values are simply concatenated together with no separator.
   * 
   * @param {number} [options.timeout=60000] Timeout for async encoding
   * 
   * This is how long `hash()` will wait for async encoding to finish
   * before throwing an error indicating something went wrong.
   * 
   * Value is in milliseconds.
   * 
   * @param {number} [options.tryEvery=500] Interval to test async encoding
   * 
   * If async encoding is ongoing, this is the interval `hash()` will
   * test to see if encoding has finished.
   * 
   * Value is in milliseconds.
   * 
   * @throws {Error} If `options.algo` was an invalid algorithm.
   * 
   */
  constructor(options={})
  {
    if (typeof options === S)
    {
      options = {algo: options};
    }

    this.options = options;

    this.current =
    {
      queue: 0,
      hash: [],
      encoder: options.addUsing ?? D_ADD_ENC,
      joiner:  options.joinWith ?? '',
    }

    this.algo = this.getAlgorithm(
      (typeof options.algo === S) 
      ? options.algo
      : D_ALGO);

    if (this.algo === null)
    {
      throw new Error("Invalid 'algo' specified: "+options.algo);
    }

    this.defaults =
    {
      base64: options.base64 ?? {},
      base91: options.base91 ?? {},
    }

    this.timeout  = options.timeout  ?? D_TIMEOUT;
    this.tryEvery = options.tryEvery ?? D_TRY_TIME;

  } // construct

  /**
   * Lookup a hashing algorithm and return details about it
   * 
   * @param {string} id - The name of the algorithm.
   * 
   * It's case-insensitive (will be forced to uppercase),
   * and you may omit the hyphen in the algorithm name.
   * Thus `sha256` is the same as `SHA-256`.
   * 
   * @returns {?module:@lumjs/encode/hash~Algo}
   * Will be an Algo info object if the `id` was valid,
   * or `null` otherwise.
   */
  getAlgorithm(id)
  {
    id = id.toString().toUpperCase();

    if (id in ALGO_ALIASES)
    {
      id = ALGO_ALIASES[id];
    }

    if (id in ALGO_INFO)
    {
      return Object.assign({id}, ALGO_INFO[id]);
    }

    // Invalid algorithm id, nothing to return.
    return null;
  }

  /**
   * Get a cryptographic *hash*.
   * 
   * If you pass `input`, it will be hashed *immediately* and returned.
   *
   * Otherwise, if there is a current *progressive hash* in the process of
   * being built, it will be *finalized* and returned.
   *
   * @param {(string|object)} [input] Input to hash immediately
   *
   * @return {Promise<ArrayBuffer>} See `SubtleCrypto.digest()` for details.
   * 
   * @throws {TypeError} If the `options.joinWith` value is invalid,
   * and no `input` was passed.
   * 
   */
  async hash(input)
  {
    if (isNil(input))
    { // No input, let's see if we have a progrssive hash being built.
      if (this.current.queue !== 0)
      { // We need to wait for some asynchronous encoding to finish.
        return new Promise((resolve, reject) =>
        {
          const timeout = setTimeout(() =>
            {
              clearInterval(test);
              clearTimeout(timeout);
              reject(new Error("Timed out waiting for async encoding"));
            }, this.timeout);
    
            const test = setInterval(() =>
            {
              if (this.current.queue === 0)
              {
                clearInterval(test);
                clearTimeout(timeout);
                resolve(this.hash(input));
              }
            }, this.tryEvery);
        });
      }

      const joiner = this.current.joiner;

      if (typeof joiner === F)
      {
        input = joiner.call(this, this.current.hash);
      }
      else if (typeof joiner === S)
      {
        input = this.current.hash.join(joiner);
      }
      else
      {
        console.error({joiner, input, hashifier: this});
        throw new TypeError("Invalid 'joinWith' value");
      }

      // Now clear the current hash values.
      this.current.hash.length = 0;
    }

    if (typeof input === S)
    { // This is super simple.
      const encoder = new TextEncoder();
      input = encoder.encode(input);
    }
    else if (input instanceof Blob)
    { // As is this.
      input = await input.arrayBuffer();
    }

    //console.debug({algo: this.algo, input});

    return crypto.subtle.digest(this.algo.id, input);
  }

  /**
   * Get hash as a Hex string.
   *
   * @param {(string|object|null)} [input]
   * See [hash()]{@link module:@lumjs/encode/hash#hash} for details.
   * 
   * @returns {string}
   */
  async hex(input)
  {
    const hashBuf = await this.hash(input);
    const hashArr = Array.from(new Uint8Array(hashBuf));
    return (hashArr.map((b)=>b.toString(16).padStart(2, "0")).join(""));
  }

  /**
   * Get hash as a Base64-encoded string.
   *
   * @param {(string|object|null)} [input]
   * See [hash()]{@link module:@lumjs/encode/hash#hash} for details.
   * 
   * @param {object} [options] Options for Base64 encoding
   * 
   * @param {boolean} [options.url=false] Use URL-safe variant?
   * 
   * @returns {string}
   */
  async base64(input, opts=this.defaults.base64)
  {
    const hash = await this.hash(input);
    const b64str = base64.fromBytes(new Uint8Array(hash));
    return opts.url ? base64.urlize(b64str) : b64str;
  }

  /**
   * Get hash as a Base91-encoded string.
   * 
   * @param {(string|WordArray)} [input] 
   * See [hash()]{@link module:@lumjs/encode/hash#hash}
   * @param {object} [opts] Options for how to encode the hash.
   * 
   * @param {(boolean|object)} [opts.nba=false] Use `numByteArray()` ?
   * 
   * If this is `true` the *hash string* will be passed to `numByteArray()`
   * with the *default options* and the output from that will be passed to 
   * `base91.encode()`.
   * 
   * If this is an `object`, then the same logic as `true` applies, except this
   * will be used as the *explicit options* for the `numByteArray()` method.
   * 
   * If this is `false` the `ArrayBffer` will be converted into a `Uint8Array`,
   * and that will be passed to `base91.encode()`.
   * 
   * @returns {string}
   */
  async base91(input, opts=this.defaults.base91)
  {
    const nba = isObj(opts.nba) ? opts.nba : (opts.nba === true ? {} : null);

    let hash = await (nba ? this.hex(input) : this.hash(input));

    if (nba)
    {
      hash = util.numByteArray(hash);
    }

    return base91.encode(new Uint8Array(hash));
  }

  /**
   * Add input to a progressive hash.
   *
   * @param {(string|object)} input - A value to add to the hash.
   * 
   * If it is an `object` then it will be processed with the `addWith`
   * handler. See the constructor for details on supported formats.
   * 
   * String values are simply added _as-is_.
   *
   * @return {object} `this`
   */
  add(input, opts={})
  {
    if (typeof input !== S)
    {
      let enc   = this.current.encoder, 
          eopts = null;

      if (typeof enc === S)
      {
        enc = DATA_ENCODERS[enc];
        eopts = this.defaults[enc];
      }

      // Compile the options for the encoder.
      eopts = Object.assign({hashifier: this}, eopts, opts);

      if (typeof enc === F)
      { // Call the function, using the hashifier instance as `this`.
        input = enc.call(this, input, eopts);
      }
      else if (isObj(enc) && typeof enc.encode === F)
      { // Using an encoder object/instance.
        input = enc.encode(input, eopts);
      }
      else
      {
        console.error({enc, input, opts, hashifier: this});
        throw new TypeError("Invalid 'addUsing' value");
      }
    }

    let pos = this.current.hash.length + this.current.queue;

    if (input instanceof Promise)
    {
      this.current.queue++;

      input.then((data) =>
      {
        this.current.hash[pos] = data;
        this.current.queue--;
      }).catch((err) =>
      {
        console.error("An error occurred encoding data", err);
        this.current.hash[pos] = '';
        this.current.queue--;
      });

    }
    else
    {
      this.current.hash[pos] = input;
    }
    
    return this;
  }

  static new(opts={})
  {
    return new this(opts);
  }

} // Hashifier class
