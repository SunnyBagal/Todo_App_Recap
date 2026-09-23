// Gives every todo its own colourful gradient title, like the screenshot:
// letters filled with a colour that slides from one hue to another.
//
// The gradient is picked from the todo's id, NOT with Math.random(), because
// random would pick new colours on every re-render and the title would flicker.
// Same id -> same gradient, forever.

const GRADIENTS = [
  'linear-gradient(90deg, #a855f7, #ec4899, #f97316)', // violet → pink → orange
  'linear-gradient(90deg, #06b6d4, #3b82f6, #8b5cf6)', // cyan → blue → violet
  'linear-gradient(90deg, #f43f5e, #f59e0b)', // rose → amber
  'linear-gradient(90deg, #10b981, #06b6d4)', // emerald → cyan
  'linear-gradient(90deg, #8b5cf6, #d946ef, #f43f5e)', // violet → fuchsia → rose
  'linear-gradient(90deg, #0ea5e9, #22d3ee, #34d399)', // sky → cyan → green
  'linear-gradient(90deg, #f97316, #ef4444, #ec4899)', // orange → red → pink
  'linear-gradient(90deg, #6366f1, #a855f7, #ec4899)', // indigo → purple → pink
]

/**
 * Turn any string into a number, so the same id always lands on the same
 * gradient. This is a tiny "hash": walk the characters and mix their codes.
 *
 * gradientFor('6ab3f5b9f5184a458a1b2fc5')  ->  always the same gradient
 */
export function gradientFor(id = '') {
  let hash = 0
  for (let i = 0; i < id.length; i++) {
    // Multiply by a prime and add the character code. Math.imul keeps the
    // result a 32-bit integer instead of drifting into huge floats.
    hash = Math.imul(hash ^ id.charCodeAt(i), 0x01000193)
  }

  // Mix the high bits down into the low ones. Without this, ids that differ
  // only in their last characters (like 'a1' and 'b2') kept landing on the
  // same gradient, because only the lowest 3 bits decide the bucket.
  hash ^= hash >>> 15
  hash = Math.imul(hash, 0x2545f491)
  hash ^= hash >>> 13

  // >>> 0 turns a negative 32-bit number into a positive one;
  // % keeps the result inside the array.
  return GRADIENTS[(hash >>> 0) % GRADIENTS.length]
}

/**
 * Inline styles that paint TEXT with a gradient:
 *   backgroundImage      the gradient itself
 *   WebkitBackgroundClip clip the background to the letter shapes
 *   color: transparent   hide the normal text colour so the gradient shows
 */
export function gradientTextStyle(id) {
  return {
    backgroundImage: gradientFor(id),
    WebkitBackgroundClip: 'text',
    backgroundClip: 'text',
    color: 'transparent',
  }
}
