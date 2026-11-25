// Saffron Stall — everything the kitchen shows, drawn on one canvas.
// All art is code: no image files, no network, just shapes and colour.

import { INGREDIENTS, RECIPES, STATIONS, COUNTER, PLATE, PLAY_W, PLAY_H, BASE_COLORS } from './config.js';

const PILE_IDS = Object.keys(INGREDIENTS);

/** The hit rectangle of counter pile `i` (6 per row, 2 rows). */
export function pileRect(i) {
  const col = i % 6;
  const row = Math.floor(i / 6);
  return { x: COUNTER.x + col * 150, y: COUNTER.y + row * 60, w: 150, h: 60 };
}

/** Centre of pile `i` on the canvas. */
export function pileCenter(i) {
  const r = pileRect(i);
  return { x: r.x + 75, y: r.y + 26 };
}

/** One ingredient, drawn at (x, y) with radius r. */
export function drawIngredientIcon(ctx, id, x, y, r) {
  const ing = INGREDIENTS[id];
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = ing.color;
  ctx.strokeStyle = ing.dark;
  ctx.lineWidth = 2;
  if (ing.shape === 'round') {
    circle(ctx, 0, 0, r);
    ctx.fillStyle = 'rgba(255,255,255,0.45)';
    circle(ctx, -r * 0.3, -r * 0.35, r * 0.35);
  } else if (ing.shape === 'rect') {
    roundRect(ctx, -r, -r * 0.6, r * 2, r * 1.2, 6);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = 'rgba(0,0,0,0.12)';
    roundRect(ctx, -r * 0.7, -r * 0.25, r * 1.4, r * 0.5, 4);
    ctx.fill();
  } else if (ing.shape === 'strip') {
    ctx.lineWidth = 4;
    ctx.strokeStyle = ing.color;
    ctx.lineCap = 'round';
    for (let k = -1; k <= 1; k++) {
      ctx.beginPath();
      ctx.moveTo(-r, k * r * 0.45);
      ctx.quadraticCurveTo(0, k * r * 0.45 - r * 0.25, r, k * r * 0.45);
      ctx.stroke();
    }
    ctx.lineWidth = 2;
    ctx.strokeStyle = ing.dark;
  } else if (ing.shape === 'rings') {
    circle(ctx, 0, 0, r);
    ctx.fillStyle = '#fff';
    circle(ctx, 0, 0, r * 0.55);
    ctx.fillStyle = ing.color;
    circle(ctx, 0, 0, r * 0.28);
  } else if (ing.shape === 'leaf') {
    ctx.beginPath();
    ctx.ellipse(0, 0, r, r * 0.6, -0.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.strokeStyle = ing.dark;
    ctx.beginPath();
    ctx.moveTo(-r * 0.8, r * 0.4);
    ctx.lineTo(r * 0.8, -r * 0.4);
    ctx.stroke();
  } else if (ing.shape === 'wedge') {
    ctx.beginPath();
    ctx.moveTo(0, -r);
    ctx.lineTo(r * 0.9, r * 0.7);
    ctx.lineTo(-r * 0.9, r * 0.7);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = 'rgba(0,0,0,0.18)';
    ctx.beginPath();
    ctx.moveTo(0, -r * 0.4);
    ctx.lineTo(r * 0.45, r * 0.35);
    ctx.lineTo(-r * 0.45, r * 0.35);
    ctx.closePath();
    ctx.fill();
  } else if (ing.shape === 'dollop') {
    circle(ctx, 0, r * 0.15, r * 0.8);
    circle(ctx, -r * 0.4, -r * 0.3, r * 0.4);
    circle(ctx, r * 0.45, -r * 0.25, r * 0.35);
    ctx.fillStyle = 'rgba(255,255,255,0.35)';
    circle(ctx, -r * 0.25, -r * 0.2, r * 0.25);
  } else if (ing.shape === 'bowl') {
    ctx.beginPath();
    ctx.arc(0, -r * 0.2, r, 0, Math.PI);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#fff';
    circle(ctx, -r * 0.35, -r * 0.35, r * 0.22);
    circle(ctx, r * 0.3, -r * 0.4, r * 0.2);
    circle(ctx, 0, -r * 0.5, r * 0.18);
  }
  ctx.restore();
}

function circle(ctx, x, y, r) {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function label(ctx, text, x, y, size, color, bold = false) {
  ctx.fillStyle = color;
  ctx.font = `${bold ? 'bold ' : ''}${size}px system-ui, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, x, y);
}

/** The whole kitchen, one frame. */
export function drawGame(ctx, state) {
  // Wall and floor.
  const wall = ctx.createLinearGradient(0, 0, 0, PLAY_H);
  wall.addColorStop(0, '#f7e8c9');
  wall.addColorStop(0.75, '#f3ddb0');
  wall.addColorStop(1, '#8d6e63');
  ctx.fillStyle = wall;
  ctx.fillRect(0, 0, PLAY_W, PLAY_H);

  // Shelf with jars and a hanging lamp.
  ctx.fillStyle = '#a1887f';
  ctx.fillRect(40, 58, 880, 10);
  drawJar(ctx, 120, 30, '#e53935');
  drawJar(ctx, 200, 30, '#4caf50');
  drawJar(ctx, 280, 30, '#f2c94c');
  drawJar(ctx, 700, 30, '#d94f30');
  drawJar(ctx, 780, 30, '#fff8e1');
  ctx.strokeStyle = '#6d4c41';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(480, 0);
  ctx.lineTo(480, 34);
  ctx.stroke();
  ctx.fillStyle = '#ffca28';
  ctx.beginPath();
  ctx.arc(480, 48, 16, 0, Math.PI * 2);
  ctx.fill();
  label(ctx, 'SAFFRON STALL', 480, 100, 26, '#6d4c41', true);
  label(ctx, 'street food, cooked to order', 480, 126, 12, '#8d6e63');

  // The counter with its ingredient piles.
  ctx.fillStyle = '#6d4c41';
  roundRect(ctx, COUNTER.x - 8, COUNTER.y - 8, COUNTER.w + 16, COUNTER.h + 16, 12);
  ctx.fill();
  ctx.fillStyle = '#8d6e63';
  roundRect(ctx, COUNTER.x, COUNTER.y, COUNTER.w, COUNTER.h, 8);
  ctx.fill();
  for (let i = 0; i < PILE_IDS.length; i++) {
    drawPile(ctx, state, PILE_IDS[i], i);
  }

  // The four stations.
  for (const station of STATIONS) drawStation(ctx, state, station);

  // The cook and the service bell.
  drawChef(ctx, state);
  drawBell(ctx, state);

  // The plate being assembled.
  drawPlate(ctx, state);

  // Score popups.
  for (const f of state.floats) {
    ctx.globalAlpha = Math.max(0, Math.min(1, f.life));
    label(ctx, f.text, f.x, f.y, 15, f.color, true);
    ctx.globalAlpha = 1;
  }

  if (state.mode === 'title') {
    ctx.fillStyle = 'rgba(60,30,10,0.45)';
    ctx.fillRect(0, 0, PLAY_W, PLAY_H);
    ctx.fillStyle = '#fff8e1';
    roundRect(ctx, 230, 190, 500, 150, 16);
    ctx.fill();
    label(ctx, 'SAFFRON STALL', 480, 230, 30, '#6d4c41', true);
    label(ctx, 'Three minutes. Four dishes. One very hungry street.', 480, 268, 14, '#8d6e63');
    label(ctx, 'Press START SHIFT and cook!', 480, 302, 14, '#d94f30', true);
  }
  if (state.mode === 'over') {
    ctx.fillStyle = 'rgba(60,30,10,0.55)';
    ctx.fillRect(0, 0, PLAY_W, PLAY_H);
    ctx.fillStyle = '#fff8e1';
    roundRect(ctx, 230, 170, 500, 190, 16);
    ctx.fill();
    label(ctx, 'SHIFT OVER', 480, 210, 30, '#6d4c41', true);
    label(ctx, `Served ${state.served} dishes  •  ${state.score} coins  •  best streak ${state.bestStreak}`, 480, 252, 15, '#5d4037');
    label(ctx, state.walkouts === 0 ? 'Not a single customer walked out. Superb!' : `${state.walkouts} customer${state.walkouts === 1 ? '' : 's'} walked out — faster hands next shift!`, 480, 282, 13, '#8d6e63');
    label(ctx, 'Press START SHIFT to cook again.', 480, 320, 13, '#d94f30', true);
  }
}

function drawJar(ctx, x, y, color) {
  ctx.fillStyle = color;
  roundRect(ctx, x - 16, y - 18, 32, 36, 6);
  ctx.fill();
  ctx.strokeStyle = 'rgba(0,0,0,0.25)';
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.fillStyle = '#8d6e63';
  ctx.fillRect(x - 12, y - 24, 24, 8);
}

function drawPile(ctx, state, id, i) {
  const ing = INGREDIENTS[id];
  const c = pileCenter(i);
  const r = pileRect(i);
  // A little plate under the ingredient.
  ctx.fillStyle = '#fafafa';
  ctx.beginPath();
  ctx.ellipse(c.x, c.y + 12, 30, 9, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#d7ccc8';
  ctx.lineWidth = 1;
  ctx.stroke();
  const recipe = state.activeRecipe;
  const wanted = recipe && recipe.ingredients.includes(id);
  const done = state.onPlate(id);
  // A finished ingredient is dimmed; a wanted one gets a gold ring.
  ctx.save();
  if (done) ctx.globalAlpha = 0.45;
  drawIngredientIcon(ctx, id, c.x, c.y + 2, 16);
  ctx.restore();
  label(ctx, ing.name, c.x, r.y + 53, 10, '#fff8e1', true);
  // One status dot, top-right of the pile: green = ready to add, amber =
  // needs chopping or cooking first. Nothing when the dish does not need it.
  if (wanted && !done) {
    let ready = true;
    if (ing.prep === 'chop' && !state.chopped.has(id)) ready = false;
    if (typeof ing.prep === 'number' && !state.ready.has(id)) ready = false;
    ctx.fillStyle = ready ? '#43a047' : '#fb8c00';
    ctx.beginPath();
    ctx.arc(r.x + 134, r.y + 10, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#fff8e1';
    ctx.lineWidth = 1;
    ctx.stroke();
  }
  if (wanted && !done) {
    ctx.strokeStyle = '#ffca28';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(c.x, c.y + 12, 34, 12, 0, 0, Math.PI * 2);
    ctx.stroke();
  }
}

function drawStation(ctx, state, station) {
  const { x, y, w, h } = station;
  ctx.fillStyle = station.color;
  roundRect(ctx, x, y, w, h, 10);
  ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.08)';
  roundRect(ctx, x + 6, y + 6, w - 12, 30, 6);
  ctx.fill();
  label(ctx, station.name.toUpperCase(), x + w / 2, y + 21, 12, '#fff8e1', true);
  // What is cooking here, with its progress ring.
  const slot = state.cooking[station.id];
  if (slot) {
    const cx = x + w / 2;
    const cy = y + 68;
    drawIngredientIcon(ctx, slot.ingredient, cx, cy, 20);
    const frac = Math.min(1, slot.progress / slot.total);
    ctx.strokeStyle = '#ffca28';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.arc(cx, cy, 27, -Math.PI / 2, -Math.PI / 2 + frac * Math.PI * 2);
    ctx.stroke();
    label(ctx, `${Math.ceil(slot.total - slot.progress)}s`, cx, cy + 40, 10, '#ffecb3', true);
    // Steam.
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    for (let k = 0; k < 3; k++) {
      const sx = cx - 18 + k * 18 + Math.sin(state.elapsed * 2 + k) * 4;
      const sy = y + 42 - ((state.elapsed * 12 + k * 14) % 26);
      ctx.beginPath();
      ctx.arc(sx, sy, 4, 0, Math.PI * 2);
      ctx.fill();
    }
  } else {
    label(ctx, station.id === 'board' ? 'click an onion or greens to chop' : 'click an ingredient to start cooking', x + w / 2, y + 62, 10, '#d7ccc8');
    label(ctx, station.id === 'grill' ? 'kebab • chicken' : station.id === 'pot' ? 'noodles • egg • rice' : station.id === 'fryer' ? 'samosa' : 'onion • greens', x + w / 2, y + 84, 10, '#ffecb3');
  }
}

function drawChef(ctx, state) {
  const x = 90;
  const y = 470;
  // Body and apron.
  ctx.fillStyle = '#eceff1';
  roundRect(ctx, x - 26, y - 6, 52, 44, 10);
  ctx.fill();
  ctx.fillStyle = '#d94f30';
  ctx.fillRect(x - 26, y + 12, 52, 14);
  // Head and hat.
  ctx.fillStyle = '#ffccbc';
  circle(ctx, x, y - 18, 16);
  ctx.fillStyle = '#fff';
  roundRect(ctx, x - 20, y - 46, 40, 20, 8);
  ctx.fill();
  ctx.fillStyle = '#ffca28';
  ctx.fillRect(x - 20, y - 30, 40, 5);
  // Eyes and smile.
  ctx.fillStyle = '#3e2723';
  circle(ctx, x - 6, y - 20, 2);
  circle(ctx, x + 6, y - 20, 2);
  ctx.strokeStyle = '#3e2723';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(x, y - 12, 6, 0.15 * Math.PI, 0.85 * Math.PI);
  ctx.stroke();
  label(ctx, 'CHEF AMARA', x, y + 52, 9, '#fff8e1', true);
}

function drawBell(ctx, state) {
  const x = 830;
  const y = 470;
  ctx.fillStyle = '#8d6e63';
  roundRect(ctx, x - 70, y - 6, 140, 44, 8);
  ctx.fill();
  // The service bell: gold when a plate is ready to serve.
  const ready = state.plateComplete();
  ctx.fillStyle = ready ? '#ffca28' : '#bdbdbd';
  ctx.beginPath();
  ctx.arc(x, y + 4, 18, Math.PI, 0);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = ready ? '#ff8f00' : '#9e9e9e';
  ctx.fillRect(x - 20, y + 4, 40, 5);
  circle(ctx, x + 20, y + 12, 3);
  if (ready) {
    label(ctx, 'READY TO SERVE!', x, y - 28, 13, '#ffca28', true);
  } else {
    label(ctx, 'SERVICE BELL', x, y - 28, 10, '#ffecb3', true);
  }
}

function drawPlate(ctx, state) {
  const { x, y, w, h } = PLATE;
  const cx = x + w / 2;
  const cy = y + h / 2 + 6;
  const recipe = state.activeRecipe;
  const shaking = performance.now() < state.shakeUntil;
  ctx.save();
  if (shaking) ctx.translate((Math.random() - 0.5) * 6, 0);
  // The plate itself.
  ctx.fillStyle = '#eceff1';
  ctx.beginPath();
  ctx.ellipse(cx, cy, 120, 34, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#b0bec5';
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.fillStyle = '#fafafa';
  ctx.beginPath();
  ctx.ellipse(cx, cy, 92, 24, 0, 0, Math.PI * 2);
  ctx.fill();
  if (recipe) {
    // The dish base, then each added ingredient in a little row.
    ctx.fillStyle = BASE_COLORS[recipe.base];
    ctx.beginPath();
    ctx.ellipse(cx, cy - 4, 78, 18, 0, 0, Math.PI * 2);
    ctx.fill();
    state.plate.added.forEach((id, k) => {
      drawIngredientIcon(ctx, id, cx - 54 + k * 36, cy - 8 - (k % 2) * 8, 13);
    });
    label(ctx, recipe.short.toUpperCase(), cx, y + 6, 11, '#5d4037', true);
    label(ctx, `${state.plate.added.length}/${recipe.ingredients.length} on the plate`, cx, y + h - 6, 10, '#fff8e1');
  } else {
    label(ctx, 'NO ACTIVE TICKET', cx, y + 12, 11, '#8d6e63', true);
    label(ctx, 'click a ticket on the board', cx, cy, 11, '#a1887f');
  }
  ctx.restore();
  if (state.plateComplete()) {
    ctx.strokeStyle = '#2e7d32';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.ellipse(cx, cy, 128, 40, 0, 0, Math.PI * 2);
    ctx.stroke();
  }
}

/** The recipe names, for the ticket DOM (kept here so the board matches). */
export function recipeById(id) {
  return RECIPES.find((r) => r.id === id);
}
