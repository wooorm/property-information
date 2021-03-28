import {caseSensitiveTransform} from './case-sensitive-transform.js'

export function caseInsensitiveTransform(attributes, property) {
  return caseSensitiveTransform(attributes, property.toLowerCase())
}
