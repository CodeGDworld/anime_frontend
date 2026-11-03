# ⚡ Anime Nexus - Full Stack Platform with 3D Video Shaders, Manga Transitions & ML

A production-grade, full-stack anime recommendation platform featuring:
* **🎨 Dynamic Category Background Colors & Eye-Friendly Home Theme**: Each category dynamically transforms the entire page background palette, hero banner glow, card ambiance, and modal halo to match its world (e.g. healing sakura peach for Slice of Life, obsidian violet for Mystery, crimson fire for Action, glacial frost for Winter). The Home Page features a comfortable, eye-friendly twilight slate & soft indigo nebula palette.
* **🎬 Video-to-3D Shader Pipeline (WebCodecs & WebGL / Three.js)**: Uses hidden HTML5 `<video>` tags (`autoplay muted loop playsinline style="display: none;"`) bound to `THREE.VideoTexture` as emissive maps and particle billboard materials to project 60 FPS animation sequences directly through 3D meshes without dropping frames.
* **🖤 Dynamic "Manga Ink" Transition Shaders**: Custom GLSL fragment shader that bursts the screen outward into high-contrast monochrome Halftone dots (manga screentone style) and sumi-e ink bleeds before resolving cleanly into the selected anime list.
* **🔊 Custom Sound-FX Matrix (Web Audio API)**: Zero-asset procedural synthesizer matrix with master dynamics compression, waveshaper overdrive distortion, ink splatter acoustics, bubbling halftone pops, and authentic attack sound synthesis.
* **🎲 3D Iconic Cube Paging ("Cube Figuring")**: Interactive 3D polyhedron with circular gyroscope orbit dial navigation and 3D polygon ring carousel for category anime entries.
* **🖼️ Authentic Official Anime Key Visual Posters**: All 130 curated anime feature authentic official anime poster art from MyAnimeList CDNs paired with dynamic fallback SVG anime poster generators with Japanese calligraphy and studio badges.
* **🤖 Logistic Regression Machine Learning Model**: Built from first principles following strict ML best practices (binary classification, standardized features, holdout test metrics, confusion matrix, and an interactive ML studio).
* **💥 3D Anime Signature Attack Moves**: Real-time canvas attack animations (Kamehameha, Serious Punch, Sakura Vortex, Domain Expansion, Ice Glaciation, Solar Flare).
* **🥊 Interactive Saitama Hero Assistant**: Floating interactive mascot with dialogue bubble, action triggers, and advice.
* **👑 Admin Command Center**: Telemetry analytics, anime catalog CRUD operations, and hero users registry.
* **👤 User Panel & Hero Profile**: Custom avatars, combat power level calculation, and personal preferences.
* **❤️ Favorites Vault**: Persistent anime favorites synchronized across devices in real-time.
* **🔐 Authentication**: Login & registration powered by PBKDF2 cryptographic hashing and HMAC-SHA256 JWT tokens.

---

## 🎬 A. Video-to-3D Shader Pipeline (WebCodecs & WebGL / Three.js)

The platform projects authentic high-speed anime attack sequences directly through 3D meshes:

### 1. Zero-Frame-Drop Video Element Setup
* Hidden HTML5 `<video>` tags are initialized with:
  ```html
  <video id="video-source-kamehameha" autoplay muted loop playsinline style="display: none;"></video>
  <video id="video-source-serious_punch" autoplay muted loop playsinline style="display: none;"></video>
  <video id="video-source-domain_expansion" autoplay muted loop playsinline style="display: none;"></video>
  ```
* Continuous 60 FPS sakuga animation sequences are generated and piped into `video.srcObject = canvas.captureStream(60)`.
* Custom MP4 video clips can also be loaded on-the-fly via the 3D Hologram Arena controls.

### 2. Three.js Emissive Texture & Particle Billboard Projection
* **THREE.VideoTexture**:
  ```javascript
  const videoTexture = new THREE.VideoTexture(videoElement);
  videoTexture.minFilter = THREE.LinearFilter;
  videoTexture.magFilter = THREE.LinearFilter;
  videoTexture.format = THREE.RGBAFormat;
  videoTexture.generateMipmaps = false; // Zero dropped frames optimization
  ```
* **Projection 1: 3D Curved Emissive Mesh**:
  A 3D cylindrical hologram screen (`CylinderGeometry`) with `THREE.MeshStandardMaterial`:
  `material.emissiveMap = videoTexture`, `material.emissiveIntensity = 2.2`, radiating glowing cyan and crimson light.
