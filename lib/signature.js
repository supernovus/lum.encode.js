'use strict';

/**
 * A small wrapepr class representing a crypto signature.
 * @alias module:@lumjs/encode/signature
 */
class Signature {
  /**
   * Build a Signature instance.
   * @param {ArrayBuffer} buffer - The signature data.
   */
  constructor(buffer) {
    this.buffer = buffer;
  }

  /**
   * Get the signature as a Uint8Array.
   */
  get uint8Array() {
    return new Uint8Array(this.buffer);
  }

  /**
   * Get the signature as an array of bytes.
   */
  get byteArray() {
    return Array.from(this.uint8Array);
  }

  /**
   * Get the signature as a Hex string.
   */
  get hex() {
    return this.byteArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }
}
