// PHP Serialize plugin
const PHP = require('php-serialize');

module.exports = 
{
  encode(data)
  {
    return PHP.serialize(data, this.phpEncScope, this.phpEncOpts);
  },
  decode(opts)
  {
    const string = this.$decodeValue(opts);
    return PHP.unserialize(string, this.phpDecScope, this.phpDecOpts);
  }
}
