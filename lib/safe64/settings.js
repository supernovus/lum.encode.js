const {S,N,needType} = require('@lumjs/core/types');

/**
 * Safe64 Encoding Settings object
 * 
 * Not meant for use outside of the package itself.
 * @alias module:@lumjs/encode/safe64~Settings
 */
class Settings
{
  constructor(format, type)
  {
    this.format = format;
    this.type   = type;

    this.$version = 0;
    this.$offset = 0;
    this.$string = '';
  }

  get string()
  {
    if (this.$offset === 0)
    {
      return this.$string;
    }
    else
    {
      return this.$string.substring(this.$offset);
    }
  }

  setValue(string, offset)
  {
    needType(S, string);
    needType(N, offset);
    this.$string = string;
    this.$offset = offset;
  }

  set version(ver)
  {
    if (typeof ver === S)
    {
      ver = parseInt(ver, 16);
    }
    else if (typeof ver !== N)
    {
      throw new TypeError("version must be a hex string or a decimal number");
    }

    if (ver < 0) throw new RangeError("version cannot be lower than 0");
    if (ver > 255) throw new RangeError("version cannot be higher than 255");

    this.$version = ver;
  }

  get version()
  {
    return Header.hex(this.$version, Header.VL);
  }

  makeHeader(full=false)
  {
    return Header.build(this.format, this.type, this.$version, full);
  }

  get header()
  {
    if (this.$string == '' || this.$offset == 0)
    {
      return this.makeHeader();
    }
    else 
    {
      return this.$string.substring(0, this.$offset);
    }
  }

}

module.exports = Settings;

// Require Header after exporting Settings.
const Header = require('./header');
