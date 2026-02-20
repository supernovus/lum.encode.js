/**
 * Make lowercase aliases for every key in an object.
 * @param {object} obj - Target object.
 * @returns {object} `obj`
 */
function makeSet(obj) {
  for (let key in obj) {
    let lc = key.toLowerCase();
    if (key !== lc) {
      obj[lc] = obj[key];
    }
  }
  return obj;
}

module.exports = {
  makeSet,
}
