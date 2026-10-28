<<<<<<< HEAD
# Forma — Scientific Calculator & Visual Math Lab

একটি সম্পূর্ণ স্থানীয় HTML/CSS/JavaScript app। কোনো dependency, backend, API key, account বা internet connection লাগে না। আগের Arithmetic, Percentage, Algebra balance animation এবং Circle calculator রাখা হয়েছে। বিভাগগুলো desktop sidebar থেকে খুলুন; mobile-এ Tools button drawer খুলবে।

## চালানোর নিয়ম

1. এই folder থেকে `index.html` browser-এ খুলুন (VS Code Live Server-ও ব্যবহার করতে পারেন)।
2. ফাইল পরিবর্তনের পর save করে refresh করুন।
3. Scientific expression field-এ keyboard দিয়ে লিখুন; Enter বা `=` হিসাব করে, Escape display clear করে। Button-গুলো keyboard focus ও native slider keys সমর্থন করে।
4. Header-এর theme/language buttons দিয়ে light/dark এবং বাংলা/English labels বেছে নিন। Browser storage অনুমতি দিলে history ও এই preferences থাকে।

## Professional workbench

- Eight sidebar groups: Calculator, Graphs, Algebra, Geometry, Calculus, Statistics, Matrix & Vector, Number & Units. The earlier quick calculators remain available within their groups. Search accepts English/Bengali names and routes directly to supported subtools.
- The mobile drawer starts collapsed/inert, focuses search when opened, supports Tab cycling and Escape, and closes after a tool is selected. The large hero is removed from the workspace. Body text is 16px, field labels at least 14px; diagrams use appropriately sized mathematical labels.
- Quick Calculate and Learn Visually share the same inputs, answer and DOM objects. Switching views pauses animation rather than rebuilding a form. Graphs remain graphs in either view; learning/tracing controls are omitted from Quick view.
- Scientific expressions and editable algebra/calculus/custom graph expressions have native MathML previews. Previews and evaluation use the same cached safe AST. No user expression is injected as HTML. MathML needs a modern browser; no remote typesetting dependency is used.
- Every tool has working Try an example and Reset actions. Reset restores the current tool's defaults; Scientific Reset preserves saved history but resets expression, memory, Ans and angle mode.
- Copy answer uses the browser clipboard API and reports success/failure; blocked clipboard permissions require manual copying. Validation messages are next to the affected input/group, and errors preserve entered values.
- Exact status is conservative: integer-only rational ASTs are certified only if they resolve to a matching safe integer; BigInt tools report exact representation. Other numeric outputs are marked approximate, even when a particular decimal happens to be exactly representable. Unsupported and invalid inputs are separately labeled. Math precision/domain limits below remain unchanged.
- Scientific function keys are grouped into memory/editing, trigonometry, powers/roots, logs/counting, and constants/fractions. Its Learn view explicitly says there is no scientific-expression visual lesson yet.

## Arithmetic & Percentage learning models

Arithmetic keeps the original result calculations and adds four meaningful steps with bilingual “what / why / what changed” explanations:

- Addition/subtraction: adaptive labeled number line, explicit zero tick, signed displacement and a continuously moving endpoint. Subtracting a negative value moves right. Tick labels are rounded for readability; labeled values retain the usual result precision.
- Positive whole-number products ≤100: equal rows/groups × columns, bounded by 100 cells. Negative/decimal/larger products: a signed, normalized area model with explicit dimension labels and a schematic-scale notice. Zero factors produce zero area.
- Integer division with dividend 0–100 and divisor 1–12: equal recipient groups, per-group count and separately labeled remainder. The integer distribution is distinct from the numerical quotient. Other finite signed/decimal/large inputs use a labeled scaled quotient model; no fractional recipient groups are invented.

Percentage offers percentage-of, increase and decrease. The four steps are `p% → p/100 → (p/100)×original → answer`. Increase/decrease display the original, signed change and final value separately. Dashed bar outlines mark target quantities, while solid fills reveal the current amount on a shared scale.

