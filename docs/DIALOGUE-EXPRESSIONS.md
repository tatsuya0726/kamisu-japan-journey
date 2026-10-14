# Kiki / Nene dialogue expressions

Approved source sheets from Drive (original bytes retained under ignored .local-assets/drive-originals):
- Kiki: 1MowpevzfTmpoObvgKHgEithwyF3l9bJx, 1,803,579 bytes; SHA256 078faef82183e8acf10e1d7c526d0e61ca58eadade0d27dadc31cc2ed4f09f8a.
- Nene: 1-TF_cpVLj9LU1kGrGNEGSubV9bRMejQz, 2,071,258 bytes; SHA256 2e328dc585c947cdc703715288258fa49bf8804a3cc4eb7312272d1c707fbf09.

The 1536x1024 sheets use 512x512 cells. Normal, smile, sleepy, yawn and surprised were extracted in that order from the first five cells, preserving the full cell and alpha; the blank sixth cell is unused. No redrawing or silhouette trimming. Ten runtime portraits are 200x200 PNGs, 740,924 bytes total (~81% smaller than source sheets). Each is loaded only when a conversation uses it. No expression requests at the tap screen (local HTTP log verified); unchanged URLs use ordinary browser caching. The shared eight-second/error image fallback applies without blocking text or controls.

src/dialogue.ts assigns speaker/emotion metadata to all 21 visit stories (intro and result) and all 11 start/win/loss lines. Unknown story, line or emotion falls back to normal faces. Visits show 112px portraits on short landscape screens and up to 200px elsewhere. Start banter uses a small noninteractive overlay above the field, expires after eight unpaused seconds, and hides on manual deployment. Results show both faces beside the line. No external API, account or new save schema.

Validation: 47 automated tests pass, including complete coverage of all story/banter mappings, all five emotions, unknown-tag fallback, and image deadline/error behavior. 667x375, 844x390, 1280x720 and 1920x1080 visits had loaded full-cell portraits, contain fit, and no page horizontal overflow. Source/crop visual checks and in-browser smile/sleepy comparison passed. Captures/ contains local proof images and measurements. Physical phone installation/orientation and speaker sound output remain device checks.
