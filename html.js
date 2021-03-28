import {merge} from './lib/util/merge.js'
import {xlink} from './lib/xlink.js'
import {xml} from './lib/xml.js'
import {xmlns} from './lib/xmlns.js'
import {aria} from './lib/aria.js'
import {html as htmlBase} from './lib/html.js'

export var html = merge([xml, xlink, xmlns, aria, htmlBase])