Each grid has exactly 100 cells: one cell = 1%, including proportional partial cells. Negative shares are labeled with a minus sign. Above 100%, the display states the number of whole 100% units and shows the remaining partial whole. For a whole multiple (such as 100%/200%), the full grid is explicitly identified as one representative whole. Magnitudes above `Number.MAX_SAFE_INTEGER` percent use a signed multiplier without a misleading whole-count grid. General floating-point precision limits still apply.

The lesson SVG and cell pool persist across step/input updates. Each lesson keeps fewer than 400 descendants; no large-value input produces thousands of dots. Visible item counts are bounded by 100, with at most 12 recipient groups.

## Shared learning player

`animation.js` provides a requestAnimationFrame timeline and common Previous, Next, Play/Pause, Replay, Speed, current/total step and progress controls for Arithmetic, Percentage, the existing Algebra walkthrough, the static Circle formula walkthrough, existing lab walkthroughs and graph tracing. Pause retains the fractional in-flight position. Replay starts at the first step using the same input. Input/tool changes cancel stale playback. Reduced-motion mode disables continuous Play but keeps Previous/Next/Replay usable as static/manual steps.

New Arithmetic/Percentage SVG objects are updated in place; older lab SVG/table steps are patched rather than wholly replaced where their structures match. Graph morphs retain their SVG paths. Existing worked steps are preserved, with short purpose/change descriptions; this session does **not** add new transformation lessons for the other categories. Where an older operation only has worked text, the interface says a meaningful animated diagram is not available yet.

## Scientific Calculator

- Safe tokenizer + precedence parser; no `eval()` / `Function()` or external library.
- Decimal/scientific notation (`1.2e-3`), negative numbers, `+ - * / ^`, parentheses, postfix `!` and `%`, implicit multiplication (`2pi`, `2(x+1)`). Power is right associative: `2^3^2 = 512`; `-2^2 = -4`. Use explicit parentheses for ambiguous divisions.
- `sqrt`, `cbrt`, `root(value, n)`, `abs`, reciprocal, square/cube/power.
- `sin`, `cos`, `tan`, `asin`, `acos`, `atan`; explicit DEG/RAD selection. Inverse results use that selection. Tangent is rejected when `|cos(angle)| < 1e-14`.
- `log10`, `ln`, `exp`, `pow10`, `log(value, base)`, `pi` / `π`, `e`.
- `fact(n)` / `n!` for integers 0–170; `npr(n,r)`, `ncr(n,r)` for `0 ≤ r ≤ n ≤ 100000`, subject to numeric overflow.
- Ans; MC, MR, M+, M−; backspace; clear-entry (last token); clear-all (expression/result, preserving Ans and memory).
- Reusable history capped at 40 entries, including each expression's angle mode and historical Ans context. Clear history removes the stored entries. Storage failures degrade to session-only history.

### Percentage semantics

`p%` **always means `p/100`**, independent of the preceding operator:

- `200 * 10% = 20`
- `200 + 10% = 200.1`
- A 10% increase is `200 * (1 + 10%) = 220`.

### Fractions and precision

Fractions are entered as division, such as `1/3 + 1/6`. Fraction/Decimal switches the result display. Noninteger fraction displays carry `≈`: a continued-fraction reconstruction with denominator at most 1,000,000, not an exact rational arithmetic engine. If no suitable fraction is found, the decimal remains visible.

All general arithmetic uses IEEE-754 binary64 numbers. Scientific decimals display up to 12 significant digits; other tools generally use 10, and graph annotations use 5. Safe integers retain all their digits. `≈` indicates approximate decimal results. Factorials/combinations can also lose integer precision beyond JavaScript's safe-integer range. The power operator follows JavaScript's numerical convention `0^0 = 1`. Errors explain zero division, real-domain violations, invalid factorial/combinatoric inputs and overflow.

