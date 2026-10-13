# 神栖を守れ！！ — playable prototype

This report supersedes the older handoff's release status. The existing Pages URL is retained: https://tatsuya0726.github.io/kamisu-japan-journey/ . The candidate branch is `feat/kamisu-playable-candidate`, based on `ae19af1`. Publication to the existing `main`/Pages target was subsequently authorized by the user. The old journey remains in Git history and tag `journey-v0.2-preserved`.

## What is playable

- Three Kamisu stages: Kashima Port (Kamisu side), Tone River, Onohara. Four provisional original cats with basic, shield, ranged and fast roles; three original fictional human invader types.
- Automatic income, cost/cooldown, deployment, forward movement, range-based combat, base HP, waves, win/loss, retry, next stage, pause and 1x/2x speed.
- Optional `おまかせ` deployment assistance, off by default and reset for each battle. It deploys the same paid/cooldown-limited units in a mixed sequence; it grants no extra resources. Manual deployments remain possible.
- Role guide in `ねこ図鑑`, reachable through the stage map even in compact landscape layout.
- Landscape layout keeps the field, HUD and all deployment buttons on screen. The camera crops unused sky instead of squeezing the characters. Portrait keeps large two-column deployment buttons. Nonessential motion respects reduced-motion preference.
- Clear-state persistence only under `kamisu.defense.progress.v1`; in-progress battles restart on reload. The old journey save is untouched.

## Important asset limitation

**The newly supplied 14-player, 18-enemy and two background ZIPs are NOT integrated.** The currently visible cats are the existing four-character generated prototype atlas, not those 14 approved units. Enemy/environment drawings are the existing original placeholders. The interface labels these as provisional. No batch generation was restarted. No farmer asset, including the rejected six-legged version, was imported. No unapproved blue-background pose pack was used.

All four provided ZIP references resolved successfully through the current official Library materialization operation. It returned signed transfers rather than local files. The first ZIP (`kamisu-current-players-14-static.zip`, reported 13,521,366 bytes) was attempted once using a fresh unmodified official helper. It failed in `LibraryFileTransfer.apply_xattrs` because Windows Python lacks `os.setxattr` (`AttributeError`). The destination ZIP was checked and did not exist afterward. This is a confirmed helper compatibility failure, **not an approval denial and not an uncertain installation**. Remaining ZIP downloads were not executed, since the same required metadata step would fail. No metadata stripping, guessed URL, alternate uploader or helper modification was used.

Pending files for a user-performed local handoff, relative to repository root (Git-ignored):

```text
.local-assets/packs/
  kamisu-current-players-14-static.zip
  kamisu-current-enemies-18-static.zip
  kamisu_backgrounds_part1_of2_claude.zip
  kamisu_backgrounds_part2_of2_claude.zip
```

After explicit local handoff, inspect ZIP entries before extraction (reject absolute/traversal paths), preserve originals, inspect actual images and pack notes, select only the corrected farmer, then normalize transparent bounds/baselines and create runtime-sized assets. Do not invent image names or claim the images have been inspected. Full source packs must not automatically be copied into `public/`.

## Claude integration boundary

At the initial fetch, remote branches contained only the previous `main` release and `feat/kamisu-defense-sample`; no PRs or newer animation commits were present. No Claude animation was found in this repository, overwritten or replaced. The active renderer still uses still-image placeholders. `src/defense-assets.ts` centralizes their URL/frame mapping. A future animation adapter must reference Claude's supplied sheets/manifests without replacing their originals. Coordinate ownership before parallel edits to `src/td.ts`, `src/defense.ts` or the asset manifest.

## Reproduction

Node 24, from repository root:

```sh
npm ci
npm test
npm run build
npm run dev
```

Dev defaults to http://127.0.0.1:8137/ . To run the production build on a separate port without disturbing an existing server:

```sh
node node_modules/vite/bin/vite.js preview --host 127.0.0.1 --port 8138 --strictPort
```

Use `1`–`4` or click/tap a card to deploy; `P` pauses. Battles begin from the stage selector. For a simple demonstration, choose the port, enable `おまかせ`, and set speed to 2x. `sample.html` remains a local-file receiving scaffold; supplied photo/pixel comparison assets are still absent.

## Verified locally

- All 29 existing logic tests passed; all three stages are winnable under the tested mixed-deployment strategy. No-deployment loss, result freeze, restart, cost/cooldown/crowding, friendly spacing, ranged attacks, pause/speed, and save-key separation are covered.
- TypeScript and production Vite build succeeded. Vite reports the expected large Phaser chunk warning; this is not a build failure.
- Chrome production-build UI: port victory at 56 game seconds with one manual initial deployment plus assistance; next-stage transition; no-deployment river loss at 107 seconds; double-click retry resets HP, wave count and assistance; saved clear mark survives reload.
- Pause holds food/time and disables deployment. Double-click deployment charges once; double-click speed changes once. Catalog shows all four roles. All three stages have been entered through the actual UI. Onohara also finished in victory at 131 game seconds with assistance, defeating all 12 invaders.
- 844x390 landscape: full 4-card bar visible, cards 74px tall, no horizontal/vertical page overflow. 390x844 portrait: 112px-tall cards, scroll width equals viewport width. The 360px layout has an additional compact header and non-wrapping HP text. These are desktop Chrome viewport checks and mouse interaction, **not physical touch-device testing**.

Remaining: integration/inspection of supplied ZIP assets; real iOS/Android touch and Safari; Claude animation integration; audio; broader difficulty/performance testing. Do not describe this prototype as the completed 14-character pixel-art game.
