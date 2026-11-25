// Saffron Stall — the game state: tickets, the plate, cooking, scoring.
// The kitchen is one screen: pick a ticket, work its recipe through the
// stations, plate it and serve it before its patience runs out.

import { INGREDIENTS, RECIPES, TUNING } from './config.js';
import { mulberry32, pick } from './rng.js';

let ticketUid = 1;

/** One order ticket on the board. */
export function makeTicket(recipe, patience, maxPatience = patience) {
  return { uid: ticketUid++, recipe, patience, maxPatience };
}

export class GameState {
  constructor(seed = 1) {
    this.seed = seed;
    this.rand = mulberry32(seed);
    this.mode = 'title'; // 'title' | 'playing' | 'over'
    this.frozen = false; // a screenshot preset holds the frame still
    this.timeLeft = TUNING.shiftSeconds;
    this.elapsed = 0;
    this.score = 0;
    this.served = 0;
    this.walkouts = 0;
    this.streak = 0; // consecutive serves without a walkout
    this.bestStreak = 0;
    this.level = 1;
    this.tickets = [];
    this.activeTicket = 0;
    this.plate = { recipeId: null, added: [] };
    this.cooking = {}; // stationId -> { ingredient, progress, total }
    this.chopped = new Set(); // ingredients chopped and ready
    this.ready = new Set(); // cooked ingredients waiting on the counter
    this.floats = []; // score popups { x, y, text, life, color }
    this.shakeUntil = 0; // ms timestamp: the plate shakes after a wrong add
    this.nextOrderIn = TUNING.firstOrderAt;
    this.lastTickSecond = -1;
    this.log = [];
  }

  /** The ticket the cook is working on, or null. */
  get active() {
    return this.tickets[this.activeTicket] ?? null;
  }

  /** The active ticket's recipe. */
  get activeRecipe() {
    const t = this.active;
    return t ? RECIPES.find((r) => r.id === t.recipe) : null;
  }

  /** Rush level from elapsed time: a new ticket sooner as the shift heats up. */
  rushLevel() {
    return Math.min(3, 1 + Math.floor(this.elapsed / TUNING.levelSeconds));
  }

  start() {
    this.mode = 'playing';
    this.timeLeft = TUNING.shiftSeconds;
    this.elapsed = 0;
    this.score = 0;
    this.served = 0;
    this.walkouts = 0;
    this.streak = 0;
    this.bestStreak = 0;
    this.level = 1;
    this.tickets = [];
    this.activeTicket = 0;
    this.plate = { recipeId: null, added: [] };
    this.cooking = {};
    this.chopped = new Set();
    this.ready = new Set();
    this.floats = [];
    this.nextOrderIn = TUNING.firstOrderAt;
    this.spawnTicket();
  }

  spawnTicket(recipeId = null) {
    if (this.tickets.length >= TUNING.maxTickets) return;
    const recipe = recipeId ?? pick(this.rand, RECIPES).id;
    this.tickets.push(makeTicket(recipe, TUNING.patienceSeconds));
    if (this.plate.recipeId === null && this.tickets.length === 1) this.syncPlateToActive();
  }

  /** The plate follows the active ticket: a new ticket means a fresh plate. */
  syncPlateToActive() {
    const recipe = this.activeRecipe;
    this.plate = { recipeId: recipe ? recipe.id : null, added: [] };
  }

  selectTicket(index) {
    if (index < 0 || index >= this.tickets.length) return;
    this.activeTicket = index;
    this.syncPlateToActive();
  }

  /** Is this ingredient already on the plate? */
  onPlate(id) {
    return this.plate.added.includes(id);
  }

  /** Can this ingredient be added to the plate right now? */
  canAdd(id) {
    const recipe = this.activeRecipe;
    if (!recipe || !recipe.ingredients.includes(id) || this.onPlate(id)) return false;
    const ing = INGREDIENTS[id];
    if (ing.prep === 'chop') return this.chopped.has(id);
    if (typeof ing.prep === 'number') return this.ready.has(id);
    return true;
  }