Expression limits: 800 characters, 350 tokens and 70 nested parser calls. Names are case insensitive; formulas and number entry use ASCII function names/digits even with Bengali labels.

## Graph Explorer

- Presets: linear, quadratic, cubic polynomial, sin/cos/tan, exponential, logarithm, square root and absolute value.
- Custom `y=f(x)` expressions: up to 3 newline-separated functions; x and sliders a/b/c, pi and e are supported. Graph trigonometry is always in radians. Discrete factorial/nPr/nCr graphs are rejected.
- Persistent SVG paths, 280 ms parameter interpolation, labeled axes/ticks/grid/origin, legend, viewport clipping, zoom, button/drag pan and reset.
- Draw curve, Play/Pause, Replay, 0.25×–3× speed, tracing coordinates and dashed axis guides. The curve ends at its moving point. Invalid/out-of-view tracing positions are reported and the dot is hidden there.
- Default quadratic: analytic vertex and real roots, including a = 0 linear/constant cases. Offscreen roots/vertex are identified in the summary.
- Custom graphs: sampled roots and local extrema for the first function; intersections of the first function with each comparison curve. These are approximate searches in the visible x interval, not exhaustive symbolic solutions. Tangential intersections or closely spaced roots may be missed.
- Curve segments require finite samples and conservative interval continuity checks; poles/asymptotes are not joined. Conservative checks can omit uncertain segments rather than draw across them.
- Default x window −6…6, coefficient sliders −20…20. Default quadratic auto-fits y, while keeping visible curvature changes. Custom graphs start at y −10…10. Zoom/pan controls change those windows; Reset restores defaults.
- Coefficient edits cancel drawing and morph a complete preview. Expression edits require Plot functions. Leaving the tab cancels/resets tracing.

## Algebra Lab

- `ax + b = c`, including no/infinite solutions; the original balance animation remains in the Linear balance tool in the Algebra sidebar group.
- Quadratic solver with discriminant and real or conjugate complex roots. a = 0 degenerates to a linear equation.
- Two simultaneous linear equations, including dependent/contradictory cases.
- Polynomial evaluation/expansion/collection: degree at most 12, integer powers 0–12, constant nonzero divisors, x/pi/e only.
- Real polynomial factorization for degree 0–2. Negative discriminant is reported as irreducible over the reals; decimal factors are approximate.
- Supported operations show valid equations/rules/substitution; unsupported expressions fail without fabricated steps. This is a bounded algebra tool, not a general CAS.

## Geometry Lab

Circle, triangle (three sides), rectangle, square, parallelogram, general trapezoid, Pythagorean legs, cube, cuboid, cylinder, cone and sphere. Area/perimeter or volume/total surface area are displayed with formulas, substituted values, units and live labeled shapes.

Lengths must be positive. Triangles obey the strict triangle inequality; parallelogram height cannot exceed the slanted side. A trapezoid uses lower/upper base, height and a signed horizontal offset; both slanted sides are computed, so it need not be isosceles. Cone surface includes its base. Unit labels assume all entered lengths already share one unit. 3D figures are labeled schematics, not interactive 3D models. The original Circle tab still permits radius zero.

Rectangle/square lessons fill unit or partial cells (large/extreme dimensions use labeled grouped cells). Triangle and trapezoid lessons move a congruent second copy through a rigid half-turn. Parallelograms use cut-and-translate pieces; large shear uses a disclosed representative equal-height-band construction. Circle lessons rearrange exact curved sectors; the dashed rectangle and inscribed-polygon area are explicitly approximate and improve with 8–64 sectors. Cube/cuboid lessons stack unit-height or bounded grouped layers, including a fractional final layer. Other shapes retain an explicit static-only derivation notice. Shared controls pause at the exact interpolated state; Previous/Next/Replay and the timeline work under reduced motion.

## Fraction Lab — completed Phase 1

