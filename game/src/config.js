// Saffron Stall — tuning, ingredients and recipes.
// Every name, dish and colour here is original to this game.

/** Canvas playfield size (the kitchen is drawn at this resolution). */
export const PLAY_W = 960;
export const PLAY_H = 540;

/** How a shift runs. */
export const TUNING = {
  shiftSeconds: 180, // a 3-minute lunch rush
  maxTickets: 4, // orders waiting on the board at once
  firstOrderAt: 2, // seconds in before the first ticket lands
  orderEvery: [14, 11, 9], // seconds between new tickets, by rush level
  patienceSeconds: 50, // how long a ticket waits before the customer walks out
  tipMax: 8, // bonus coins for serving with a full patience bar
  wrongPenalty: 2, // coins lost for adding an ingredient the dish does not need
  levelSeconds: 60, // the rush steps up every minute
};

/**
 * One ingredient. `station` is where it is prepared, `prep` is what the
 * cook must do before it can go on a plate: 'none' (grab it), 'chop' (one
 * chop at the board) or a cook time in seconds at its station.
 */
export const INGREDIENTS = {
  flatbread: { name: 'Flatbread', color: '#e8b96a', dark: '#b98a3e', shape: 'rect', station: 'counter', prep: 'none' },
  kebab: { name: 'Kebab', color: '#8a5a2b', dark: '#5d3a17', shape: 'strip', station: 'grill', prep: 4 },
  onion: { name: 'Onion', color: '#f3e5f5', dark: '#c9a6d4', shape: 'rings', station: 'board', prep: 'chop' },
  sauce: { name: 'Saffron Sauce', color: '#d94f30', dark: '#a32e18', shape: 'dollop', station: 'counter', prep: 'none' },
  noodles: { name: 'Noodles', color: '#f2c94c', dark: '#c39a1d', shape: 'strip', station: 'pot', prep: 5 },
  egg: { name: 'Egg', color: '#fff3b0', dark: '#e0b93c', shape: 'round', station: 'pot', prep: 3 },
  greens: { name: 'Greens', color: '#4caf50', dark: '#2e7d32', shape: 'leaf', station: 'board', prep: 'chop' },
  chili: { name: 'Chili', color: '#e53935', dark: '#9c1f1a', shape: 'strip', station: 'counter', prep: 'none' },
  samosa: { name: 'Samosa', color: '#d68910', dark: '#9c5f06', shape: 'wedge', station: 'fryer', prep: 4 },
  chutney: { name: 'Chutney', color: '#2e7d32', dark: '#1b4d1f', shape: 'dollop', station: 'counter', prep: 'none' },
  rice: { name: 'Rice', color: '#fff8e1', dark: '#d8c690', shape: 'bowl', station: 'pot', prep: 4 },
  chicken: { name: 'Chicken', color: '#c97b2d', dark: '#8f5416', shape: 'round', station: 'grill', prep: 5 },
};

/** A dish: its ingredients in the order they are usually added. */
export const RECIPES = [
  { id: 'kebab-wrap', name: 'Saffron Kebab Wrap', short: 'Kebab Wrap', base: 'wrap', price: 12, color: '#d94f30', ingredients: ['flatbread', 'kebab', 'onion', 'sauce'] },
  { id: 'noodle-bowl', name: 'Golden Noodle Bowl', short: 'Noodle Bowl', base: 'bowl', price: 14, color: '#f2c94c', ingredients: ['noodles', 'egg', 'greens', 'chili'] },
  { id: 'samosa-plate', name: 'Crispy Samosa Plate', short: 'Samosa Plate', base: 'plate', price: 10, color: '#d68910', ingredients: ['samosa', 'chutney', 'greens'] },
  { id: 'chicken-rice', name: 'Ember Chicken Rice', short: 'Chicken Rice', base: 'bowl', price: 15, color: '#c97b2d', ingredients: ['rice', 'chicken', 'onion', 'chili'] },
];

/** Where each station sits on the canvas (x, y, w, h). */
export const STATIONS = [
  { id: 'grill', name: 'Grill', x: 30, y: 300, w: 200, h: 118, color: '#5d4037' },
  { id: 'board', name: 'Chopping Board', x: 260, y: 300, w: 200, h: 118, color: '#795548' },
  { id: 'pot', name: 'Pot', x: 490, y: 300, w: 200, h: 118, color: '#37474f' },
  { id: 'fryer', name: 'Fryer', x: 720, y: 300, w: 210, h: 118, color: '#4e342e' },
];

/** The counter where ready ingredients wait, and the serving plate. */
export const COUNTER = { x: 30, y: 150, w: 900, h: 120 };
export const PLATE = { x: 330, y: 430, w: 300, h: 95 };

/** A dish's base, drawn under its ingredients on the plate. */
export const BASE_COLORS = { wrap: '#e8b96a', bowl: '#eceff1', plate: '#fafafa' };
