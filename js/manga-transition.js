/**
 * Anime Nexus - Dynamic "Manga Ink" Transition Shaders (WebGL & GLSL)
 * 
 * Replaces standard page cuts with an authentic sumi-e manga ink-dissolve shader:
 * - Bursts the screen outward into high-contrast monochrome Halftone screentone dots
 * - Employs Fractal Brownian Motion (FBM) ink splatter & bleed thresholds
 * - Radiates manga speedlines from the focal burst center
 * - Swaps views cleanly at peak inking before dissolving smoothly into the selected anime list
 */

import { soundFXMatrix } from './audio.js';

export class MangaInkTransitionEngine {
  constructor() {
    this.canvas = null;
    this.gl = null;
    this.program = null;
    this.positionBuffer = null;
    this.uniforms = {};
    this.isTransitioning = false;
    this.startTime = 0;
    this.duration = 750; // ms
    this.midpointExecuted = false;
    this.onMidpoint = null;
    this.onComplete = null;
    this.rafId = null;
  }

  init(canvasId = 'manga-transition-canvas') {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) {
      this.canvas = document.createElement('canvas');
      this.canvas.id = canvasId;
      this.canvas.className = 'manga-transition-canvas';
      this.canvas.style.cssText = 'position:fixed;inset:0;width:100vw;height:100vh;pointer-events:none;z-index:99999;display:none;';
      document.body.appendChild(this.canvas);
    }

