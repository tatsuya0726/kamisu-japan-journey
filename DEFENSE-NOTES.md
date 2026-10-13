# 神栖をまもれ！！ — local prototype

The active Vite entry is now `src/td.ts`; independent deterministic rules live in `src/defense.ts`. The old journey implementation remains in source and in the local tag `journey-v0.2-preserved` at `2e742d5a74c6959453e84fa6b9b6cba1483662c8`.

Three fictional defense stages are based on Kamisu's geography: the Kamisu side of Kashima Port, the Tone River, and Onohara. Geographic source: https://www.city.kamisu.ibaraki.jp/shisei/introduction/1002858.html (checked 2026-10-13). This is not a factual map or a portrayal of actual crime, residents, people, or organizations.

Four provisional original generated collage cats represent basic, shield, ranged, and fast roles. Their inclusion is temporary: the user later requested one supplied cream-colored cat and a photo/pixel comparison before deciding a style. `public/defense/cats.png` is an original built-in imagegen output, not copied game art. Human enemies are original procedural graphics. Existing Phaser/EventEmitter3 notices remain in `public/THIRD_PARTY_NOTICES.txt`.

## Sample comparison

`sample.html` provides photo/pixel controls and identical idle/walk/attack transforms. It measures transparent bounds, aligns baseline and fits both subjects within 180 by 190 logical pixels. Pixel mode disables smoothing. Inputs are local only: no upload or persistence. This is a one-image transform animation, not a finished multi-frame sprite sheet.

The supplied photo and pixel assets are pending local transfer; this page currently asks the user to select the files. Their final game integration, optimized byte sizes, and actual side-by-side visual verification are not complete.

## Save separation

Defense writes only `kamisu.defense.progress.v1` and only stores completed stages. Battles restart on reload. It never reads, migrates, resets, or overwrites the journey key. Pausing, opening a modal, hiding the tab, or finishing a battle stops combat. Rendering uses elapsed time with a safety cap and deterministic simulation substeps.

## Checks

29 tests passed: 10 defense tests plus 19 existing journey tests. Defense coverage includes all three stage wins with mixed deployment, loss without deployment, post-result freeze, restart, cost/cooldown/spawn crowding, friendly spacing, ranged attack, time cap/pause/speed, malformed progress and save namespace separation. Production TypeScript/Vite build succeeds.

Browser verification so far: title, stage selection, photo atlas rendering, basic/defender deployment, resource growth, pause/speed controls. Full browser victory/retry and responsive comparison of the supplied images remain pending. No production deployment of this prototype yet. Existing public URL still serves the journey version.

## Provisional atlas prompt

Built-in imagegen: original four full-body photo-cutout cats on transparency, facing right; orange tabby with teal bandana, white shield cat, gray slingshot cat, black-and-white fast cat; photographic fur and handmade paper-collage equipment, cream cutout outlines; no text/logos/game references. Original output is preserved in `public/defense/cats.png`.
