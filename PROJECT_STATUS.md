# Forma — Interactive Math Studio status

## Current checkpoint — dimensional website redesign, 2026-10-28

Implemented the design correction across the website itself, independently of the mathematical models. The first screen now presents a real interactive 3D composition and the workspace retains the same dimensional visual language after the introduction is dismissed.

### Completed visual changes

- Added `dimensional.css`: consistent lighting from the upper left, highlighted panel edges, directional shadows, raised buttons with inset pressed states, inset fields, mathematical navigation badges, framed visualization surfaces, and compact animation control docks. Calculator forms and formulas remain flat and readable.
- Added `dimensional.js`: compact bilingual introduction with accessible HTML title and actions, a procedural cube/sphere/torus/grid scene, four working topic cards with custom SVG illustrations, and a persistent ambient-motion toggle. Desktop mouse tilt is limited to 2.5° on the topic cards; touch and reduced motion disable tilt. The actual calculator forms never tilt.
- Introduction actions start or skip directly to the current tool, preserve its inputs, and remember the collapsed preference. The top bar can reopen the introduction. Topic cards open Arithmetic, Graphs, Geometry or Fractions, dismissing the introduction and focusing the selected workspace.
- New visitors start in the navy theme; an existing saved light/dark choice is preserved. The light theme has the same raised controls, edge highlights and depth hierarchy.
- Mobile uses a shorter, narrow composition and a single row of 44px camera controls. Explicit 3D interaction restores normal page scrolling when finished. All text and mathematical descriptions are HTML; no text is embedded in WebGL.
- Ambient movement is subtle vertical floating, with no default camera rotation. The persistent motion control and OS reduced-motion preference suppress floating, tilt and presentation transitions. Educational playback retains its own existing shared controls.

### Dependency and lifecycle

- Reused the pinned local Three.js r180 / matching OrbitControls and existing MIT license. `FormaGeometry3D.load()` exposes the existing shared promise; the introduction and geometry lessons never load separate library copies. No model downloads, paid assets, package installation, framework or build system were added.
- Current official guidance consulted: https://threejs.org/manual/pages/rendering-on-demand.html and https://threejs.org/docs/pages/OrbitControls.html.
- Introduction dependencies load when its panel becomes visible. Rendering stops offscreen, in hidden tabs, or when ambient motion is off (camera actions still request frames). Resolution is capped at 1.25× on mobile and 1.75× elsewhere.
- Skipping or changing tools disposes the introduction's geometries, materials, controls and renderer. At most one introduction renderer and one existing geometry lesson renderer can exist; the introduction is automatically disposed when selecting a tool. Reopening it does not rebuild or change the lesson model.
- Missing WebGL2 and context loss show matching static SVG mathematical artwork. Calculators and their 2D explanations remain available. Reopening permits another initialization attempt.

### Fresh verification

- **1,401 assertions across 22 distinct real headless Edge suites passed**, with zero collected console/runtime errors. Reports: `tests/dimensional-regression-2026-10-28.json`. This is the current baseline; older counts below are historical.
- The new `tests/dimensional.html` has **78 assertions** for the real intro renderer, rotate/reset, offscreen pausing, motion preference, 44px targets, focus, persistent skip/reopen, functional topic cards, bilingual labels, both themes and unavailable-WebGL fallback.
- Widths checked with the introduction open: 320, 360, 390, 768, 1366 and 1600px, plus 844×390 landscape. The existing 171-assertion studio layout suite additionally checks all 18 tools, 1024 and 1440px, laptop stage fit, touch scrolling and orientation state.
- Additional final checks passed: dimensional introduction **78** with reduced motion and offline network emulation; geometry 3D **42** with reduced motion/offline plus **2 trusted mouse/touch orbit checks**; workspace integration **119** plus **2 actual SVG/PNG downloads**. These repeats are not included in the baseline total. Reports: `tests/dimensional-additional-2026-10-28.json`.
- Three legacy theme tests now explicitly choose the theme they intend to persist/toggle, accommodating the new navy default while retaining their assertions. Geometry's old “Three.js absent” assertions now check that no geometry renderer exists before opening 3D and that switching tools disposes the intro renderer; the library may already have loaded for the visible intro. Mathematical checks were retained.
- Fresh screenshots generated and visually inspected: `tests/dimensional-desktop.png` (1366×768 navy intro, English), `tests/dimensional-mobile.png` (390×844 navy intro, Bengali), `tests/dimensional-light-workspace.png` (1366×768 light scientific workspace), and `tests/dimensional-geometry-workspace.png` (1440×1000 navy 3D geometry workspace).

