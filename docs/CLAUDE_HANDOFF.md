# Claude handoff — 神栖をまもれ！！

## Status and ownership

This is an in-progress redesign on `feat/kamisu-defense-sample`, not a released tower-defense game. The public URL remains https://tatsuya0726.github.io/kamisu-japan-journey/ and currently serves the previous journey game from `main`. Never create a replacement repository or change that URL. The previous released commit is `2e742d5a74c6959453e84fa6b9b6cba1483662c8`; the local preservation tag is `journey-v0.2-preserved`.

Codex currently owns **tower-defense rules/rendering/UI plus integration of the supplied cat comparison**. Work from a separate clone or worktree and branch from this handoff commit. Do not reset, clean, checkout over, rebase, or overwrite the active checkout or any uncommitted work. Do not modify or terminate unrelated Unity/Blender work. Open a PR against this working branch for review; do not merge or deploy automatically. A push to `main` triggers production Pages deployment.

Suggested independent Claude scope: review `tests/defense.test.ts` and propose balancing/test additions in a PR. Coordinate before editing `src/td.ts`, `src/defense.ts`, `src/sample.ts`, `src/td.css`, `sample.html`, `index.html`, or the new image directory, since Codex is actively integrating these files. Avoid parallel asset replacement. Record assumptions and validation in the PR.

## User's intended game

- Exact title: **神栖をまもれ！！**.
- Kamisu-only, child-friendly horizontal tower defense. Resource accumulates over time; spend it to deploy cats with distinct roles. Units move and attack automatically, defend the home base and defeat the invader base.
- Basic, shield, ranged, fast roles; deployment cost/cooldown; enemy waves and multiple fictional human enemy types; pause, 1×/2× speed, win/loss and retry.
- Enemies are original fictional hooligan/gang/suit-boss caricatures. No real individuals, real organizations, resident/crime claims, blood or gore.
- Inspiration concerns broad genre mechanics only. Do not copy another game's characters, UI layout, branding, music or images.
- Mobile-first readable Japanese controls, keyboard support. Planned stage expansion stays inside Kamisu.
- The latest user preference is **one sample based on a supplied cream long-haired cat**, with photo-cutout and pixel alternatives under identical viewing and motion conditions. Style choice is still undecided. Four earlier generated cats are provisional, not approved final characters.

## Implemented on this branch

- Three data-driven fictional stages: Kashima Port (Kamisu side), Tone River banks, Onohara town. Official geography: https://www.city.kamisu.ibaraki.jp/shisei/introduction/1002858.html . These are illustrative settings, not accurate maps.
- Deterministic combat simulation outside Phaser: food income/cap, four roles, costs, cooldowns, exit crowding guard, friendly spacing, target/range checks, three enemy types, timed waves, base damage, result freeze and fresh retry state.
- Phaser side-view renderer with original procedural environments/enemies and temporary generated photo-collage cats. Motion currently uses simple bob/lunge scaling of one still image, not a full animation atlas.
- DOM stage selection, Japanese HUD, four deployment cards, pause/speed, help, result and retry dialog. Touch-sized controls and responsive styles.
- Separate `kamisu.defense.progress.v1` save key containing cleared stages only. In-progress battles are not resumed. No journey save migration or deletion.
- `sample.html`: local-file photo/pixel preview with alpha-bound fitting, common baseline, identical idle/walk/attack transformations and nearest sampling for pixel mode. No image upload or storage. The actual two supplied images are not integrated yet.

## Main files

| File | Purpose |
| --- | --- |
| `src/defense.ts` | Units, stages, progress decoder, combat simulation |
| `src/td.ts` | Active Phaser scene and DOM interaction |
| `src/td.css` | Current game and comparison styling |
| `src/sample.ts`, `sample.html` | Photo/pixel sample preview |
| `index.html` | Active game shell |
| `tests/defense.test.ts` | New deterministic tests |
| `src/main.ts`, `src/systems/`, old scene/UI files | Preserved journey implementation, no longer active entry |
| `public/defense/cats.png` | Provisional original generated atlas |
| `public/THIRD_PARTY_NOTICES.txt` | Phaser/EventEmitter3 MIT notices |
| `.github/workflows/pages.yml` | Existing main-branch Pages pipeline |

## Run and validate

Use Node 24 (matching existing CI), then:

```sh
npm ci
npm test
npm run dev
# http://127.0.0.1:8137/
# http://127.0.0.1:8137/sample.html
npm run build
```

`dist/` is generated and ignored. `npm run preview` uses the same port; stop this project's dev server before starting preview, without terminating unrelated processes. Vite uses relative base paths and builds both HTML entries.

At handoff: 29 tests passed (10 defense and 19 preserved journey tests). TypeScript + Vite production build passed. Defense tests cover all three stage victories with a mixed deployment strategy, no-deployment loss, finished-state freeze, restart, duplicate spawn prevention, crowding, friendly spacing, ranged hits, resource/pause/speed timing and progress validation/separation.

Actual Chrome verification so far: title and stage selector, generated atlas, shield/ranged deployment, food growth, enemy waves, combat positions, speed control and pause. No console warning/error was captured at initial render. Full UI victory/retry and physical mobile/Safari checks are still pending; do not equate logic tests with full browser playtesting. Screenshots are local QA artifacts, excluded from Git.

## Asset status / provenance

`cats.png` is a temporary 2,035,373-byte original built-in imagegen atlas. Full prompt is in `DEFENSE-NOTES.md`. No existing game's artwork was used. Human enemies and backgrounds are authored geometry. OS fonts are referenced, not redistributed. Existing dependency notices stay included. No new blanket license has been assigned to the user's original assets/code.

The parent task has generated two alternatives from the user's supplied cat photo. The hidden body/legs were generated to make a full-body right-facing unit. Source PNG sizes reported by the parent: photo **1,737,390 bytes**, pixel **1,125,286 bytes**, both 1254×1254 with alpha. These are source sizes, NOT verified local files or optimized delivery sizes. Do not claim they are installed or measured here yet.

The formal Library-to-Windows transfer currently fails while applying extended attributes (`os.setxattr` unsupported on Windows). The local consumer must resolve this through a supported transfer path; do not strip metadata, alter the official helper, infer download URLs, or copy secrets into the repository. Private Library IDs and transfer credentials deliberately are not in this repository. Parent task has the identities.

## Next work, in order

1. Resolve supported local delivery of the two provided sample PNGs and inspect them. Preserve originals outside public assets if originals are not needed at runtime. Keep provenance locally.
2. Produce optimized runtime images at the displayed size, align opaque bounds/feet, preserve alpha, use nearest sampling for pixel art, and record actual byte counts. Add a stable asset manifest and automatic preview sources. Current sample input UI is only a receiving/testing scaffold.
3. Integrate this sample as one unit with identical stats/motion for both looks. Do not finalize all four provisional cats or choose the style on behalf of the user.
4. Browser QA: play to win/loss, replay, pause and map return; repeated clicks; collision/target order; 360/390/430 portrait and landscape; focus/hidden-tab behavior; alpha edges and tiny-screen readability. Current time-step cap may slow simulation under heavily throttled rendering, which should be assessed separately from ordinary foreground play.
5. Check save preservation, source/license inventory and secret scan. Build/test. Only after the requested sample integration and visual QA, merge the reviewed changes to `main`, wait for Pages success and verify the exact deployed assets at the SAME public URL.

No new public repository, external upload destination, paid service, credential/account change or Drive write is needed.
