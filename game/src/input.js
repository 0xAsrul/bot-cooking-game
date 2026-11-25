// Saffron Stall — mouse and keyboard. The game plays with both: click the
// piles and the plate, or use the keys. Nothing here touches the network.

import { PLATE, PLAY_W, PLAY_H } from './config.js';
import { pileRect } from './render.js';

const PILE_IDS = ['flatbread', 'kebab', 'onion', 'sauce', 'noodles', 'egg', 'greens', 'chili', 'samosa', 'chutney', 'rice', 'chicken'];

/** A click event's position in canvas coordinates. */
export function canvasPos(canvas, event) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: ((event.clientX - rect.left) / rect.width) * PLAY_W,
    y: ((event.clientY - rect.top) / rect.height) * PLAY_H,
  };
}

/**
 * Wire up input. `hooks` is what the shell does with each action:
 * onIngredient(id, result), onServe(), onClear(), onSelect(index),
 * onStart() — the shell owns the sounds and the HUD, this module owns the
 * hit-testing.
 */
export function bindInput(canvas, state, hooks) {
  canvas.addEventListener('click', (event) => {
    const pos = canvasPos(canvas, event);
    // A click on the finished plate serves it.
    if (pos.x >= PLATE.x && pos.x <= PLATE.x + PLATE.w && pos.y >= PLATE.y && pos.y <= PLATE.y + PLATE.h) {
      if (state.plateComplete()) hooks.onServe();
      return;
    }
    // A click on a counter pile works that ingredient.
    for (let i = 0; i < PILE_IDS.length; i++) {
      const r = pileRect(i);
      if (pos.x >= r.x && pos.x <= r.x + r.w && pos.y >= r.y && pos.y <= r.y + r.h) {
        const id = PILE_IDS[i];
        const result = state.clickIngredient(id);
        hooks.onIngredient(id, result);
        return;
      }
    }
  });

  window.addEventListener('keydown', (event) => {
    if (event.repeat) return;
    if (event.code === 'Space') {
      event.preventDefault();
      hooks.onServe();
    } else if (event.key === 'r' || event.key === 'R') {
      hooks.onClear();
    } else if (event.key >= '1' && event.key <= '4') {
      hooks.onSelect(Number(event.key) - 1);
    } else if (event.key === 'm' || event.key === 'M') {
      hooks.onMute();
    }
  });
}
