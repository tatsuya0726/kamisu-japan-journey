# Additional missions: local implementation checkpoint

42 missions, six at each of the seven existing landmark coordinates, are implemented in the Phaser build. Original three defense stages, 21 local conversations, ten companions, and old progress remain available.

## Play

Title → 作戦をはじめる → まち歩き地図へ → landmark → one of six missions → この作戦に出撃. The same place also retains キキとネネの小話を読む. Missions support manual card deployment, number keys, pause, speed, camera controls, and the existing assist option.

Objectives include surviving a specified time, settling a specified number of an enemy, clearing scheduled waves, and returning a giant sardine boss to the sea. Boss supporters spawn once at designed health thresholds. Result dialogue, retry, return to the place, and a unique clear stamp are connected. The separate `kamisu.missions.progress.v1` record does not alter the original save namespace.

## Data and implementation

- `src/data/mission-pack.json` preserves the supplied design and its original proposed status fields. It is source design, not a runtime completion report.
- `scripts/assemble-missions.mjs` regenerates that source using `mission-pack-source.mjs`.
- `src/missions.ts` attaches schedules, objective rules, difficulty economy, and boss supporter rules.
- `src/extra-enemies.ts` and `src/defense.ts` implement twelve roles: knockback scout, swarm, slowing fish, burst runners, large ranged boss, nearby speed support, flying speed cycle, rolling tank, wave support, sleeping blocker, rider, and temporarily armored robot.
- Enemy damage represents energy/いたずらパワー. Defeat fades the character away; no injury or death effect is used.

## Verification

`npm test`: 96 passed. Includes every mission's mixed-deployment victory, no-deployment defeat, pause, stopped simulation after the result, fresh retry, valid schedules and enemy references, boss supporter thresholds, save filtering and duplicate reward prevention, plus the original regression tests.

`node --experimental-strip-types scripts/balance-missions.ts`: 42 mixed-deployment wins, zero idle wins. Detailed deterministic results are in ignored `Captures/mission-balance.json`. This is automated simulation, not 42 manual browser playthroughs.

`npm run build`: passes. Main bundle is approximately 1.61 MB / 376 KB gzip; Vite retains its existing large-chunk advisory. No new enemy image payload is loaded at startup.

Chrome UI checked: landmark selection, six mission buttons, introduction portraits, correct survival objective, ten companion cards, assist, speed, victory at 45 seconds, clear stamp 1/42, and retry into the same mission. Screenshot: `Captures/mission-win.png`.

## Pending

The twelve enemy illustrations have now been received and integrated. See `ENEMY-ART-INTEGRATION.md` for sizes, loading behavior, and validation evidence. Named temporary shapes remain only as an image-load failure fallback.

Publishing is blocked by automatic approval review. The one requested retry of `git -c safe.directory=C:/Users/god03/Documents/Codex/2026-10-13/task-2/PhaserJapan -c 'credential.helper=!gh auth git-credential' push origin 2c90bfa:main` was rejected because the review could not reliably connect approval with this exact public main-branch push. No alternative publishing route was attempted. The map commit and this mission work remain local.