### Files and limits

- Presentation: `dimensional.css`, `dimensional.js`, `index.html`, and the first-visit default in `appearance.js`. Shared dependency entry: `geometry-3d.js`. Tests, runner, dependency notes, README and this status file were updated.
- Run by opening `index.html`; no build or installation. Reproduce the new checks with `powershell -NoProfile -ExecutionPolicy Bypass -File tests/run-browser.ps1 -Page dimensional.html`.
- Physical mobile devices, a real onscreen keyboard, and a full screen-reader audit were not tested. The introduction is illustrative, not a measurement lesson; Geometry Lab retains the accurate dimensions, layers, nets and cross-sections. Existing mathematical and translation limitations below remain. Local-file offline behavior is checked; hosted service-worker caching is not provided.

## Earlier checkpoint — geometry and workspace polish, 2026-10-28

Inspected the existing application and reused its vanilla HTML/CSS/JavaScript architecture. The studio design, local Three.js infrastructure and five solid lessons were already present in the workspace but missing from the older status below. This checkpoint verifies those implementations and completes focused framing, explanation and accessibility improvements without replacing calculator modules.

### A. Design and responsive workspace

- Existing `studio.css` supplies warm off-white / navy themes, emerald accents, Bengali/English typography, 44px controls, compact desktop navigation, mobile drawer and expandable secondary results. Existing keyboard navigation, examples, saves and graph exports are retained.
- Fixed the 2D/3D selected-button CSS specificity so the active view is visibly highlighted in both themes.
- Expanded stage now returns focus to the button that opened it; Escape and the visible close control preserve calculation and lesson state.
- Verified all 18 tools at 320, 360, 390, 768, 1024 and 1440px, plus 1366×768 and 844×390. The complete 3D stage fits the laptop viewport when its output panel is brought into view.

### B–C. Reusable 3D and geometry

- Existing local Three.js r180 and matching OrbitControls remain pinned, lazy loaded and MIT licensed. Reviewed the current official renderer and controls documentation again: https://threejs.org/docs/pages/WebGLRenderer.html and https://threejs.org/docs/pages/OrbitControls.html.
- Replaced fixed orthographic framing with bounds fitted in camera space, including unfolded nets and cylinder surfaces. Aspect ratio, camera presets and resize are accounted for without changing mathematical proportions or user zoom. The final flat net is centered and enlarged within the stage.
- Added six dimension labels attached to the actual hinged cuboid faces, including the lid. Opposite wd, wh and dh pairs have matching labels and colors.
- The selected surface-net lesson now promotes surface area as the primary answer, synchronizes the lesson selector and shows its formula directly below the stage. Volume, cylinder, cone and sphere formulas also follow the shared lesson model.
- Changing projection preserves camera orientation. Existing bounded zoom, front/top/side/reset actions, explicit mobile interaction, surface modes and same-progress 2D fallback remain intact.
- Existing lessons retain bounded volume layers, exact hinged box nets, cylinder unrolling, an equal-base/equal-height cone comparison with a clearly qualified integral explanation, and the sphere identity ρ² + z² = r².

### D. Existing 2D lessons and mathematics

- Reused existing fraction, trigonometry, statistics, graph and geometry teaching modules and their shared animation player. No parallel timeline or new numerical evaluator was introduced.
- Fresh regression runs preserve integration accuracy, exact fractions, angle conventions, degenerate-input behavior, saved calculations, examples and graph exports. Legacy teaching limitations are listed below rather than represented as newly completed transformations.