Available in the Calculator sidebar group and tool search. Four signed integer inputs (up to 80 digits each) use BigInt arithmetic for addition, subtraction, multiplication and division. A zero denominator or zero divisor fraction is rejected beside its field. Results include an exact reduced fraction, unambiguous mixed-number form, equivalent fractions, reduced inputs and decimal long division capped at 20 places; nonterminating/truncated decimals are explicitly approximate.

The common-denominator model uses equal-sized wholes and LCM subdivisions; moving pieces illustrate addition/removal, and negative quantities get a signed number line. Multiplication uses horizontal/vertical shading and overlap. Division measures full and partial groups before explaining the reciprocal. Large denominators and quantities use disclosed grouped/normalized diagrams, never thousands of nodes. The original quantities remain labeled as inputs while their copied tokens move into the result. Exact numerical output is independent of floating-point drawing coordinates.

Five worked examples, keyboard Enter, Reset, Copy, bilingual labels/prose, shared playback and a mouse/touch/keyboard timeline are available. Later phases are tracked in PROJECT_STATUS.md.

## Trigonometry Lab — completed Phase 2

The Graphs group includes a draggable/keyboard-accessible unit circle linked to sine/cosine traces with explicit θ axis units and distinct solid/dashed styles. Numeric angle, slider and DEG/RAD switch preserve the same angle. Special-angle buttons show exact recognized reference forms separately from decimal approximations; signs follow quadrants. Tangent is sin/cos, undefined at vertical axes, and its optional graph has asymptote gaps. Near-asymptote finite inputs remain finite. Input angles are bounded to ±360° (±2π radians).

The right-triangle view accepts only acute angles. Shared continuous Play loops a full signed cycle, Pause retains exact position and Replay starts its first angle. Manual Previous/Next and the timeline work with reduced motion. All new controls/prose are bilingual. Browser pointer events exercise the circle gesture; physical-device/screen-reader audits are not claimed.

## Coordinate Geometry — completed Phase 4

The Geometry group includes draggable A/B and distance, midpoint, signed rise/run, line through two points, and parallel/perpendicular examples through C. Numeric coordinates, formulas and the persistent plane stay synchronized. A signed horizontal/vertical construction explains Pythagoras; midpoint halves use different styles. Equal-scale axes are on by default; independent scaling is explicitly marked as distorting angles. Vertical lines use x=constant and undefined slope; coincident points have zero distance and no unique line/slope. Numerical line substitutions are shown without claiming symbolic proof. Values are bounded to ±1,000,000; point handles support mouse, touch, arrows, Shift fine movement and Home.

## Sequence & Series — completed Phase 5

Number & Units contains AP/GP terms, nth term, compensated finite sums and GP infinite-sum conditions. Signed bars/number-line terms handle decreasing APs and alternating GPs. Reversed AP copies explain 2Sₙ=n(a₁+aₙ); GP exponent alignment explains (1−r)Sₙ=a₁(1−rⁿ), with r=1 handled separately. Nonzero infinite series require |r|<1; the zero-first-term series remains zero even otherwise. Up to 10000 terms are calculated and 24 are drawn; large previews are labeled. Overflow and invalid counts reject without clearing inputs. All results are floating-point approximations.

## Probability Lab — completed Phase 6

Statistics includes fair coin/die simulations with selected outcome events. Theoretical probability is an exact fraction; empirical frequencies belong to a separately recorded pseudorandom experiment. Calculate samples a new record, Replay reuses it and manual scrub reveals exact prefix counts. Up to 100000 trials use only 2/6 bars, and frames may reveal many trials. The model assumes fair independent outcomes; past results do not force future results, and larger samples do not guarantee equality with theory. Full-record and currently revealed frequencies are labeled separately.

nPr/nCr support exact BigInt counts for 0≤r≤n≤200, with at most 24 actual arrangements and eight displayed prefix slots. Ordered and unordered previews differ correctly; empty selection counts once. This is an educational simulation/counting tool with no gambling or payout mechanics.

## Complex Number Plane — completed Phase 7