  /**
   * Click an ingredient pile. Returns what happened so the UI can answer:
   * 'added' | 'chopped' | 'cooking' | 'cooking-done' | 'busy' | 'wrong' |
   * 'already' | 'no-ticket'.
   */
  clickIngredient(id) {
    const recipe = this.activeRecipe;
    if (!recipe) return 'no-ticket';
    const ing = INGREDIENTS[id];
    if (!recipe.ingredients.includes(id)) {
      this.wrongAdd(id);
      return 'wrong';
    }
    if (this.onPlate(id)) return 'already';
    if (ing.prep === 'chop') {
      if (!this.chopped.has(id)) {
        this.chopped.add(id);
        return 'chopped';
      }
      return this.addToPlate(id);
    }
    if (typeof ing.prep === 'number') {
      if (this.ready.has(id)) return this.addToPlate(id);
      const station = ing.station;
      const slot = this.cooking[station];
      if (slot) return slot.ingredient === id ? 'cooking' : 'busy';
      this.cooking[station] = { ingredient: id, progress: 0, total: ing.prep };
      return 'cooking';
    }
    return this.addToPlate(id);
  }

  addToPlate(id) {
    this.plate.added.push(id);
    return 'added';
  }

  wrongAdd(id) {
    this.score = Math.max(0, this.score - TUNING.wrongPenalty);
    this.shakeUntil = performance.now() + 250;
    this.floats.push({ x: 480, y: 470, text: `-${TUNING.wrongPenalty} wrong ingredient`, life: 1, color: '#e53935' });
  }

  /** Is the plate complete for the active ticket? */
  plateComplete() {
    const recipe = this.activeRecipe;
    return !!recipe && recipe.ingredients.every((id) => this.onPlate(id));
  }

  /** Serve the finished plate to the active ticket's customer. */
  serve() {
    const ticket = this.active;
    const recipe = this.activeRecipe;
    if (!ticket || !recipe || !this.plateComplete()) return false;
    const patienceFrac = Math.max(0, ticket.patience / ticket.maxPatience);
    const tip = Math.round(TUNING.tipMax * patienceFrac);
    const comboBonus = this.streak >= 2 ? 2 : 0;
    // A serve at 25% patience or less is a clutch save: +5 coins on top.
    const clutchBonus = patienceFrac <= 0.25 ? 5 : 0;
    const earned = recipe.price + tip + comboBonus + clutchBonus;
    this.score += earned;
    this.served++;
    this.streak++;
    this.bestStreak = Math.max(this.bestStreak, this.streak);
    this.floats.push({ x: 480, y: 440, text: `+${earned} served ${recipe.short}`, life: 1.4, color: '#2e7d32' });
    if (clutchBonus > 0) this.floats.push({ x: 480, y: 410, text: 'CLUTCH +5!', life: 1.4, color: '#d94f30' });
    this.tickets.splice(this.activeTicket, 1);
    if (this.activeTicket >= this.tickets.length) this.activeTicket = Math.max(0, this.tickets.length - 1);
    this.syncPlateToActive();
    return true;
  }

  clearPlate() {
    this.plate.added = [];
  }