### E. Fresh browser verification

- Real headless Edge: **1,066 assertions across 18 existing regression suites**, all passing with zero collected console/runtime errors. Full reports: `tests/studio-verification-2026-10-28.json`.
- Studio checks: **171 layout + 43 3D + 43 solid-lesson assertions**, all passing with zero console/runtime errors. Combined with the 18 regression suites: **1,323 assertions across 21 distinct suites**. Repeated runs are not added to this total.
- New regression assertions cover 320px unfolded-face and cylinder-rectangle containment, top-view framing, projection orientation, six labeled faces, lesson/formula/answer agreement, and restoring focus to the stage opener.
- Fresh screenshots generated and visually inspected: `tests/studio-desktop-2026-10-28.png` (1366×768 cuboid net, light theme, Bengali) and `tests/studio-mobile-2026-10-28.png` (390×844 sphere slice, dark theme, Bengali). English controls and output were also exercised in the browser suites.
- Offline local-file 3D loading, reduced motion, actual mouse/touch orbit, actual WebGL context loss and unavailable-WebGL fallback were exercised. Final additional reports are in `tests/studio-additional-2026-10-28.json`.

### Run and remaining limits

- Open `index.html` directly in a modern browser; no install or build step is required. Run checks with `powershell -NoProfile -ExecutionPolicy Bypass -File tests/run-browser.ps1 -Page studio-3d.html` (Windows Edge).
- Offline verification covers the local-file application and its vendored dependencies. This project has no service-worker/PWA installation flow; hosted offline caching is not claimed.
- Perspective is an explicitly labeled optional view. Automatic construction fitting is implemented for the measurement-focused orthographic view; users can reset or zoom the perspective camera.
- Device keyboard checks use a shortened viewport and focused input; a physical onscreen keyboard, physical mobile hardware and a full assistive-technology audit were not tested.
- Extremely thin dimensions can remain subpixel at true scale; measurements remain available as text. Mesh facets are approximations; formula calculations use the original mathematical model.
- Detailed legacy prose still has partial English-only coverage. Existing advanced algebra/calculus/matrix teaching backlog remains; the working calculations and diagrams are retained.

## Historical checkpoint — 2026-10-26

Current checkpoint (2026-10-26): integration aliasing and Geometry teaching work finished; all eight requested phases implemented. Existing calculator, Graph Explorer, themes, language preferences and history are retained.

## Completed integration fix and Geometry teaching

- Reproduced the original results in real Edge before editing: cos(8πx) and cos(16πx) on [0,1] returned 1, sin²(8πx) returned ~3.2e−31, all after only 5 evaluations.
- Adaptive Simpson now forces at least 32 leaf panels and resolves the sum of trigonometric argument interval widths to ≤π/8 before accepting an error estimate. Depth (22), evaluations (50000), work and phase-magnitude limits give explicit errors. Very large sin/cos interval arguments return a conservative range to avoid non-advancing integer loops. Error estimates are explicitly not guaranteed bounds.
- Corrected results: ~−2.78e−17, ~−3.47e−17 and 0.5. Regression cases include shifted/higher/nonlinear phases, reversed/equal bounds, depth/work limits and domain holes.
- Geometry now has continuous persistent diagrams: unit/partial/grouped rectangle cells; rigid triangle/trapezoid copies; parallelogram cut and translation (representative equal-height bands for large shear); exact circle sector rearrangement and a separately labeled improving inscribed-polygon approximation; cube/cuboid unit or grouped slabs with fractional final layers.
- Static-only shapes disclose that a detailed transformation is unavailable. All new lesson prose is English/Bengali. Shared playback, exact in-flight pause, cancellation, manual reduced-motion steps and a keyboard-accessible timeline scrubber are retained.

## Completed Phase 1 — Fraction Lab

