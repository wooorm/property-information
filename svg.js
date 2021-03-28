import {merge} from './lib/util/merge.js'
import {xlink} from './lib/xlink.js'
import {xml} from './lib/xml.js'
import {xmlns} from './lib/xmlns.js'
import {aria} from './lib/aria.js'
import {svg as svgBase} from './lib/svg.js'

export var svg = merge([xml, xlink, xmlns, aria, svgBase])