Algebra includes a+bi addition/subtraction, conjugate, modulus/argument and multiplication/division on equal-scale axes. Head-to-tail copies, opposite-vector motion, real-axis reflection and polar scale/rotation preserve the stated mathematical constructions. i multiplication rotates 90° counterclockwise. atan2 retains quadrant information; zero argument is undefined. DEG/RAD changes display only. Scaled division avoids denominator-square underflow; zero division, overflow and unrepresentable nonzero underflow reject with visible errors. Input components are bounded to ±1,000,000 and numerical outputs remain approximate.

## Calculus

- Symbolic derivatives of sums/differences/products/quotients, constant powers, sin/cos/tan, exp/ln/log10/sqrt/cbrt and compositions via the chain rule. Graph/calculus trig uses radians.
- Evaluate derivative and function at a selected point; grow a tangent line through that point with its true slope. Domain holes are not removed by simplification.
- Proper definite integrals: adaptive Simpson quadrature (relative/absolute tolerance target 1e-8, at least 32 leaf panels, max recursion 22, max 50000 evaluations). Trigonometric argument intervals must resolve to a combined phase width ≤π/8 per accepted panel. Work/depth/phase limits give explicit errors. Reported error is an estimate, **not a guaranteed accuracy bound**.
- Signed area shading and 12 animated midpoint Riemann rectangles. The rectangle sum is separate from the Simpson result. Shading follows f(x); reversing bounds reverses the integral sign.
- Conservative interval arithmetic must certify a finite, continuous real function on the interval. Possible poles, tangent asymptotes, invalid domains, overflow, unsupported certification and nonconvergence are errors. No improper or principal-value integrals are silently computed. Some valid integrals can be rejected conservatively.

## Statistics

1–500 observations: count, sum, mean, median, repeated modes, min/max/range, separate population/sample variance and SD, quartiles and IQR. When all values occur once there is no repeated mode. Sample variance/SD is undefined for n = 1.

Quartiles use medians of lower/upper halves, excluding the overall median for odd n; for n = 1, Q1 = Q3 = the observation. Histogram bins have equal width, with midpoint labels and an inclusive final bin. Box-plot whiskers are min/max (not Tukey outlier fences). Optional paired y values produce a scatter plot and simple least-squares regression. Identical x values cannot define a regression; R² is undefined for constant y.

Phase 3 teaching retains unique observation IDs through stable sorting, highlights actual median IDs and animates equal sharing while conserving the weighted signed total. Original reference bars, signed deviations and squared areas explain population/sample variance, including n−1 and its assumptions. Histogram points move into exact bins; the box plot preserves the declared convention; paired-data stages draw the fit and signed vertical residuals. Large data use disclosed bounded sorting previews, ≤20 weighted groups and ≤15 histogram clusters, while all calculations and grouped squared sums use every input. Every individual deviation is available in a text disclosure. There are 9 univariate or 11 paired stages; the scrubber exposes continuous intermediate states.

## Matrix & Vector

1×1 to 4×4 rectangular editors: addition, subtraction, multiplication, transpose; square-matrix determinant/inverse and a square linear system with a right-hand vector. Multiplication steps highlight the actual A row and B column and reveal each output entry.

Partial-pivot Gaussian/Gauss–Jordan elimination is used. Inverse/system solving reject pivots ≤ 1e-12 × maximum matrix entry as singular/ill-conditioned. Determinants retain tiny nonzero pivots but remain approximate. Singular systems are reported as having no reliable unique solution; general rank-parametric solutions are not generated.

Matching 2D/3D vectors support magnitudes and dot products; 3D vectors also support the cross product.

## Number & Unit Tools

- Exact BigInt GCD and LCM for signed integers of up to 100 digits. gcd(0,0) = lcm(0,0) = 0 by this tool's convention.
- Prime checking and prime factorization of |n| by trial division for |n| ≤ 10^12. Negative numbers, 0 and 1 are not prime; 0 and 1 have no prime factorization.
- Exact signed integer base conversion among binary/octal/decimal/hexadecimal, up to 128 input digits; fractional base conversion is not supported.
- Fixed length, area, volume, mass, temperature, angle, time and speed conversion, including affine °C/°F/K formulas and absolute-zero validation. Unit labels and scale/offset substitution are shown. US gallons are explicitly identified. No live currencies.