* **Projection 2: 3D Particle Billboard Cloud**:
  A volumetric field of 1,200 particle billboards (`THREE.Points`) surrounding the screen that reacts to video brightness, giving the impression that energy beams and shockwaves are physically leaping out of the 3D hologram.
* **Camera Orbit**: Interactive mouse drag and touch rotation in 3D space with telemetry HUD displaying live FPS and Ki energy output.

---

## 🖤 B. Dynamic "Manga Ink" Transition Shaders (WebGL & GLSL)

Instead of standard abrupt page cuts, route transitions execute a custom GLSL fragment shader:

### 1. Shading Pipeline
* Rendered onto a full-screen WebGL overlay canvas (`#manga-transition-canvas`).
* **Monochrome Inking & Halftone Dots**:
  * 45-degree rotated 2D grid matrix calculates screentone halftone dots:
    $$\text{dotDist} = \left\| \text{fract}(\text{rotUV} \cdot u_{\text{dotSize}}) - 0.5 \right\|$$
  * Dot radius scales dynamically with transition progress and distance from center.
* **Fractal Ink Splatter & Bleed**:
  * Employs 4-octave Fractal Brownian Motion (FBM) noise to simulate organic Japanese sumi-e ink bleeding across manga paper.
  * Radial action speedlines burst outward from the impact center.
* **Peak Midpoint Swap**:
  * At $50\%$ progress (when the screen is fully covered by manga ink and exploding halftone dots), the DOM view swaps in the background to the selected anime list with zero pop or layout glitch.
  * As progress completes, the ink droplets dissolve outward into the corners, revealing the selected anime list with high-impact sakuga flair!

---

## 🔊 C. Custom Sound-FX Matrix (Web Audio API)

A complete procedural synthesizer matrix built natively with the Web Audio API (zero external sound file downloads, zero latency, 100% offline reliability):

1. **Master Bus**:
   * `AudioContext` $\to$ `DynamicsCompressorNode` (`threshold: -18dB`, `knee: 12dB`, `ratio: 10`, `attack: 0.003s`) $\to$ `MasterGainNode`.
   * Precomputed Hyperbolic Tangent waveshaper curve for overdriven anime combat impact.
2. **Transition Acoustics**:
   * `playMangaInkSplatter()`: Resonant bandpass-filtered noise burst simulating wet sumi-e brush impact on paper.
   * `playHalftoneDotPop()`: Staccato sequence of 10 micro-tone frequency-modulated sine bursts that rapidly pop as screentone dots burst outward.
3. **Attack Move Synthesizers**:
   * `playKamehameha()`: Dual-stage FM Ki charge sweep ($95\text{Hz} \to 880\text{Hz}$) + sub-bass blast boom ($35\text{Hz}$) + screaming whiteout energy beam.
   * `playSeriousPunch()`: $25\text{Hz}$ deep physical sub-bass thump + waveshaped overdrive distortion + atmospheric decompression hiss.
   * `playDomainExpansion()`: Ancient Buddhist bronze temple gong ($180\text{Hz}, 356\text{Hz}, 724\text{Hz}$) with ring modulation and $3.0\text{s}$ metallic decay.
   * `playSakuraVortex()`: Pentatonic crystalline arpeggio ($E_5, G_5, A_5, B_5, D_6$) with tape delay flutter and pink noise wind.
   * `playIceGlaciation()`: Multi-tap FM glass shattering crackle mimicking fracture lines spreading through ice.
   * `playSolarFlare()`: Low-frequency thermal rumble ($75\text{Hz}$) ramping up to a sizzling white noise solar wind ($4200\text{Hz}$).
4. **Mechanical & UI Feedback**:
   * `playCubeGyroClack()`: Damped mechanical ratchet click for the 3D category cube gyroscope dial.
   * `playClick()`, `playWhoosh()`, `playSparkleBurst()`.

---

## 🎲 3D Iconic Cube Paging & Anime Poster Visuals

### 1. 3D Category Cube Navigator ("Cube Figuring")
* **Interactive 3D Polyhedron**: Rendered with true CSS 3D perspectives (`perspective: 1400px`, `transform-style: preserve-3d`).
* **Circular Gyroscope Orbit Dial**: Users can drag their cursor/touch in a circular arc around the dial to spin the 3D cube in real-time.
* **Dimensional Snapping**: Passing the $90^\circ$ threshold flips the cube face to the next category with ratchet audio FX.
* **Quick Controls**: Prev Face, Next Face, Auto-Spin toggle, and dimensional filters (All 13 Categories, Genres, Seasons, Demographics).

