// Saffron Stall — boot, the frame loop, and the HUD around the canvas.
// The canvas draws the kitchen; the DOM holds the readable bits: the timer,
// the score, the order tickets and the plate checklist.

import { INGREDIENTS, RECIPES, PLAY_W, PLAY_H } from './config.js';
import { GameState } from './state.js';
import { drawGame } from './render.js';
import { bindInput } from './input.js';
import { SoundFX } from './audio.js';

const $ = (id) => document.getElementById(id);

function formatTime(seconds) {
  const s = Math.max(0, Math.ceil(seconds));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

function main() {
  const canvas = $('game');
  canvas.width = PLAY_W;
  canvas.height = PLAY_H;
  const ctx = canvas.getContext('2d');

  const params = new URLSearchParams(location.search);
  const seed = Number(params.get('seed') || '1') || 1;
  const shot = params.get('shot');
  const sfx = new SoundFX();
  const state = new GameState(seed);
  if (shot) state.applyShot(shot, seed);

  // The first gesture unlocks sound (browsers demand it).
  const unlock = () => sfx.ensure();
  window.addEventListener('pointerdown', unlock, { once: true });
  window.addEventListener('keydown', unlock, { once: true });

  const hooks = {
    onIngredient(id, result) {
      if (result === 'chopped') sfx.chop();
      else if (result === 'cooking') sfx.sizzle();
      else if (result === 'added') sfx.plop();
      else if (result === 'wrong') sfx.error();
      refreshHud();
    },
    onServe() {
      if (state.serve()) {
        sfx.ding();
        refreshHud();
      } else {
        sfx.error();
      }
    },
    onClear() {
      state.clearPlate();
      refreshHud();
    },
    onSelect(index) {
      state.selectTicket(index);
      refreshHud();
    },
    onMute() {
      sfx.muted = !sfx.muted;
      $('mute-btn').textContent = sfx.muted ? 'SOUND: OFF' : 'SOUND: ON';
    },
    onStart() {},
  };
  bindInput(canvas, state, hooks);

  $('start-btn').addEventListener('click', () => {
    sfx.ensure();
    state.start();
    refreshHud();
  });
  $('serve-btn').addEventListener('click', () => hooks.onServe());
  $('clear-btn').addEventListener('click', () => hooks.onClear());
  $('mute-btn').addEventListener('click', () => hooks.onMute());

  let lastTicketSig = '';
  let lastPlateSig = '';

  function ticketSig() {
    return state.tickets.map((t) => `${t.uid}:${t.recipe}:${Math.ceil(t.patience)}`).join('|') + `#${state.activeTicket}`;
  }

  function renderTickets() {
    const sig = ticketSig();
    if (sig === lastTicketSig) return;
    lastTicketSig = sig;
    const board = $('tickets');
    board.innerHTML = '';
    if (state.tickets.length === 0) {
      const empty = document.createElement('div');
      empty.className = 'no-tickets';
      empty.textContent = state.mode === 'playing' ? 'No orders yet — the lunch crowd is coming…' : 'Press START SHIFT to open the stall.';
      board.appendChild(empty);
      return;
    }
    state.tickets.forEach((ticket, index) => {
      const recipe = RECIPES.find((r) => r.id === ticket.recipe);
      const el = document.createElement('button');
      el.className = 'ticket' + (index === state.activeTicket ? ' active' : '');
      el.type = 'button';
      el.addEventListener('click', () => {
        state.selectTicket(index);
        refreshHud();
      });
      const frac = Math.max(0, ticket.patience / ticket.maxPatience);
      const barClass = frac > 0.5 ? 'good' : frac > 0.25 ? 'warn' : 'bad';
      el.innerHTML =
        `<span class="ticket-name">${recipe.name}</span>` +
        `<span class="ticket-ing">${recipe.ingredients.map((id) => `<i style="background:${INGREDIENTS[id].color}" title="${INGREDIENTS[id].name}"></i>`).join('')}</span>` +
        `<span class="ticket-price">${recipe.price} coins</span>` +
        `<span class="patience"><b class="${barClass}" style="width:${Math.round(frac * 100)}%"></b></span>` +
        (index === state.activeTicket ? '<span class="ticket-active">COOKING</span>' : '');
      board.appendChild(el);
    });
  }

  function renderPlate() {
    const recipe = state.activeRecipe;
    const sig = recipe ? `${recipe.id}:${state.plate.added.join(',')}` : 'none';
    if (sig === lastPlateSig) return;
    lastPlateSig = sig;
    const slots = $('plate-slots');
    slots.innerHTML = '';
    if (!recipe) {
      slots.textContent = 'Pick a ticket on the board to start a dish.';
      return;
    }
    for (const id of recipe.ingredients) {
      const chip = document.createElement('span');
      chip.className = 'slot' + (state.onPlate(id) ? ' done' : '');
      chip.textContent = (state.onPlate(id) ? '✓ ' : '') + INGREDIENTS[id].name;
      slots.appendChild(chip);
    }
  }

  function refreshHud() {
    $('timer').querySelector('b').textContent = formatTime(state.timeLeft);
    $('timer').classList.toggle('urgent', state.mode === 'playing' && state.timeLeft <= 30);
    $('score').querySelector('b').textContent = `${state.score}`;
    $('served').querySelector('b').textContent = `${state.served}`;
    $('combo').textContent = state.streak >= 2 ? `STREAK x${state.streak}` : '';
    $('level').querySelector('b').textContent = `RUSH ${state.level}`;
    $('start-btn').textContent = state.mode === 'playing' ? 'RESTART SHIFT' : state.mode === 'over' ? 'PLAY AGAIN' : 'START SHIFT';
    $('serve-btn').disabled = !state.plateComplete();
    $('serve-btn').classList.toggle('ready', state.plateComplete());
    renderTickets();
    renderPlate();
  }

  let last = performance.now();
  function frame(now) {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    state.update(dt);
    if (state.tickDue) {
      state.tickDue = false;
      sfx.tick();
    }
    drawGame(ctx, state);
    refreshHud();
    requestAnimationFrame(frame);
  }

  refreshHud();
  requestAnimationFrame(frame);
}

main();