  update(dt) {
    if (this.mode !== 'playing' || this.frozen) return;
    this.elapsed += dt;
    this.timeLeft = Math.max(0, this.timeLeft - dt);
    this.level = this.rushLevel();

    const second = Math.ceil(this.timeLeft);
    if (second !== this.lastTickSecond) {
      this.lastTickSecond = second;
      if (second <= 30 && second > 0) this.tickDue = true;
    }

    // New tickets on a schedule that quickens with the rush.
    this.nextOrderIn -= dt;
    if (this.nextOrderIn <= 0) {
      this.spawnTicket();
      this.nextOrderIn = TUNING.orderEvery[this.level - 1];
    }

    // Cooking progresses at its station.
    for (const station of Object.keys(this.cooking)) {
      const slot = this.cooking[station];
      slot.progress += dt;
      if (slot.progress >= slot.total) {
        this.ready.add(slot.ingredient);
        delete this.cooking[station];
      }
    }

    // Patience drains; a ticket at zero walks out and breaks the streak.
    for (let i = this.tickets.length - 1; i >= 0; i--) {
      const t = this.tickets[i];
      t.patience -= dt;
      if (t.patience <= 0) {
        this.tickets.splice(i, 1);
        this.walkouts++;
        this.streak = 0;
        this.floats.push({ x: 480, y: 420, text: 'a customer walked out', life: 1.4, color: '#e53935' });
        if (this.activeTicket >= this.tickets.length) this.activeTicket = Math.max(0, this.tickets.length - 1);
        this.syncPlateToActive();
      }
    }

    for (let i = this.floats.length - 1; i >= 0; i--) {
      this.floats[i].life -= dt;
      this.floats[i].y -= 22 * dt;
      if (this.floats[i].life <= 0) this.floats.splice(i, 1);
    }

    if (this.timeLeft <= 0) {
      this.mode = 'over';
    }
  }

  // ---------------------------------------------------------- screenshot presets
  // Deterministic frames for the entry's screenshots: the same seed always
  // shows the same kitchen, so a screenshot is a real render of this code.

  applyShot(name, seed = 1) {
    this.rand = mulberry32(seed);
    this.mode = 'playing';
    this.frozen = true;
    this.floats = [];
    this.cooking = {};
    this.chopped = new Set();
    this.ready = new Set();
    const setPlate = (recipeId, added) => {
      this.plate = { recipeId, added: [...added] };
    };
    if (name === 'start') {
      this.timeLeft = 180;
      this.elapsed = 0;
      this.score = 0;
      this.served = 0;
      this.streak = 0;
      this.tickets = [makeTicket('kebab-wrap', 50, 50)];
      this.activeTicket = 0;
      setPlate('kebab-wrap', []);
      this.chopped.add('onion');
    } else if (name === 'play') {
      this.timeLeft = 134;
      this.elapsed = 46;
      this.score = 38;
      this.served = 3;
      this.streak = 2;
      this.tickets = [makeTicket('kebab-wrap', 31, 50), makeTicket('noodle-bowl', 44, 50), makeTicket('samosa-plate', 47, 50)];
      this.activeTicket = 0;
      setPlate('kebab-wrap', ['flatbread', 'kebab']);
      this.chopped.add('onion');
      this.cooking.grill = { ingredient: 'chicken', progress: 3.1, total: 5 };
    } else if (name === 'serve') {
      this.timeLeft = 92;
      this.elapsed = 88;
      this.score = 71;
      this.served = 6;
      this.streak = 3;
      this.tickets = [makeTicket('chicken-rice', 28, 50), makeTicket('noodle-bowl', 41, 50)];
      this.activeTicket = 0;
      setPlate('chicken-rice', ['rice', 'chicken', 'onion', 'chili']);
      this.chopped.add('onion');
      this.ready.add('chicken');
    } else if (name === 'rush') {
      this.timeLeft = 23;
      this.elapsed = 157;
      this.score = 118;
      this.served = 9;
      this.streak = 4;
      this.tickets = [
        makeTicket('noodle-bowl', 9, 50),
        makeTicket('kebab-wrap', 22, 50),
        makeTicket('chicken-rice', 36, 50),
        makeTicket('samosa-plate', 48, 50),
      ];
      this.activeTicket = 0;
      setPlate('noodle-bowl', ['noodles', 'egg']);
      this.chopped.add('greens');
      this.cooking.pot = { ingredient: 'noodles', progress: 4.1, total: 5 };
    } else {
      this.start();
    }
    this.level = this.rushLevel();
  }
}