- Search/sidebar route in the existing Calculator group; separate numerators/denominators, four operations, examples, Reset, Copy and safe MathML fraction output.
- BigInt arithmetic for signed integer inputs up to 80 digits each; normalized denominator sign, exact reduction, mixed numbers, equivalent fractions and bounded 20-place decimal conversion with explicit approximation labels.
- Equal whole sizes and LCM subdivision; persistent moving addition/removal pieces; signed number-line directions; horizontal/vertical area overlap; full and fractional measuring groups followed by reciprocal reasoning.
- Denominator and zero-divisor checks preserve inputs and cancel stale playback. Rendering is capped at 24 literal partitions per whole and 3 literal wholes, with grouped/normalized alternatives explicitly disclosed.
- Normal/reduced-motion browser checks: 60 assertions each; trusted mouse/touch timeline drags pass at desktop and mobile sizes. Screenshots are tests/fractions-desktop.png and tests/fractions-mobile.png.

## Completed phases in the requested order

2. Trigonometry Lab: completed; see checkpoint below.
3. Statistics teaching: completed; see checkpoint below.
4. Coordinate Geometry: completed; see checkpoint below.
5. Sequence & Series: completed; see checkpoint below.
6. Probability: completed; see checkpoint below.
7. Complex plane: completed; see checkpoint below.
8. Integration/polish: completed; scientific-to-graph angle-safe transfer, answer verification, focus view, examples/formula reference, local named saves and graph exports.

Matrix row-operation teaching remains a separate future item; no new row-operation animation is claimed.

## Completed Phase 8 — Integration & polish

- Scientific-to-graph transfers preserve DEG/RAD meaning by transforming the parsed expression; historical Ans is frozen. Unsupported expressions and out-of-range graph parameters give explicit feedback.
- Existing linear/quadratic solvers show substitutions, residuals and scaled numerical tolerances, including complex roots. Numerical checks are not represented as symbolic proofs.
- All 18 tools have three worked-example levels (54 examples), searchable bilingual formula/domain references and a keyboard-accessible focus view. Shared scrubber, responsive walkthrough placement and constant-size coordinate/trigonometry touch targets improve exploration.
- Local named saves restore inputs, scientific evaluation context, graph viewport/pin and seeded probability records without replacing history or theme preferences. Storage is bounded to 50 records and 2 MB; invalid/corrupt/unavailable storage is disclosed. No cloud sync or import is claimed.
- SVG and PNG exports retain equation, axes, ticks, comparison legend and theme background; PNG rasterization is bounded. Browser checks include actual downloaded file signatures and an actual reload of saved calculations.
- Triangle area uses stable Kahan–Heron factors without squaring large intermediates; trapezoid and sector expressions avoid avoidable overflow. Positive dimensions with unrepresentable underflow fail explicitly. Extreme-aspect teaching diagrams disclose their representative scale.

## Completed Phase 7 — Complex Number Plane

- Search/sidebar route in Algebra. Equal-scale real/imaginary axes, numerical a+bi inputs and substituted calculations accompany head-to-tail addition/subtraction, real-axis conjugate reflection and magnitude/argument multiplication/division.
- i multiplication shows a 90° counterclockwise rotation. The principal argument uses atan2 with DEG/RAD display; zero arguments are explicitly undefined, including zero products during the animation.
- Division scales the denominator to avoid squaring tiny values; zero division, result overflow and nonzero-result underflow are explicit errors. UI components are bounded to ±1,000,000; output is approximate.
- Persistent vectors retain exact in-flight pause and synchronized manual/replay/input cancellation. 43 normal and 44 reduced-motion browser checks pass for arithmetic, geometric intermediate/final states, limits, languages and responsive layouts.

## Completed Phase 6 — Probability Lab

