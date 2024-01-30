let elements = []

const styleHistory = { documentElement: {}, body: {} }
export const styleTargets = Object.freeze({
  // html
  documentElement: {
    overflow: 'auto',
    height: '100%',
  },
  body: {
    overflow: 'hidden',
    position: 'relative',
    height: '100%',
    'scrollbar-gutter': 'stable',
  },
})


/** @param {Event} evt */
const preventDefault = evt => {
  // Bail if multi-touch, e.g. pinch to zoom.
  if (evt.touches.length > 1) return
  evt.preventDefault?.()
}

const setStyle = (target) => ([k, v]) => {
  styleHistory[target][k] = document[target].style[k]
  document[target].style[k] = v
}
export const setStyles = () => Object.entries(styleTargets).forEach(([target, styles]) => {
  Object.entries(styles).forEach(setStyle(target))
})
const resetStyle = (target) => ([k, _]) => {
  document[target].style[k] = styleHistory[target][k]
}
export const resetStyles = () => Object.entries(styleHistory).forEach(([target, styles]) => {
  Object.entries(styles).forEach(resetStyle(target))
})

// https://developer.mozilla.org/en-US/docs/Web/API/Element/scrollHeight#Problems_and_solutions
const isElementTotallyScrolled = el => el.scrollHeight - Math.abs(el.scrollTop) === el.clientHeight

/** @param {HTMLElement} el */
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

/** @param {HTMLElement} el */
function removeTouchHandlers(el) {
  el.ontouchstart = null
  el.ontouchmove = null
}

const modifyDocumentListener = (add) => () => document[add ? 'addEventListener' : 'removeEventListener']('touchmove', preventDefault, { passive: false })
const setDocumentListener = modifyDocumentListener(true)
const resetDocumentListener = modifyDocumentListener()

/** @param {HTMLElement} el */
export function setup(el) {
  if (!el) throw Error('Could not run setup, an element must be provided')

  // idempotentcy
  if (elements.some(e => e === el)) return

  if (!elements.length) {
    setStyles()
    setDocumentListener()
  }

  addTouchHandlers(el)
  elements.push(el)
}

export function teardown() {
  elements.forEach(removeTouchHandlers)
  resetDocumentListener()
  resetStyles()
  elements = []
}
