// UBJSON plugin
const UB = require('@shelacek/ubjson');
const WordArray = require('../crypto').WordArray;
const w2b = require('../util').wordArrayToUint8Array;

module.exports = 
{
  encode(data)
  {
    const buffer = UB.encode(data, this.ubEncOpts);
    return WordArray.create(buffer);
  },
  decode(opts)
  {
    const wordArray = this.$decodeValue(opts, false);
    const byteArray = w2b(wordArray);
    //console.debug({wordArray,byteArray});
    const arrayBuffer = byteArray.buffer;
    const decoded = UB.decode(arrayBuffer, this.ubDecOpts);
    return decoded;
  }
}