- Search/sidebar route in Statistics. Fair coin/die sample spaces, selectable events and exact theoretical fractions are separate from empirical recorded frequencies.
- Independent pseudorandom records are generated once per Calculate, ≤100000 trials. Prefix counts let playback/manual scrub reveal the exact same experiment; Replay never resamples. No result is forced toward theory and the UI disclaims guaranteed equality or dependence on past outcomes.
- ≤6 frequency bars keep rendering bounded even at the trial limit. Frames may reveal multiple trials. No-trial empirical probability is explicitly unavailable; full-record results are separately labeled for Quick Calculate.
- nPr/nCr use exact BigInt products/division for 0≤r≤n≤200. Preview ≤24 actual distinct arrangements, ≤8 prefix slots, with explicit truncation; empty selection counts once. Ordered versus unordered selection is explained without gambling/payout features.
- 41 normal and 42 reduced-motion browser checks pass for probability/counting identities, recorded replay, input domains, bounded rendering, pause/cancellation, bilingual controls and responsive widths.

## Completed Phase 5 — Sequence & Series

- Search/sidebar route in Number & Units. AP/GP first term, signed difference/ratio and integer count generate the same terms used for last-term and finite-sum results.
- Signed number-line/bar models; reversed AP copies form constant first/last pairs, including odd n and negative values. GP symbolic exponent alignment explains the finite sum without invalid r=1 division.
- GP infinite sums require |r|<1 for nonzero first terms; zero first terms correctly give a zero series for all finite ratios. Negative ratios alternate signs; r=0, ±1 and near-one cases are covered. Compensated finite summation avoids the unstable near-one subtraction formula.
- Bounds: ≤10000 calculated terms, ≤24 drawn first/last preview terms, |a₁|≤10¹⁰⁰ and |d/r|≤10⁶. Overflow gives an adjacent error and cancels the old lesson. Outputs are explicitly floating-point approximations.
- 40 normal and 41 reduced-motion checks pass for formulas, examples, zero/negative/decimal/overflow cases, intermediate copy movement, cancellation, keyboard and responsive layout.

## Completed Phase 4 — Coordinate Geometry

- Search/sidebar route in Geometry. Distance, midpoint, signed slope, implicit/vertical line, parallel and perpendicular examples through C share the same numerical points.
- A/B/C mouse/touch capture and keyboard changes sync inputs, formulas and persistent SVG. Dragging freezes the viewport; keyboard movement beyond it refits. Equal-scale and independently scaled axes are explicitly labeled.
- Animated signed run/rise form the Pythagorean triangle; midpoint halves have equal length and separate styles. Vertical and coincident cases never invent a finite slope or unique line. Line substitutions and examples use full precision.
- Inputs are bounded to ±1,000,000. Invalid values are preserved and adjacent validation survives live recalculation. An unused hidden C does not invalidate a distance calculation.
- 43 normal and 44 reduced-motion browser checks pass for identities, input/drag/keyboard sync, line degeneracies, view scale, clipping, playback and mobile layout. Current screenshots are tests/coordinates-desktop.png and tests/coordinates-mobile.png.

## Completed Phase 3 — Statistics teaching

- Existing statistical calculations and quartile convention are retained. Stable observation IDs preserve duplicates while sorting; actual middle observation(s) are highlighted.
- Equal sharing changes weighted group heights while preserving the signed total. Individual/grouped signed deviations and squares lead to population versus sample variance. n−1 is explained through the zero-sum constraint and its standard IID finite-variance assumptions, with a labeled worked example.
- Every signed deviation remains available in a bounded single-text-node disclosure; grouped squared areas retain within-group variation. Large datasets keep ≤20 bars/sort-preview IDs and ≤15 moving histogram clusters while calculations include all inputs.
- Histogram movement respects exact bins/max inclusion; box plot labels the existing median-of-halves/min-max-whisker convention. Paired data have fitted-line drawing and signed vertical residuals, including honest constant-y R² and invalid-x/length cases.
- 44 normal and 45 reduced-motion assertions pass; normal pause and manual reduced-motion steps are both checked. Legacy suite navigation deliberately seeks Box plot at step 8 and completed regression at step 10 after inserting the richer teaching stages.

## Completed Phase 2 — Trigonometry Lab

