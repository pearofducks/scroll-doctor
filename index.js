let elements = []

const bodyStyleHistory = {}
const bodyStyleTargets = Object.freeze({ overflow: 'hidden', position: 'relative', height: '100%' })

const preventDefault = event => {
  const evt = event || window.event

  // Bail if multi-touch, e.g. pinch to zoom.
  if (evt.touches.length > 1) return true

  if (evt.preventDefault) evt.preventDefault()

  return false
}

const setBodyStyle = ([k, v]) => {
  bodyStyleHistory[k] = document.body.style[k]
  document.body.style[k] = v
}
const setBodyStyles = () => Object.entries(bodyStyleTargets).forEach(setBodyStyle)
const resetBodyStyle = k => document.body.style[k] = bodyStyleHistory[k]
const resetBodyStyles = () => Object.keys(bodyStyleTargets).forEach(resetBodyStyle)

// https://developer.mozilla.org/en-US/docs/Web/API/Element/scrollHeight#Problems_and_solutions
const isElementTotallyScrolled = el => el.scrollHeight - Math.abs(el.scrollTop) === el.clientHeight

function addTouchHandlers(el) {
  let initialClientY = -1

  const handleScroll = (event) => {
    if (event.targetTouches.length !== 1) return

    const clientY = event.targetTouches[0].clientY - initialClientY

    // el is at the top of its scroll.
    if (el.scrollTop === 0 && clientY > 0) return preventDefault(event)

    // el is at the bottom of its scroll.
    if (isElementTotallyScrolled(el) && clientY < 0) return preventDefault(event)

    event.stopPropagation()
    return true
  }

  el.ontouchstart = event => {
    if (event.targetTouches.length === 1) initialClientY = event.targetTouches[0].clientY
  }
  el.ontouchmove = handleScroll
}

function removeTouchHandlers(el) {
  el.ontouchstart = null
  el.ontouchmove = null
}

const modifyDocumentListener = (_add) => () => document[add ? 'addEventListener' : 'removeEventListener']('touchmove', preventDefault, { passive: false })
const setDocumentListener = modifyDocumentListener(true)
const resetDocumentListener = modifyDocumentListener()

export function setup(el) {
  if (!el) throw Error('Could not run setup, an element must be provided')

  // idempotentcy
  if (elements.some(e => e === el)) return

  if (!elements.length) {
    setBodyStyles()
    setDocumentListener()
  }

  addTouchHandlers(el)
  elements.push(el)
}

export function teardown() {
  elements.forEach(removeTouchHandlers)
  resetDocumentListener()
  resetBodyStyles()
  elements = []
}
