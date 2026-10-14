# Map and companions update

The operation map uses round mission points with selected, uncleared and cleared states. Mission details retain the map and allow choosing another point, closing, or launching. Existing defense clear records retain their namespace and format.

Town walks use public facility coordinates on attributed live GSI pale tiles (north up). Events are fictional cat errands, not actual facility events. Backgrounds are artistic interpretations of exterior references, not accurate facility plans. Visits are session-only flavor events and give no currency.

| Place | Latitude | Longitude | Official source |
|---|---|---|---|
| 息栖神社 | 35.8858061 | 140.6251283 | https://www.city.kamisu.ibaraki.jp/kanko_sports/culture/1002532/1002533.html |
| 石神幼稚園 | 35.869098740645775 | 140.65128878125168 | https://www.city.kamisu.ibaraki.jp/shisei/p_facility/1002954/1003005.html |
| 軽野小学校 | 35.87191364533871 | 140.66741874413407 | https://www.city.kamisu.ibaraki.jp/kodomo/shotyuko/1001689/1001691.html |

GSI attribution and tile conditions: https://maps.gsi.go.jp/development/ichiran.html . Tiles require internet access. Facility coordinates came from the linked official municipal map links, supplied and checked by the parent research task. The unconfirmed phrase “5-1K” has not been identified or added.

The cream cat is キキ; the silver cat is ネネ. Friendly units can overlap and pass each other, stopping at their own attack range. Damage is applied once per attack with an individual cooldown. Enemies and bases cannot be passed. The friendly population cap remains 24.

Four additional variants appear in an independently draggable horizontal card strip: 木剣キキ, おさかなキキ, 翼ネネ, ガードネネ. Keyboard 1–8 deploys a cat; Q advances the strip. Names remain in accessible labels, hover descriptions and the cat guide. Cards show the portrait, cost and cooldown. Winged Nene has longer range and a raised visual position, but is not immune to enemy attacks. Art remains static with limited bob/attack feedback, not full frame animation.

Background source files supplied through the authorized Drive folder:
- ikisu-shrine-real-reference-v1.png — 2642947 bytes — Drive `1es9rKCNj9L6V4_jCrg2LGwy0R4CGcY31`
- ishigami-kindergarten-real-reference-v1.png — 2321863 bytes — Drive `1SLEMnMBCdr8OYG4Pe6gMambAwFDju8oe`
- karuno-elementary-real-reference-v1.png — 2232605 bytes — Drive `1jfv1awE7Ebx4Obztg4c1EkNc25W0YabG`

All three originals are copied byte-for-byte to their runtime filenames.

The battlefield is 1600 world units wide. Larger cats use smooth texture sampling. HP numbers and meters are fixed to the battlefield viewport. Drag the battlefield, use A/D, or select arrow/home/enemy buttons to move the camera. Home/End goes to either base. Card drags use a separate pointer handler, an 8px movement threshold, pointer capture and a 350ms post-drag click guard. Neither drag changes page scroll.

Additional official places: 1000人画廊 (35.8950169,140.7264673), 神栖中央公園 (35.89783004245183,140.65003), かみす防災アリーナ (35.8988744,140.6499851), 港公園 (35.91397755742545,140.67161455102993). Official links are included in each event and in src/local-walk.ts. The arena and park have separate callout buttons while their coordinate marks remain in place. No observation-tower entry event is offered.
## Validation

- 37 automated tests passed, including all three stages winnable, eight simultaneous attackers, per-cat cooldown/cost, population cap, target death, own-range stopping at the enemy base, audio preferences and a single music scheduler.
- TypeScript and Vite production build passed. Vite retains its existing large-bundle advisory (Phaser runtime).
- Chrome viewport checks at 667×375, 844×390, 1280×720 and 1920×1080 found no document scroll and no out-of-screen battle controls. Controls are at least 44px in each direction; TV safe margins were enabled.
- Seven place buttons, fictional event completion and return to map were exercised. The three defense points support selection, repeated tap, closing, changing another point and launching. Existing cleared records remained readable.
- In active play, dragging cards changed strip scroll to 113.6px while the camera stayed at 0 and no deployment message appeared. Dragging the battlefield moved the camera to 34.4% while card scroll stayed 113.6px. “町へ” returned the camera to 0. Large guard deployment was verified through normal food accumulation.
- The expanded battlefield completed a browser win in 67 seconds of game time, then opened the next mission detail and returned to the map. No browser error/warning logs were recorded during that check.
- All 11 new supplied images match their runtime copies byte-for-byte; see [asset hashes](map-asset-checks.json).

