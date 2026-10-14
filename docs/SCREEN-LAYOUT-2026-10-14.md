# Screen-layout candidate — 2026-10-14

This is a partial candidate, not the requested finished art integration. It is based on main `2834c80d605120b5f30b93b09e9c6967ff4d5e08`, with a clean worktree verified before changes. Main and the existing Pages deployment have not been updated by this task. Work is isolated on `feat/kamisu-screen-layout`.

## Implemented

- Viewport-sized battle layout with distinct rows for controls, resources, field, hint and deployment. The document is not made unscrollable by hiding overflow; content is sized to fit the tested screens.
- Separate title, operation selection, fixed-team confirmation, single-cat guide, three-page instructions, settings and result views.
- An original CSS harbor-themed title composition with teal/gold typography. It is not a reproduction of ABYSS DECK and it does not claim to show the supplied regional artwork. The approved two cats are deliberately not replaced by unrelated cats on the title.
- TV safe-area setting: 5% inset on each edge, stored separately as `kamisu.display.tv`. Browser notch/safe-area insets are respected.
- Keyboard directional focus and Enter activation in addition to existing 1–4 deployment / P pause. Standard Gamepad API directional focus, A activation and B back handling are implemented. No physical controller was connected for hardware verification.
- Existing gameplay, old journey save and assets remain intact. The four old placeholder cats remain in battle and the fixed-team guide. Claude animation files were not present or modified.

## Asset blocker — exact current status

The explicitly requested `.local-assets/packs` folder was empty at the start. No user-saved ZIP or hero image was found there.

The current official Library resolved-reference instructions were read. `prepare_materialize` resolved all six supplied IDs, with zero unavailable items, but returned signed transfers and **no workspace_path** for any item. The documented continuation is still the unmodified `library_file_transfer.py` helper with mandatory identity/xattr persistence. This is the same lower-level helper that previously failed on this Windows Python with `AttributeError: module 'os' has no attribute 'setxattr'`. Contrary to the handoff shorthand, the prior failure was in this transfer helper, not solely a list/search wrapper.

No documented Windows alternative was found. No second byte-download attempt was made into the same known failing metadata step. No metadata was removed, helper changed, guessed URL used, alternate environment used, or unrelated local folder searched. There is no pending transfer process or uncertain write. This is a compatibility blocker, not an approval denial.

The parent has now asked the user to save the six attachments into the normal Windows Downloads folder and report completion. Wait for that report before inspecting those downloaded files. The agent will validate and move/copy the exact handed-off files into this ignored project folder; the user does not need to extract or move them:

`C:\Users\god03\Documents\Codex\2026-10-13\task-2\PhaserJapan\.local-assets\packs\`

| File | Exact Library identity | Purpose |
|---|---|---|
| `cat-pixel-sample.png` | `libfile_1043ee30fa588191a0d0f97228b9bb90` | Approved cream pixel cat |
| `exec-3e3b78ac-2d08-4a29-88a1-956a3e8b7d5b.png` | `libfile_837d06677acc8191a76501a2723df0e7` | Approved second face reference; blue background needs inspection/editing |
| `kamisu-current-players-14-static.zip` | `libfile_3e94842d7a50819183b5d56bcbbaed38` | Existing player pack |
| `kamisu-current-enemies-18-static.zip` | `libfile_856d1ec128408191b706fd9bea361659` | Existing enemy pack |
| `kamisu_backgrounds_part1_of2_claude.zip` | `libfile_0b2133fece6881919fddbbb5cc98e116` | Existing backgrounds and map part 1 |
| `kamisu_backgrounds_part2_of2_claude.zip` | `libfile_27708089595c8191b17cc412a40d581c` | Existing backgrounds part 2 |

The first two PNGs are the minimum to resume hero-image inspection; all six are needed for the complete current request. User-performed local saving removes the transfer dependency but not the subsequent inspection, safe ZIP extraction, approved-image editing, runtime normalization and integration work. Do not assign Kiki/Nene names until their image correspondence is confirmed. Do not import the rejected farmer or unapproved alternative poses.

## Validation

- `npm test`: 29/29 passed.
- `npm run build`: TypeScript and production Vite build passed. Existing large Phaser chunk warning remains.
- Chrome viewport checks: 844×390, 667×375, 1920×1080 and 1280×720. Main/title/operation/team/settings controls fit; TV 5% safe-area paths checked at 1080p and 720p. Small-screen instruction-number overflow was found and corrected by increasing its line box, not hiding it.
- Exact per-screen measurements and screenshots are in local ignored `Captures/`.
- Actual gameplay in the new UI: port victory at 56 game seconds; next-operation team screen; river no-deployment defeat at 108 seconds; Enter on the retry button resets HP, resources, speed and assistance; key 1 deploys exactly one basic cat (120 to 80 food); P stops/resumes; arrow focus does not scroll the document. Both win and loss panels were measured at all four requested sizes with no document/panel overflow.
- Final TV text sizing was enlarged and rechecked at 1280×720 and 1920×1080. Standard buttons are at least 44px tall. Final 667×375 instruction pages 1–3 all pass the overflow check. Console warnings/errors captured during the UI test: none. Vite's build-time chunk warning is separate.
- Physical mobile touch, Safari, TV hardware overscan and physical gamepad operation are not verified. No full-art completion or ABYSS DECK quality equivalence is claimed.

## Run locally

```sh
npm ci
npm test
npm run build
node node_modules/vite/bin/vite.js preview --host 127.0.0.1 --port 8138 --strictPort
```

Only publish to the existing Pages URL after the supplied art has actually been integrated and verified, or after a fresh explicit instruction to publish this incomplete layout-only candidate.