    try {
      this.gl = this.canvas.getContext('webgl', { alpha: true, antialias: true, premultipliedAlpha: false }) 
             || this.canvas.getContext('experimental-webgl');
      if (!this.gl) {
        console.warn('[MangaInkTransition] WebGL not supported, will use 2D canvas fallback.');
        return;
      }

      this.initShaders();
      this.initBuffers();
      this.resize();
      window.addEventListener('resize', () => this.resize());
    } catch (e) {
      console.warn('[MangaInkTransition] WebGL init error:', e);
    }
  }

  initShaders() {
    const gl = this.gl;

    const vsSource = `
      attribute vec2 a_position;
      varying vec2 v_uv;
      void main() {
        v_uv = (a_position + 1.0) * 0.5;
        // Flip Y for standard screen coordinates
        v_uv.y = 1.0 - v_uv.y;
        gl_Position = vec4(a_position, 0.0, 1.0);
      }
    `;

    const fsSource = `
      precision highp float;
      varying vec2 v_uv;
      uniform float u_progress;   // 0.0 to 1.0
      uniform float u_time;
      uniform vec2 u_resolution;
      uniform float u_dotSize;    // Screentone frequency
      uniform float u_angle;      // 45 degree screentone rotation

      // High-performance hash & noise functions
      float hash(vec2 p) {
        return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
      }

      float noise(vec2 p) {
        vec2 i = floor(p);
        vec2 f = fract(p);
        vec2 u = f * f * (3.0 - 2.0 * f);
        return mix(mix(hash(i + vec2(0.0, 0.0)), hash(i + vec2(1.0, 0.0)), u.x),
                   mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
      }

      float fbm(vec2 p) {
        float v = 0.0;
        float a = 0.5;
        mat2 rot = mat2(cos(0.5), sin(0.5), -sin(0.5), cos(0.5));
        for (int i = 0; i < 4; i++) {
          v += a * noise(p);
          p = rot * p * 2.0 + vec2(100.0);
          a *= 0.5;
        }
        return v;
      }

      void main() {
        vec2 uv = v_uv;
        vec2 center = vec2(0.5, 0.5);
        vec2 toCenter = uv - center;
        // Correct aspect ratio for circular effects
        toCenter.x *= (u_resolution.x / u_resolution.y);
        float dist = length(toCenter);
        float angle = atan(toCenter.y, toCenter.x);

        // 1. Fractal Ink Bleed & Splatter
        float inkNoise = fbm(uv * 7.0 + vec2(u_time * 0.4));
        float splatter = fbm(uv * 24.0);

        // 2. Manga Screentone Halftone Dot Matrix (45 degree rotated grid)
        float s = sin(u_angle);
        float c = cos(u_angle);
        vec2 rotUV = vec2(c * uv.x - s * uv.y, s * uv.x + c * uv.y);
        rotUV.x *= (u_resolution.x / u_resolution.y);
        vec2 dotGrid = fract(rotUV * u_dotSize) - vec2(0.5);
        float dotDist = length(dotGrid);

        // 3. Manga Action Radial Speed Lines
        float speedLines = sin(angle * 56.0 + u_time * 12.0) * 0.5 + 0.5;
        speedLines = step(0.68, speedLines) * (1.0 - smoothstep(0.1, 0.85, dist));

        // 4. Inking Colors: Sumi-e Black vs Pure Comic Paper White
        vec3 inkBlack = vec3(0.04, 0.04, 0.06);     // Dark manga sumi-e ink
        vec3 paperWhite = vec3(0.96, 0.97, 0.99);   // Off-white manga print paper
        vec3 accentRed = vec3(0.94, 0.27, 0.27);    // Shounen comic splash red

        float alpha = 0.0;
        vec3 color = inkBlack;

        if (u_progress < 0.5) {
          // Burst Outward Phase: Screen dissolves into expanding halftone dots & ink splashes
          float p = u_progress * 2.0; // 0.0 -> 1.0
          float shockwave = p * 1.5;
          float inkMask = 1.0 - smoothstep(shockwave - 0.2, shockwave + 0.25, dist + (inkNoise - 0.5) * 0.35);

          // Dot expansion based on distance and energy
          float dotRadius = clamp(0.55 * p * (1.0 - dist * 0.6) + splatter * 0.15, 0.0, 0.7);
          float isDot = step(dotRadius, dotDist);

          // Halftone screentone fill
          color = mix(inkBlack, paperWhite, isDot);
          if (speedLines > 0.5 && dist > 0.15) {
            color = inkBlack;
          }
          if (splatter > 0.72) {
            color = accentRed; // High-energy Japanese splash accent
          }

          alpha = inkMask;
        } else {
          // Inward / Outward Dissolve Phase: Resolving smoothly into selected anime list
          float p = (u_progress - 0.5) * 2.0; // 0.0 -> 1.0
          float dissolveRadius = p * 1.6;
          float dissolve = smoothstep(dissolveRadius - 0.25, dissolveRadius + 0.2, dist + (inkNoise - 0.5) * 0.3);

          // Shrinking dots
          float dotRadius = clamp(0.55 * (1.0 - p) * (1.0 - dist * 0.6), 0.0, 0.7);
          float isDot = step(dotRadius, dotDist);

          color = mix(inkBlack, paperWhite, isDot);
          if (speedLines > 0.5) color = inkBlack;

          alpha = 1.0 - dissolve;
        }

        // Vignette edges fade
        alpha = clamp(alpha, 0.0, 1.0);
        alpha *= smoothstep(0.0, 0.04, u_progress) * smoothstep(1.0, 0.94, u_progress);

        gl_FragColor = vec4(color, alpha);
      }
    `;

    const vs = this.compileShader(gl.VERTEX_SHADER, vsSource);
    const fs = this.compileShader(gl.FRAGMENT_SHADER, fsSource);

    this.program = gl.createProgram();
    gl.attachShader(this.program, vs);
    gl.attachShader(this.program, fs);
    gl.linkProgram(this.program);

    if (!gl.getProgramParameter(this.program, gl.LINK_STATUS)) {
      console.error('[MangaInkTransition] Program link error:', gl.getProgramInfoLog(this.program));
      return;
    }

    this.uniforms = {
      progress: gl.getUniformLocation(this.program, 'u_progress'),
      time: gl.getUniformLocation(this.program, 'u_time'),
      resolution: gl.getUniformLocation(this.program, 'u_resolution'),
      dotSize: gl.getUniformLocation(this.program, 'u_dotSize'),
      angle: gl.getUniformLocation(this.program, 'u_angle')
    };
  }

  compileShader(type, source) {
    const gl = this.gl;
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.error('[MangaInkTransition] Shader compile error:', gl.getShaderInfoLog(shader));
    }
    return shader;
  }

  initBuffers() {
    const gl = this.gl;
    // Fullscreen quad in clip space (-1 to 1)
    const vertices = new Float32Array([
      -1.0, -1.0,
       1.0, -1.0,
      -1.0,  1.0,
      -1.0,  1.0,
       1.0, -1.0,
       1.0,  1.0
    ]);

    this.positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
  }

  resize() {
    if (!this.canvas) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = window.innerWidth;
    const h = window.innerHeight;
    this.canvas.width = w * dpr;
    this.canvas.height = h * dpr;
    if (this.gl) {
      this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    }
  }

  /**
   * Execute Manga Ink Transition:
   * 1. Screen bursts outward into monochrome Halftone dots & sumi-e ink
   * 2. Plays procedural ink splatter & bubbling halftone sound FX
   * 3. At 50% progress, executes onMidpoint() to swap views in the background DOM
   * 4. Dissolves outward to reveal selected anime list
   */
  execute(onMidpoint, onComplete) {
    if (this.isTransitioning) {
      if (onMidpoint) onMidpoint();
      return;
    }

    this.isTransitioning = true;
    this.midpointExecuted = false;
    this.onMidpoint = onMidpoint;
    this.onComplete = onComplete;
    this.startTime = performance.now();

    // Show canvas
    if (this.canvas) {
      this.canvas.style.display = 'block';
      this.resize();
    }

    // Trigger procedural Web Audio sounds
    soundFXMatrix.playMangaInkSplatter();
    soundFXMatrix.playHalftoneDotPop();

    // Start render loop
    if (this.rafId) cancelAnimationFrame(this.rafId);
    this.renderLoop();
  }

  renderLoop() {
    const now = performance.now();
    const elapsed = now - this.startTime;
    const progress = Math.min(1.0, elapsed / this.duration);

    // Midpoint trigger: swap DOM content underneath when screen is covered by ink
    if (progress >= 0.5 && !this.midpointExecuted) {
      this.midpointExecuted = true;
      if (typeof this.onMidpoint === 'function') {
        try {
          this.onMidpoint();
        } catch (e) {
          console.error('[MangaInkTransition] Error in onMidpoint:', e);
        }
      }
    }

    if (this.gl && this.program) {
      const gl = this.gl;
      gl.useProgram(this.program);

      // Bind quad
      const posAttr = gl.getAttribLocation(this.program, 'a_position');
      gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
      gl.enableVertexAttribArray(posAttr);
      gl.vertexAttribPointer(posAttr, 2, gl.FLOAT, false, 0, 0);

      // Uniforms
      gl.uniform1f(this.uniforms.progress, progress);
      gl.uniform1f(this.uniforms.time, elapsed * 0.001);
      gl.uniform2f(this.uniforms.resolution, this.canvas.width, this.canvas.height);
      gl.uniform1f(this.uniforms.dotSize, 38.0);
      gl.uniform1f(this.uniforms.angle, 0.785398); // 45 degrees in radians

      // Enable blending for smooth ink transparency
      gl.enable(gl.BLEND);
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

      // Draw
      gl.drawArrays(gl.TRIANGLES, 0, 6);
    }

    if (progress < 1.0) {
      this.rafId = requestAnimationFrame(() => this.renderLoop());
    } else {
      // Transition complete: hide canvas and clean up
      this.isTransitioning = false;
      if (this.canvas) {
        this.canvas.style.display = 'none';
      }
      if (typeof this.onComplete === 'function') {
        this.onComplete();
      }
    }
  }
}

export const mangaTransition = new MangaInkTransitionEngine();
