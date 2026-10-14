# Battle screen layout

The user supplied a Battle Cats battle screenshot. The parent task inspected it and described the layout: full-screen scenery, a small upper-left pause/stage label, upper-right resources, a lower-center five-by-two card grid, and two large corner controls. This implementation uses that composition with our existing original assets and gameplay.

## Changes

- The battlefield fills the game frame; large header and opaque footer panels are removed from battle.
- Ten companions occupy five columns and two rows. Costs and cyan cooldown strips remain visible. Additional groups of ten, or very narrow screens, scroll within the card region.
- The two corner controls perform the existing auto-deploy and map actions. No wallet upgrade or special attack was added.
- Both base HP meters remain visible when the camera moves. Food displays the actual capacity of 400.
- Unit feet sit near 66% of the frame, with a short-screen limit above the cards. Existing camera buttons and independent drag handlers remain.
- Tap-to-start, image timeouts/fallbacks, lazy artwork, dialogue expressions, save keys, battle rules and economy are unchanged.

## Validation

- Production TypeScript/Vite build succeeded; all 47 existing tests passed.
- Chrome viewport checks: 667x375, 844x390, 1280x720, and 1920x1080 with TV safe margins; standard 1920x1080 and 480x320 also checked.
- All ten portraits loaded and all ten cards fit the two rows at the four main sizes. No page overflow was measured. Main buttons meet a 44px minimum target.
- At 480x320, dragging cards moved their horizontal offset from 0 to 53.6px while field position stayed at 0. Dragging the field changed its position to 11.18% while card offset stayed at 53.6px. Dragging an affordable card back did not deploy it.
- Port, coast and town stages each launched and accepted deployment. Pause/resume and map buttons worked; both HP meters stayed visible when jumping to the enemy base.
- Local screenshots and measured DOM rectangles are in the ignored Captures/battle-layout-* files. Browser viewport emulation was used; physical phone and TV hardware were not tested in this change.

The existing Phaser bundle size warning remains. No new dependencies or artwork downloads were introduced.
