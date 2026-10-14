# Approved art integration — 2026-10-14

Official Google Drive fetch supplied authenticated file references. Downloads matched source byte counts. Ignored originals remain in .local-assets/drive-originals/; runtime copies in public/defense/approved/ preserve original bytes. No Library helper, mandatory metadata, unrelated Unity/Blender work or Claude animation assets were altered.

## Integrated images

| Runtime PNG | Drive ID | Bytes |
|---|---|---:|
| cream | 1vFVo9IYnumMw0MZoSachpQBiJIpD8eZ6 | 1125286 |
| silver | 1drKNNElY5YKwJVzpJzGoB7u5TEr3L8DM | 1308842 |
| farmer | 1SgiWCABM7g6wxx-K0hce0qvo_TJlbhRE | 1128366 |
| courier | 1A6X_nB9hEJ2YugL5xgm1ZTKTpsK9QiRH | 994020 |
| kamisu-map | 1wvUbOdWHiS6_CMj1ToBPBJc6Mwnyw2Zl | 2922212 |
| enemy0 / hoodie | 1oB2bG_qvtlfkdrTp5HI42UioCFBiEAzf | 834363 |
| enemy1 / varsity | 1P-NjqsM6kU-BPQXxnXZgtQuXeMm-fb7a | 986359 |
| enemy2 / water balloon | 1ZfCB2mk05ffvXJUKIwBobjptdG-SoZ-0 | 805304 |
| enemy3 / boss | 10qx9Wb5-JohGzmFIpRaWAWYQCZmCBQ4q | 860312 |
| town | 1QJ1YoqEdQ4Kf_K2-p1PCKQ-IV2BMsLZA | 1672019 |
| coast | 1SF7-7LCoQWQvWrrn-cyyLp_7pyR4L10k | 1501733 |
| port | 13tGfMvr2lpsQ4ohjVCnLFcMkGGrqK77i | 1593725 |
| home-base | 1fNV3BFSzBFzJEESDkkW3tf2UzcbbN6H8 | 1217684 |
| rival-base | 1BQZVZpb38a7UdhHm6P_dhFHDf6d4uld7 | 1155284 |

All 14 images were visually inspected before integration. Main cream/silver cats appear together on the title and individually in team, guide, deployment cards and battle. Labels are neutral; no Kiki/Nene assignment was guessed. Silver uses the approved-face transparent derivative supplied by the parent. The opaque blue original is retained only in ignored source storage. Fine semi-transparent edge noise remains; no redesign or code-based background removal was performed.

Two of 16 supplied companions are active: farmer v2 (correct four limbs) as ranged support and courier as fast advance. All four active cat slots use supplied standalone PNGs, with no temporary atlas rendering. The remaining 14 companions are not loaded or advertised as playable: artist, cook, lighthouse keeper, firefighter, port shield, fisher, lifeguard, drum, bell, engineer, karate, binocular scout, tea healer and watermelon shield. Expanded roles/selection remain future work.

Enemy hoodie/varsity alternate as skins of the existing basic role; water balloon uses ranged and boss uses boss. Stats, waves, economy and save schema are unchanged. Three backgrounds and two transparent bases replace procedural scenery. Images retain aspect ratio; ground aligns to unit feet, with unused sky/road cropped by the camera.

Stage 2 is now 波崎海岸 to match the coast image, retaining stage index and balance. Its brief factual description is supported by [Kamisu City's Hasaki beach page](https://www.city.kamisu.ibaraki.jp/kanko_sports/ss_facility/1002393/1002418/1002419.html), checked 2026-10-14. Art is illustrative, not an exact geographic diagram.

## Validation and limits

Production TypeScript/Vite build and all 29 automated tests pass. Chrome QA records and screenshots are stored in ignored Captures/. Target dimensions are 844×390, 667×375, 1920×1080 and 1280×720, with TV safe margins. No physical phone touchscreen, Safari, television or gamepad hardware test is claimed.

Sprites are static supplied images with existing movement/bob feedback, not new frame animations. Original PNGs total about 18.1 MB; mobile download optimization and sound remain future work. Publication retains the existing site URL and needs no new account, paid service or permission change.
