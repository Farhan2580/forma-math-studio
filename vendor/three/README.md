# Locally vendored Three.js 0.180.0 (r180)

MIT license: see LICENSE. Both the renderer and OrbitControls are pinned to the same npm release.

Sources downloaded from https://cdn.jsdelivr.net/npm/three@0.180.0/:
- build/three.cjs (retained verbatim)
- examples/jsm/controls/OrbitControls.js (retained as OrbitControls.source.js)
- LICENSE

For this build-free, file-opening application, three.global.js wraps the official single-file CommonJS build in `(function(exports){ … })(window.THREE = {});`. OrbitControls.js wraps its matching source in an IIFE, replacing the `three` import with destructuring from window.THREE and its final export with window.FormaOrbitControls. No renderer/control algorithms are changed. This avoids runtime CDN requests and module CORS issues on file URLs. Both browser scripts load through one shared on-demand promise for a supported 3D lesson or the visible studio introduction.

Official documentation consulted: https://threejs.org/docs/pages/OrbitControls.html, https://threejs.org/docs/pages/WebGLRenderer.html and https://threejs.org/manual/pages/installation.html. Rendering is on demand; controls have damping and auto-rotation disabled. Owned resources and listeners are disposed when leaving/rebuilding a lesson. WebGL2 is required for r180; the complete SVG lesson remains available without it.

The dimensional website introduction now shares this loader through `FormaGeometry3D.load()`. Its visible panel can load the scripts before a geometry lesson is opened; collapsed/offscreen introductions do not initiate a load. The introduction uses procedural geometry and disposes its own renderer when dismissed. Ambient frames run only while visible and motion is enabled; camera controls otherwise request individual frames. No vendored source or version was changed for the redesign. Current rendering guidance reviewed: https://threejs.org/manual/pages/rendering-on-demand.html.