## Interface, accessibility and known limits

The Forma green identity, original quick calculators and their bug fixes are retained. New lab walkthroughs and the original Algebra have Previous/Next/Play/Pause/Replay, speed and a current-step highlight. Input/tab changes stop stale animation. Reduced-motion preferences suppress curve morph/draw motion and continuous new-lab playback while retaining static results and manual steps.

Light/dark themes and English/Bengali navigation, field labels, common controls and result labels are available. The new teaching lessons, worked examples and formula references are bilingual; some older technical help, worked steps and error prose still require localization (see PROJECT_STATUS.md). SVG mathematical notation remains language neutral. Browser automation verifies keyboard entry, layout, preferences, history and reduced motion; it is not a screen-reader audit or a claim of general arbitrary-precision/symbolic mathematics.

## Files

- `index.html`, `style.css`: original shared structure/design and graph markup.
- `workbench.js`, `workbench.css`: sidebar/drawer/search, shared workspace actions, views, readable professional layout.
- `animation.js`, `lessons.js`: shared RAF player and bounded persistent Arithmetic/Percentage models.
- `notation.js`, `form-feedback.js`: safe AST-backed MathML preview, conservative exactness and accessible validation/results.
- `math.js`, `app.js`: original calculators and Algebra animation, plus navigation.
- `engine.js`: safe parser/evaluator, polynomial AST and symbolic derivative rules.
- `scientific.js`: calculator keypad, memory and persisted history.
- `graph.js`: persistent SVG curves, viewport, tracing, continuity handling and a bounded coefficient-update bridge.
- `graph-teaching.js`: vertex interaction, pinned primary-function reference, prediction activities, worked highlights and root substitution checks.
- `lab-math.js`: geometry/statistics/matrix/vector/integer/unit/integration routines.
- `geometry-lessons.js`: persistent unit-area, rigid-copy, cut-and-move, circle-sector and volume-layer teaching models.
- `fractions.js`: exact bounded BigInt fraction arithmetic, display and continuous teaching models.
- `trigonometry.js`, `statistics-lessons.js`, `coordinates.js`: unit-circle traces, distribution/mean/deviation lessons and interactive coordinate constructions.
- `sequences.js`, `probability.js`, `complex-plane.js`: sequence alignment, reproducible experiments/exact counting and complex vector transformations.
- `workspace-catalog.js`, `workspace-plus.js`, `verification.js`: worked examples/formulas, focus, named saves, scientific-to-graph transfer, exports and root substitution checks.
- `labs.js`: lab controls, results, diagrams and walkthrough player.
- `appearance.js`: theme and reversible English/Bengali UI labels.
- `tests/`: browser assertions and Windows Edge runner.

## Interactive Math Studio

The whole interface now uses a dimensional design: a compact interactive 3D introduction, illustrated topic cards, raised controls, inset fields and framed mathematical stages. New visitors start in navy; existing theme preferences are preserved. **Start calculating** or **Skip intro** opens the current workspace without changing its inputs. **Studio intro** reopens it. **Motion on/off** controls ambient presentation effects independently of lesson playback and respects OS reduced motion.

The introduction shares the locally vendored Three.js loader with Geometry Lab. It pauses offscreen and disposes its renderer when dismissed. Touch users explicitly enable 3D interaction; a matching static mathematical composition appears without WebGL2. The calculators remain usable in either case.

Current dimensional redesign verification: **1,401 assertions across 22 Edge suites**, plus reduced-motion/offline, trusted touch/mouse orbit and real export-download checks. Reports: `tests/dimensional-regression-2026-10-28.json` and `tests/dimensional-additional-2026-10-28.json`. Fresh captures: `tests/dimensional-desktop.png`, `tests/dimensional-mobile.png`, `tests/dimensional-light-workspace.png` and `tests/dimensional-geometry-workspace.png`. Run `tests/dimensional.html` with the browser runner to reproduce the 78 new presentation checks.

