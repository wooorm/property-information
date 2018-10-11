'use strict'

module.exports = normalize

function normalize(value) {
  const valueLowerCased = value.toLowerCase()
  const normalized = valueLowerCased.replace(/\b[:-]\b/g, '')
  // We preserve the attribute name
  // When the attribute delimiter '-' was removed
  if (normalized !== valueLowerCased) {
    return valueLowerCased
  }
  return normalized
}
