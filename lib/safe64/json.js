// JSON plugin
module.exports = 
{
  encode(data)
  {
    return JSON.stringify(data, this.jsonReplacer);
  },
  decode(opts)
  {
    return JSON.parse(this.$decodeValue(opts), this.jsonReviver);
  }
}
