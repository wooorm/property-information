import {create} from './util/create.js'

export const xml = create({
  properties: {xmlBase: null, xmlLang: null, xmlSpace: null},
  space: 'xml',
  transform(_, prop) {
    return 'xml:' + prop.slice(3).toLowerCase()
  }
})
