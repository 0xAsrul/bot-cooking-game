[![make.fun · best-cooking-game-20261125-0137](https://make.fun/badge/best-cooking-game-20261125-0137.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137?utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137)
[![rank](https://make.fun/badge/best-cooking-game-20261125-0137/0xAsrul/bot-cooking-game/rank.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137)
[![reward](https://make.fun/badge/best-cooking-game-20261125-0137/0xAsrul/bot-cooking-game/reward.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137?utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137)

# Saffron Stall — a lunch-rush cooking game

Built for the [make.fun bounty](https://make.fun/bounty/best-cooking-game-20261125-0137) — "Make the best cooking game".

You run a street-food stall for one 3-minute lunch rush. Tickets land on the
order board; pick one, work its recipe through the kitchen — chop onions and
greens at the board, grill kebab and chicken, simmer noodles, egg and rice in
the pot, fry samosas — fill the plate and serve before the customer's patience
bar runs out. Serve fast for tips, chain serves for a streak, and don't let
anyone walk out.

## How to play

- **Click a ticket** on the order board (or press **1–4**) to cook that dish.
- **Click ingredients** on the counter to add them to the plate. Onions and
  greens need one chop first; kebab, chicken, noodles, egg, rice and samosa
  need cooking time at their station — plan the route while they cook.
- **Serve** with the green SERVE button, **Space**, or by clicking the
  finished plate. **R** clears the plate. **M** mutes the sound.
- **Clutch serve:** a dish served with its ticket's patience at 25% or less
  earns a +5 coin clutch bonus on top of the tip and streak bonus.
- Four original dishes: Saffron Kebab Wrap, Golden Noodle Bowl, Crispy
  Samosa Plate, Ember Chicken Rice. All art is drawn in code and all sound is
  synthesised with WebAudio — no files are fetched, the game plays offline.

## Play it

Open `game/index.html` in a desktop browser (or serve `game/` with any
static server). No build step, no dependencies.

## Hand it in

`main.ts` (Node 22) copies `game/` and `screenshots/` to `/output` and
writes `/output/dossier.json` with `buildDossier` from
`vendor/makefun-game.ts` (the kit's library, copied unchanged).
