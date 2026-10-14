# Startup repair

The initial HTML exposed battle controls and an empty battlefield. Phaser preloaded 19 full-size PNGs before create() called home(), so a slow image response delayed the title indefinitely from the user's perspective. Save restoration was not the cause: only cleared stages and preferences are stored.

- An inline, image-independent title shell now appears before the module loads. Battle UI remains hidden until the real title is ready. After 12 seconds a failed/slow script shows an explicit reload button, without clearing saves.
- Phaser startup loads no images. Its title and navigation are immediately usable. Ten card images are mounted only on departure.
- Only the chosen battle background, cats, bases and enemies load on departure. Each request has an 8-second timeout, the batch has a 12-second deadline, and fallback art remains playable. No automatic retry loop. A subsequent user-initiated departure can retry missing art.
- DOM image requests get an 8-second fallback. Decorative CSS backgrounds never gate navigation.
- 27 derived runtime PNGs are 384px for sprites and 1024px for scenery; approved originals remain unchanged. Total runtime art is 17,949,726 bytes. First title needs only the map and two cats, not the 19-image battle preload.
- Card portraits now have absolute inset dimensions and cards have a minimum height, preventing percentage-height collapse into thin strips.

## Validation

40 automated tests passed and TypeScript/production build passed. A dedicated local fault server serves the same production output: images delayed 20 seconds, all images 404, and module JavaScript 404. Slow/failed images did not block title, map, departure or cat deployment. Batch loading status ended in fallback. Missing JavaScript retained the title and revealed a reload action. Fresh origin showed all stages uncleared; existing local saves retained stage 0 and 2 clears. Reload from battle returned to title. At 667x375, all ten card images loaded and had at least 52px display height (artist intentionally scaled). Normal battle artwork visually checked. Screenshots remain in ignored Captures/.

Limit: these are desktop Chrome responsive and fault-injection checks, not a physical phone or actual mobile-radio test. Phaser bundle remains ~358 KB gzip; the static title covers its load and reports prolonged startup.