### 2. 3D Anime Poster Carousel (In-Category Paging)
* **3D Cylindrical Ring**: Maps the 10 anime entries in any category onto a 10-sided polygon in 3D space (`rotateY(angle) translateZ(420px)`).
* **View Switcher**: Dual modes available at any time:
  * `[🎲 3D Cube Paging]`: Smooth 3D orbiting, card depth shine, keyboard arrow navigation, and circular dot paging.
  * `[🗂️ Grid View]`: Classic responsive card shelf with instant sorting by rating, year, and title.

---

## 🤖 Logistic Regression Machine Learning System

The platform features an integrated **Binary Logistic Regression Classifier** built following strict Machine Learning best practices:

### 1. Mathematical Foundation
* **Hypothesis (Sigmoid Activation)**:
  $$P(\text{Popular}=1 \mid X) = \sigma(z) = \frac{1}{1 + e^{-z}}$$
* **Objective Function (Binary Cross-Entropy with $L_2$ Ridge Regularization)**:
  $$J(w, b) = -\frac{1}{m} \sum_{i=1}^{m} \left[ y^{(i)} \ln(\hat{y}^{(i)}) + (1 - y^{(i)}) \ln(1 - \hat{y}^{(i)}) \right] + \frac{\lambda}{2m} \sum_{j=1}^{d} w_j^2$$
* **Evaluation on 20% Holdout Test Set**:
  * **Accuracy**: **80.8%**
  * **Recall**: **100.0%** (Identified 100% of viral hit anime)
  * **F1-Score**: **0.615**
  * **Confusion Matrix**: $TP = 4, FP = 5, TN = 17, FN = 0$

---

## 🎨 Dynamic Category Background Colors & Eye-Friendly Home Theme

### 1. User-Friendly Home Background
* Replaced the harsh pitch-black background with a modern, eye-friendly **Midnight Twilight Slate & Soft Indigo Aurora** palette (`#0c101d` to `#0e1424`).
* Radial multi-point ambient lights soften contrast and enhance readability across titles, tags, ratings, and lore descriptions during long browsing sessions.

### 2. 13 Dynamic Category Worlds
Navigating to any category automatically transitions the entire screen background, hero banner glow, card ambiances, and detail modals:
* **🌸 Slice of Life**: Healing Sakura Rose & Peach Twilight (`#150d18` with `#f472b6` sakura blooms)
* **🔮 Mystery & Thriller**: Enigmatic Obsidian Violet & Cyber Cyan (`#0b0716` with `#8b5cf6` deduction purple)
* **⚡ Action & Battle**: Crimson Charcoal & Electric Ki Cyan (`#14070a` with `#ef4444` battle red)
* **💖 Romance**: Velvet Twilight Wine & Sunset Rose Gold (`#160815` with `#ec4899` romantic blush)
* **🌱 Spring (Haru)**: Haru Renewal Mint & Cherry Blossom (`#091410` with `#10b981` fresh emerald)
* **☀️ Summer (Natsu)**: Sunburst Amber & Azure Ocean (`#141108` with `#f59e0b` solar gold)
* **🍂 Autumn (Aki)**: Crimson Maple Foliage & Burnt Amber (`#150a06` with `#ea580c` autumn flame)
* **❄️ Winter (Fuyu)**: Crystalline Glacial Arctic Cyan & Diamond Frost (`#07101a` with `#38bdf8` icy glow)
* **🔥 Shounen**: Volcanic Warrior Flame & Burning Ki (`#150804` with `#f97316` shounen fire)
* **✨ Shoujo**: Celestial Magical Starlight Lavender & Rose Quartz (`#140918` with `#c084fc` starlight)
* **🎈 Kodomo**: Joyful Sunshine Gold & Sky Blue Wonder (`#141207` with `#eab308` warm sun)
* **⚔️ Seinen**: Atmospheric Cold Steel Slate & Gritty Charcoal (`#0b0e14` with `#64748b` titanium)
* **🍷 Josei**: Sophisticated Velvet Orchid & Wine Plum (`#130716` with `#a855f7` royal wine)

---

## 🚀 How to Run the Full Stack Application

```powershell
cd c:\Users\HP\Documents\my_all_projects\anime_frontend

# Start full stack server:
npm start
# Or directly:
node server/index.js
```

Then open your browser at:
👉 **`http://localhost:3000`**

### Pre-Seeded Accounts
* **Admin**: `admin@animenexus.io` / `admin123`
* **User**: `saitama@hero.com` / `punch123`
