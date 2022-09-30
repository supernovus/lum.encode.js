// UBJSON plugin
const UB = require('@shelacek/ubjson');
const WordArray = require('../crypto').WordArray;
const w2b = require('../util').wordToByteArray;

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
    const byteArray = w2b(wordArray, true).buffer;
    return UB.decode(byteArray, this.ubDecOpts);
  }
}