- Search/sidebar route in Graphs. Unit circle radius 1; mouse/touch pointer and keyboard angle movement, numeric/slider sync and DEG/RAD conversion preserve the angle.
- Linked sine/cosine traces use explicit θ units, different line styles and signed projections; the exact tracer endpoint is included. Continuous play loops a signed cycle; Pause/Replay/manual scrub and reduced motion work through the shared player.
- Five worked angle buttons; exact recognized reference forms versus approximate decimal output; quadrant signs. Tangent uses sin/cos, is undefined at vertical axes and splits at asymptotes. Nearby finite angles are not falsely called undefined.
- The right-triangle view is restricted to 0°<θ<90°; negative/obtuse inputs get a reason instead of a false triangle.
- 59 normal and 58 reduced-motion browser assertions pass, covering values, identities, coordinate/angle sync, pointer dragging, keyboard, pause/loop/replay/cancellation, invalid inputs, languages and responsive widths. tests/trig-desktop.png and tests/trig-mobile.png were captured and inspected.

## Completed Graph Explorer investigations

- Persistent vertex hit target with mouse/touch capture, keyboard arrows, fine Shift+Arrow motion, Home and vertex reset. Vertex-form updates preserve a and calculate b=−2ah, c=ah²+k through the existing coefficient pipeline. Dragging keeps the viewport fixed; existing coefficient limits are projected and disclosed. a=0 disables vertex dragging with an explanation.
- Pin/clear Before comparison: immutable primary-function/parameter snapshot, orange dashed reference versus green solid current curve and text legend. Custom primary references retain discontinuity checks; no extra curve category was added.
- Optional prediction activities change a sign, |a| or c only after an answer. Correct graph and supportive feedback follow; parameter/family changes reset the activity. a=0 and maximum-|a| cases are handled explicitly.
- Why controls give sign/width/vertical-shift worked examples and a purple dotted SVG highlight. They preserve the user's function and have an explicit clear action.
- Real-root substitution residuals use full-precision roots with a scale-aware tolerance and approximate-value disclosure. Complex roots are never shown on the real axis; linear/constant cases have accurate explanations.
- Main Reset clears reference/activity and restores default coefficients; vertex reset preserves a; Reset view preserves the function/reference. Input edits, pointer cancel and tool changes cancel dragging/playback. New labels/help support English/Bengali, dark theme and reduced motion.
- Added graph-teaching.html correctness/interaction checks and optional trusted DevTools mouse/touch checks in the existing browser runner. No package was installed.

## Completed interface

- Desktop sidebar with the requested eight category groups; the original quick tools remain inside their relevant groups.
- English/Bengali tool search, including direct routing to supported subtools (quadratic, integral, inverse, triangle, etc.).
- Collapsible mobile drawer with focus management, Escape/Tab support, inert closed content and close-on-selection.
- Compact active-tool heading and description; oversized hero removed from the workspace. Readable body/labels, consistent controls, visible focus and Forma light/dark themes.
- Scientific key grouping; AST-backed native MathML previews for scientific/algebra/calculus/custom graph input. Previews do not inject user HTML.
- Quick Calculate / Learn Visually preserve the same input/result objects. Scientific Learn view honestly reports its missing visual lesson.
- Working example and Reset for every existing tool; clipboard success/failure feedback; adjacent field/group validation without clearing inputs.
- Conservative exact / approximate / unsupported / invalid / pending result status. Existing numerical limits remain documented in README.

## Completed shared animation system

- requestAnimationFrame-based player and standardized Previous / Next / Play-Pause / Replay / Speed controls, including the existing static Circle formula walkthrough.
- Current/total steps, progress, current-step highlighting and what/why/change descriptions.
- Pause preserves in-flight position; Replay starts at the first step with unchanged inputs. Old playback cancels on input/tool changes.
- Reduced-motion continuous playback is disabled while manual Previous/Next/Replay remain usable.
- Arithmetic/Percentage SVG and cell objects persist across updates; matching older lab SVG/table structures are patched. Existing graph tracing uses the shared timeline and retains its paths.
- Text labels and symbols supplement colors. Older operations with only worked steps explicitly disclose the missing animated diagram.

