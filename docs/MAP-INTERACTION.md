# Large interactive map (local checkpoint)

Reference: parent task visually inspected the supplied 960x540 screenshot and described a nearly full-screen map between narrow bars, an upper-center selected-place plate, a lower-right launch action and lower-left back action. No reference artwork was copied.

Both the three-stage illustrated operation map and seven-place geographic walk map now use a shared bounded camera. Maps initially fill their viewport; Whole Map fits every map edge. Drag pans, wheel zooms around the cursor, two pointers pinch around their midpoint, and + / - / Whole Map provide explicit controls. Keyboard arrows work when the map region has focus; Home restores the whole map. Scale is limited to 1–4 times the fit scale. View state survives opening/closing details but is not written into progression saves.

Details are separate overlays, outside the gesture surface. On short screens the description scrolls inside its panel while the launch button stays visible. After a drag or pinch, clicks are suppressed for 700ms. Pointer cancellation and released fingers stop affecting the camera.

Geographic latitude/longitude values are unchanged. The Mercator tile window is widened from 800x500 to 1200x500 at the same center/zoom, with matching marker projection. Marker sizes remain stable while zooming; nearby arena/park markers use distinct offset labels and coordinate anchors. Existing GSI attribution remains. No new mapping provider, service, fee or dependency is introduced.

## Verified

- TypeScript and production Vite build succeed. 52 tests pass, including existing 47 and five camera/input tests.
- Camera tests cover fit, zoom anchor invariance, extreme pan/zoom bounds and small/TV proportions.
- DOM adapter tests exercise two-pointer pinch, small tap movement, drag, pointer cancellation, click suppression, wheel cancellation and panel independence. These are synthetic input tests, not physical touch-device validation.
- Chrome: 667x375, 844x390, 960x540 and 1920x1080. Page dimensions equal viewport dimensions; no page scrolling. TV safe margin preference retained.
- Real browser wheel changed geographic zoom from 101% to 215%. Drag changed camera transform. Dragging from the kindergarten node did not open it; subsequent normal click opened its existing story with expression portraits.
- Detail-panel scrolling left the map transform unchanged. Existing stage launch, cat deployment, pause, map return and saved clear marks worked.
- Final browser error log empty. Captures/map-* contains local screenshots and map-verification.json contains measured geometry. Physical phone pinch and TV hardware remain untested.

## Next content pack

The requested 42 missions / 12 enemies are not implemented in this checkpoint. Their incoming JSON message contained a literal truncated middle section, so the full source must be supplied as a file; generated enemy art is also pending. Keep the existing three stage indices and save namespace stable. Additional missions should use stable string IDs and a separate progress field/namespace, with explicit wave schedules, objective types and lazy enemy texture lists. Map location aliases needed by the incoming design are ikisu_shrine -> ikisu, ishigami_kindergarten -> ishigami, karuno school -> karuno, gallery -> gallery, kamisu_central_park -> central, kamisu_disaster_arena -> arena, minato_park -> portpark. Confirm exact missing JSON identifiers from the full file rather than guessing them.

No push or deployment was performed for this map checkpoint. Public site remains commit 594701f.