Open `index.html` directly in a modern browser. No installation or build step is required. The existing calculators, English/Bengali controls, themes, examples, named saves and graph exports share one responsive workspace.

In Geometry Lab, select cube, cuboid, cylinder, cone or sphere, then choose **3D**. The local, MIT-licensed Three.js r180 dependency loads on demand. Use camera presets or drag to rotate; on mobile, enable **Interact with 3D** first. Cube/cuboid lessons include a labeled surface net. Sphere slices, cylinder unrolling and solid layers use the same progress as the shared lesson player. The orthographic stage fits the construction to its container; 2D remains available without WebGL2.

Earlier geometry checkpoint (2026-10-28): 1,323 assertions across 21 distinct Edge suites, plus additional reduced-motion, offline, gesture and actual export-download checks. See `PROJECT_STATUS.md` and `tests/studio-verification-2026-10-28.json`. Earlier visual captures: `tests/studio-desktop-2026-10-28.png` and `tests/studio-mobile-2026-10-28.png`. Local-file offline use is verified; hosted PWA caching is not provided.

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File tests/run-browser.ps1 -Page studio-layout.html
powershell -NoProfile -ExecutionPolicy Bypass -File tests/run-browser.ps1 -Page studio-3d.html
powershell -NoProfile -ExecutionPolicy Bypass -File tests/run-browser.ps1 -Page solid-lessons.html
```

## Browser checks

Windows with Edge installed at the standard location. No package installation is required. From the project folder:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File tests/run-browser.ps1 -Page regression.html
powershell -NoProfile -ExecutionPolicy Bypass -File tests/run-browser.ps1 -Page graph.html
powershell -NoProfile -ExecutionPolicy Bypass -File tests/run-browser.ps1 -Page suite.html
powershell -NoProfile -ExecutionPolicy Bypass -File tests/run-browser.ps1 -Page persistence.html
powershell -NoProfile -ExecutionPolicy Bypass -File tests/run-browser.ps1 -Page workbench.html
powershell -NoProfile -ExecutionPolicy Bypass -File tests/run-browser.ps1 -Page graph-reduced-motion.html -ReducedMotion
powershell -NoProfile -ExecutionPolicy Bypass -File tests/run-browser.ps1 -Page graph-teaching.html -GraphDrag
powershell -NoProfile -ExecutionPolicy Bypass -File tests/run-browser.ps1 -Page graph-teaching.html -GraphDrag -ReducedMotion -Width 390 -Height 1100
powershell -NoProfile -ExecutionPolicy Bypass -File tests/run-browser.ps1 -Page integration.html
powershell -NoProfile -ExecutionPolicy Bypass -File tests/run-browser.ps1 -Page geometry.html
powershell -NoProfile -ExecutionPolicy Bypass -File tests/run-browser.ps1 -Page geometry.html -ReducedMotion
powershell -NoProfile -ExecutionPolicy Bypass -File tests/run-browser.ps1 -Page fractions.html -TimelineDrag
powershell -NoProfile -ExecutionPolicy Bypass -File tests/run-browser.ps1 -Page fractions.html -TimelineDrag -ReducedMotion -Width 390 -Height 1250
```

Each run uses a separate temporary headless Edge profile, allows local-file iframe access, communicates with its local DevTools port and closes the browser. Tests use real animation frames and wall-clock timing. `-ExecutionPolicy Bypass` applies to that test process only. Optional screenshot: `-Screenshot <absolute-path.png> -Preview scientific -Width 1500 -Height 1250`; `-DarkPreview` captures the dark theme. Temporary profiles remain in the OS temp directory.
Historical verification (2026-10-26): **1084 assertions passed across 19 real Edge suites**, with zero console/runtime errors. Ten learning suites also passed with reduced motion; trusted mouse/touch gestures and actual SVG/PNG button downloads passed. The newer Math Studio checkpoint above records current runs and fresh screenshots. Detailed counts and remaining teaching work are recorded in PROJECT_STATUS.md. Run the suites against the current files; an old report is not a substitute for execution.