## Completed Arithmetic

- Correct signed number-line movement for addition/subtraction, including subtracting negative values and decimal/large-number adaptive scales.
- Equal groups/rows × columns for bounded positive integer multiplication; signed, labeled normalized area models for decimal/negative/large inputs.
- Equal integer distribution and a separate remainder for dividend 0–100, divisor 1–12. Other valid divisions use a labeled quotient/ratio model; the numerical answer is not confused with integer division.
- At most 100 visible items/cells and 12 recipient groups; no unbounded object generation. Schematic/scale notices are shown.

## Completed Percentage

- 100-cell share grid, correct fractional cell fill, and p% → p/100 → multiplier × original → answer steps.
- Percentage-of / increase / decrease operations; separate original, signed change and final amount.
- Explicit negative share labels, multiple-whole representation above 100%, a labeled representative full grid for whole multiples, and a signed-multiplier fallback for unreliable huge whole-count labels.
- Common-scale bars with dashed target outlines and solid revealed quantities.
- New lessons and workspace labels are English/Bengali. Detailed legacy help/errors/worked prose are still partly English; that pre-existing translation backlog remains.

## Earlier visualization backlog — updated at this checkpoint

1. Fraction common-denominator animation: completed in Phase 1 above.
2. Algebra cancellation and balance transformations beyond the existing steps.
3. Unit-circle-to-sine/cosine-curve derivation: completed in Phase 2.
4. Geometry cut-and-rearrange and volume layers: completed for the listed supported shapes above; cone/cylinder/sphere retain explicit static-only disclosures.
5. Statistics sorting, mean and deviation visualizations: completed in Phase 3.
6. Calculus secant-to-tangent and Riemann refinement.
7. Matrix row operations and vector transformations.

The old algebra, geometry, graph, calculus, statistics and matrix diagrams/calculations remain working; this list refers to richer teaching transformations, not new placeholder controls.

## Known limits retained

- General arithmetic is IEEE-754; Fraction Lab and combinatorial counts use exact BigInt arithmetic within their documented input bounds. Exact badges are deliberately conservative.
- Bounded polynomial simplification/factorization and symbolic derivative rules, matrices up to 4×4, at most 500 observations, three custom graph curves, bounded prime tests and parser resource limits remain as documented in README.
- Numerical custom graph feature searches are viewport bounded and not exhaustive; continuity certification/integration can conservatively reject uncertain cases.
- Modern native MathML browser support is required. Clipboard can be blocked by browser permissions; failure is disclosed without pretending it succeeded.
- Browser checks are not a full assistive-technology audit. Detailed legacy prose translation remains pending.

## Verification

Final current-code run: **1084 assertions passed in real headless Edge across 19 suites**. Every suite reported **0 console/runtime errors** through DevTools event collection.

Reduced-motion reruns also passed: Geometry 68, Fractions 60, Trigonometry 58, Statistics 45, Coordinates 44, Sequences 41, Probability 42, Complex 44, Workspace integration 119 and Graph teaching 59. These repeated checks are not added to the distinct baseline total. Trusted DevTools mouse/touch vertex dragging and timeline scrubbing each passed two additional checks at 390px. Actual SVG/PNG button downloads passed two checks, including file signatures. Current screenshots tests/final-desktop.png (1600px Statistics) and tests/final-mobile.png (390px dark Fraction Lab) were generated and visually inspected; both screenshot runs repeated all 134 layout checks successfully.

| Suite | Assertions |
| --- | ---: |
| regression | 41 |
| graph | 46 |
| suite (Scientific/Math Lab) | 122 |
| persistence (actual reload) | 5 |
| graph-reduced-motion | 15 |
| workbench | 111 |
| graph-teaching | 59 |
| integration | 25 |
| geometry | 69 |
| fractions | 60 |
| trigonometry | 59 |
| statistics-teaching | 44 |
| coordinates | 43 |
| sequences | 40 |
| probability | 41 |
| complex | 43 |
| workspace-plus | 119 |
| workspace-persistence (actual reload) | 8 |
| workspace-layout | 134 |

