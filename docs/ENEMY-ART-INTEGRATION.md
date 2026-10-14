# Twelve enemy illustrations integrated locally

All twelve static RGBA PNGs were downloaded through the official Google Drive connector. Each original SHA-256 was verified against the provided manifest before processing. Originals remain in ignored `.local-assets/enemies`; only lightweight derivatives ship in `public/defense/runtime/extra-*.png`.

## Image handling

`scripts/prepare-enemy-art.ps1` crops almost invisible outer alpha noise (alpha <= 8), retains a four-pixel transparent guard, and downsizes to a maximum 256 pixels (boss 384). Source art faces left and is not flipped. These are individual static poses, not animation strips. Existing small movement bob, attack pulse, and peaceful fade-away remain in use. Flying types have a 16-world-unit lift; ground types anchor their cropped bottom at the shared ground baseline.

Runtime total: **1,135,491 bytes** versus **10,536,270 bytes** of source PNGs, an **89.2% reduction**. Source/checksum, crop, dimension, byte count, and foot-anchor records are in `src/data/enemy-art.json`. Render caps vary by role from 70 to 100 world units wide, with the boss capped at 180. Aspect ratios are preserved.

Combat remains the existing point/range simulation. Transparent image rectangles are not colliders. Every new enemy was tested immediately inside and outside its actual attack range; scaling does not enlarge or shrink that range. This prevents source PNG margins from changing balance.

## Loading and verification

- Original startup remains interactive while images load. Local no-cache request log: 29 requests / 5,526,696 response body bytes, **zero new enemy image requests** before departure. This is local byte evidence, not a broadband timing benchmark.
- Mission art uses the scheduled enemy set plus boss reinforcements. The harbor boss fetched exactly four enemy PNGs: spring mullet, giant sardine, wave pukkun, crab drummer; **438,366 bytes** combined. Loaded textures are reused.
- All twelve PNGs decoded successfully and were visually inspected in Chrome for transparency, left-facing pose, relative size and baseline. The local inspection sheet is not part of the source build configuration.
- Real harbor boss gameplay showed the new fish and boss, completed successfully at 41 simulated seconds with assist, and preserved the separate mission clear record. Browser reported no JavaScript errors.
- 98-test full suite passed after integration, followed by the added attack-boundary test passing (99 total test cases now). TypeScript and production build passed. Main JS: 1,611,000 bytes approximately / 377.76 KB gzip; the existing Vite chunk-size advisory remains.

Evidence: `Captures/enemy-art-browser.png`, `enemy-art-battle.png`, `enemy-art-boss-win.png`, `enemy-art-startup.jsonl`, `enemy-art-requests.jsonl`.

Publishing was not attempted during this integration. Await the parent's fresh publication authorization and approval-review resolution before pushing.

Remaining verification limit: the browser viewport override did not apply during this integration (requested 844×390, observed 2048×927), so the new images' mobile viewport check was not completed. The preceding mission UI was checked at 844×390 before the art replacement. Physical touch-device testing remains unperformed.