Physical touch hardware and a physical gamepad were not available for this check. Drag testing used Chrome pointer input at mobile landscape viewport sizes; controller support uses the existing standard-mapping focus navigation.
- Expanded-field browser loss occurred at 129 seconds without deploying; retry restored HP650/food120/wave0 and returned to the map normally.

## Original audio

No existing audio files were present. `src/game-audio.ts` creates an original 4-second, 16-note electronic loop with bass notes and original oscillator effects for deployment, attacks, base damage, victory and defeat. No third-party recordings, samples, external music services, purchases or accounts are used. The score and synthesis implementation were written for this project and can be shipped with this game; there is no imported music license or attribution requirement.

Web Audio initializes on the first pointer/key gesture. One scheduler serves the BGM; pause, menus, results and tab hiding stop it, and hidden tabs also suspend the audio context. The victory/defeat effect can finish on the result screen. BGM and SE levels plus master mute save in `kamisu.audio.v1`, independently of game progress. Browser checks confirmed 16% BGM/29% SE and mute survived reload; test settings were restored to defaults afterward. Playback/paused state and browser logs were checked; physical speaker output has not been independently auditioned.
## Offline story expansion

Each of the seven town-walk locations now has three fictional cat stories (the existing story plus two new stories): 21 total. Completing a story enables “もうひとつのお話”; returning to a place also selects another story. Selection occurs once on entry, so rerendering or completing an action does not reroll the current story. Completion remains idempotent and awards no currency or combat advantage.

Kiki and Nene have 11 short exchanges: four deployment lines, four victory lines and three retry/loss lines. Deployment dialogue uses the existing non-blocking message row. Result dialogue uses the existing result screen. Combat timers, controls, win/loss rules and rewards remain unchanged.

Each deck excludes its previous index. The index persists locally under `kamisu.stories.last.v1`, so a page reload does not immediately repeat the last entry when storage is available. All content is bundled text, with no OAuth, AI model, paid API, new server or external dialogue transmission. Stories explicitly describe fictional cats; no real staff, pupils or incidents are invented. Port Park stories stay on the ground and never invite entry into the observation tower.

Validation: 40 tests passed and the production build passed. Chrome at 667×375 showed four consecutive visits without adjacent duplicates and no scroll/clipped buttons. Reload changed the last “葉っぱのしおり” to “小さな休憩便”. Deployment dialogue appeared with the modal closed and combat controls still available.
## Ten-cat roster

Two existing supplied companions were added without image generation or source-image edits:

| Cat | Cost | Range | Deployment cooldown | Attack interval | HP | Source |
|---|---:|---:|---:|---:|---:|---|
| 絵描き猫 | 130 | 225 | 9s | 2.1s | 90 | `kamisu-player-artist-cat-static-v2.png`, Drive `1_2u2ZeAh4zezJIMmGrakn3zalGiwuE27` |
| 空手猫 | 85 | 34 | 4.5s | 0.45s | 165 | `kamisu-player-karate-cat-static-v1.png`, Drive `1fMbNn488gbH0_i-cOz5Gx161UhV34KDA` |

Artist has the longest range with a slower attack; karate trades short range for quick attacks. Artist's transparent source margins are accounted for with runtime scale/origin and card display scale. All ten cards use the existing independent horizontal strip. Keyboard 1–9 and 0 deploys slots 1–10. Existing cooldowns, cap24, overlap, base targeting and saves are unchanged. The 40 tests pass with all ten roles included in stacked damage, cost and base-range checks.