Tests cover mathematical identities, negative/zero/decimal/invalid inputs, persistent intermediate/final diagram states, resource limits, exact in-flight pause, replay/scrub/input/tool cancellation, keyboard controls, bilingual labels, safe text rendering, storage failures and page overflow. Layout checks exercise all 18 tools at 320, 390, 768, 1280 and 1600px; wide screens use three panes and mobile controls precede long walkthroughs. Reload checks include 80-digit fractions, graph viewport/reference, recorded probability experiments, historical Ans and theme/language.

No external dependency was installed. Numerical integration and Geometry stability corrections are documented above. Scientific expressions still use the cached AST and existing evaluator; no user expression is executed with eval or Function. Actual browser execution is required to reproduce these results; source review and old reports do not count.

Intentional legacy test updates preserve mathematical checks: statistics box-plot and regression walkthrough positions now correspond to their expanded teaching stages; player counters use the shared format and reduced-motion Replay returns to the first manual step.

## Interactive Math Universe upgrade — 2026-10-28

Implemented directly on the existing dimensional/studio architecture; no dependency added or mathematical engine replaced.

- Signature local Three.js composition: frosted transparent cube with an octahedral core and internal planes, coordinate-lined sphere, metallic torus, curved ribbon, and a coordinate plinth. Existing lazy loading, resolution caps, offscreen/hidden-tab suspension, disposal, touch interaction mode, and persistent motion preference are retained. Added restrained desktop pointer response, disabled during form editing and reduced motion.
- Eight original SVG pictorial topic cards, including geometry, graphs, fractions, trigonometry, statistics, probability, and matrices. Every Explore action opens its real existing tool. Large two-column mobile artwork and bilingual descriptions replace the old tiny icons.
- Readable control surfaces and gridded visualization environment; added a geometry label visibility control beside the existing reset, expand, view presets, projection, and material controls.
- Optional linear-slope exploration uses the real graph coefficients; explains negative slope and restores the prior family/coefficients when skipped. Existing mathematical parameter interactions and shared pause/replay/scrub/speed controls remain intact.
- Static hero SVG now includes internal cube structure, sphere coordinates, and a wave. Geometry retains its existing accurate 2D WebGL fallback.

Verification performed in real headless Edge: dimensional 78, calculator regression 41, solid lessons 43, new Universe behavior 10, and reduced-motion studio layout 171 assertions: **343 passed**, zero console/runtime errors in those runs. Layout exercises 320, 360, 390, 768, 1024, 1366, 1440, and landscape sizes, including actual 3D, orientation state preservation, bilingual labels, motion preference, WebGL failure, and touch target checks. A laptop stage-height failure was corrected and its suite rerun successfully. JavaScript syntax checks passed. Existing historical totals above are not claims of a complete new full-suite run.

Screenshots captured and visually inspected: tests/universe-desktop.png (1440 dark English), universe-mobile.png (390 dark English), universe-laptop.png (1366 light Bengali), universe-tablet.png (768 dark Bengali/reduced motion), universe-workspace.png (1440 3D geometry). Workspace capture preceded the laptop-height correction; the final layout suite verifies the corrected stage dimensions. Initial before-capture attempt failed because sandboxed Edge debugging was unreachable; there is no fresh matching before screenshot. Existing earlier screenshots remain available, but are not represented as a new baseline capture.

Remaining limits: camera presets retain immediate transitions; the new optional challenge currently covers linear slope only. No new algebra-specific pictorial card (the existing Algebra Lab remains available). Intro artwork is illustrative; teaching models retain their existing exact/approximate and scale disclosures. Full assistive-technology and physical low-powered-device testing remain outstanding. Detailed legacy translation backlog remains as documented above.