## Integrated workspace (Phase 8)

- Every tool has Beginner, Intermediate and Advanced worked examples (54 total). The searchable formula reference describes symbols, units and assumptions. Focus view enlarges the active workspace; Escape returns to the normal view.
- Scientific expressions containing x can be sent to Graph Explorer. DEG trigonometric expressions are explicitly converted to equivalent RAD graph expressions, and historical Ans is frozen. Unsupported expressions explain why they cannot be plotted. Algebra roots show substitution residuals and numerical tolerances; these are checks, not symbolic proofs.
- Named calculations are local to this browser: save, reopen, rename or delete up to 50 records. Reopening restores inputs, view and relevant context, including scientific Ans/memory, graph reference/viewport and the same probability simulation record. This is separate from scientific history. Names are limited to 60 characters, fields to 10000 characters and stored JSON to 2 MB. Storage failures are disclosed. No cloud synchronization or import is provided.
- Graph SVG/PNG downloads include the equation, axes, ticks, comparison legend and theme background. PNG creation is bounded to 12 million pixels. Export operates on the current graph state.
- Additional browser pages: integration, geometry, fractions, trigonometry, statistics-teaching, coordinates, sequences, probability, complex, workspace-plus, workspace-persistence and workspace-layout. Pass each name with `.html` to the same runner; use `-ReducedMotion` to repeat learning suites. `-ExportDownloads` on workspace-plus verifies actual SVG and PNG downloads.

## Graph Explorer investigations

- Drag the V handle with mouse/touch, or focus it and use Arrow keys (1 unit), Shift+Arrow (0.1 unit), and Home (origin). `a` stays fixed; `b = −2ah` and `c = ah² + k` update the same inputs, sliders and graph. The viewport stays fixed during vertex movement. The existing −20…20 coefficient bounds project the requested vertex to a valid position with an explicit limit message. At `a=0` there is no quadratic vertex and dragging is disabled with a reason. Reset vertex preserves `a`; the main Reset restores all default parameters and clears the reference/activity. Reset view only resets the viewport.
- Pin current as Before snapshots the **primary** function and its parameters, including a custom primary function. Its orange dashed curve stays fixed while the green solid current/After curve changes. Clear reference removes it. Reference sampling retains continuity checks at poles. Pinned curves outside the viewport are clipped to the same coordinate plane.
- Optional Predict, then explore asks about a sign/size or c change before applying it. The question states exactly which coefficient changes and keeps the others fixed. At the maximum |a| it asks about decreasing |a|; from a=0 it correctly describes becoming a parabola. Parameter/family edits reset the pending activity.
- Why buttons show worked examples as a labeled purple dotted overlay without changing the user's function. Examples explain squared-distance sign, the inverse-square-root width relationship at a fixed height, and vertical translation.
- Real roots are substituted into the original polynomial with full floating-point precision. The readout shows residual and tolerance `10⁻⁹ × max(1, |ax²| + |bx| + |c|)`; displayed roots are rounded. Unverifiable overflow scales are disclosed. Complex roots have no real-axis marker. This is a numerical check, not a symbolic proof.
- Pointer capture/cancellation separates vertex movement from panning. Input/tool changes cancel old dragging/playback. All new controls/help are English/Bengali, the original light/dark theme remains, and reduced motion keeps manual dragging/keyboard/prediction usable without curve morphing. Browser touch emulation is tested; physical-device and full screen-reader audits are not claimed.
=======
# forma-math-studio
An interactive math studio with scientific calculators, visual explanations, and 3D animations.
>>>>>>> 963a3964b1d7618a3cd1980c811f418e62bb829a
