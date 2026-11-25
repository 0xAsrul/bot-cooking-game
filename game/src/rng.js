// Saffron Stall — a small seeded random source, so a screenshot preset
// (and a replay) always deals the same tickets.

/** mulberry32: a tiny deterministic PRNG. */
export function mulberry32(seed) {
  let a = seed >>> 0;
  return function next() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Pick one element of `list` using `rand`. */
export function pick(rand, list) {
  return list[Math.floor(rand() * list.length)];
}

/** An integer in [min, max] using `rand`. */
export function intBetween(rand, min, max) {
  return min + Math.floor(rand() * (max - min + 1));
}
