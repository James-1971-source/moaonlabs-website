'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';

type SceneMode = 'core' | 'network';
type NeuralSceneProps = {
  mode: SceneMode;
  paused: boolean;
  onReady?: (ready: boolean) => void;
};
type SceneControls = { refresh: () => void; sync: () => void };

const CYAN = '#8cfbe5';
const VIOLET = '#a298ff';
const COBALT = '#3f5fff';

const coreVertex = /* glsl */ `
  uniform float uTime;
  uniform float uNetwork;
  varying vec3 vNormal;
  varying vec3 vPosition;
  varying vec3 vLocal;
  void main() {
    vec3 p = position;
    float breath = sin(uTime * .65 + position.y * 1.7) * .012;
    p *= 1.0 + breath + uNetwork * .035;
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    vNormal = normalize(normalMatrix * normal);
    vPosition = mv.xyz;
    vLocal = position;
    gl_Position = projectionMatrix * mv;
  }
`;

const coreFragment = /* glsl */ `
  uniform float uTime;
  uniform float uNetwork;
  varying vec3 vNormal;
  varying vec3 vPosition;
  varying vec3 vLocal;
  void main() {
    // Screen-space derivatives preserve crisp, chrome-like triangular facets.
    vec3 n = normalize(cross(dFdx(vPosition), dFdy(vPosition)));
    vec3 view = normalize(-vPosition);
    float facing = max(dot(n, view), 0.0);
    float fresnel = pow(1.0 - facing, 2.7);
    vec3 reflection = reflect(-view, n);
    float spectrum = .5 + .5 * sin(reflection.y * 5.0 + reflection.x * 3.1 + uTime * .15);
    vec3 tint = mix(vec3(.247, .373, 1.0), vec3(.635, .596, 1.0), spectrum);
    tint = mix(tint, vec3(.549, .984, .898), smoothstep(.15, .8, reflection.x));
    float softbox = pow(max(dot(reflection, normalize(vec3(-.8, 1.2, 1.1))), 0.0), 18.0);
    float strip = pow(max(1.0 - abs(reflection.y - .46), 0.0), 65.0);
    float rim = pow(max(dot(n, normalize(vec3(1.0, -.2, .4))), 0.0), 5.0);
    float grain = sin(vLocal.x * 15.0 + sin(vLocal.z * 11.0) + uTime * .3) * .018;
    vec3 color = vec3(.018, .028, .055) + tint * (.14 + facing * .12 + grain);
    color += tint * fresnel * 1.25 + vec3(.75, .96, 1.0) * softbox * 1.6;
    color += mix(vec3(.6, .8, 1.0), tint, .5) * strip * .65;
    color += vec3(.25, .33, .95) * rim * .25;
    color += tint * uNetwork * .08;
    gl_FragColor = vec4(color, 1.0);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;

const glowVertex = /* glsl */ `
  varying vec3 vNormal;
  varying vec3 vView;
  void main() {
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vNormal = normalize(normalMatrix * normal);
    vView = normalize(-mv.xyz);
    gl_Position = projectionMatrix * mv;
  }
`;
const glowFragment = /* glsl */ `
  uniform vec3 uColor;
  uniform float uOpacity;
  varying vec3 vNormal;
  varying vec3 vView;
  void main() {
    float facing = abs(dot(normalize(vNormal), normalize(vView)));
    float halo = pow(1.0 - facing, 3.0) * smoothstep(0.0, .22, facing);
    gl_FragColor = vec4(uColor, halo * uOpacity);
    #include <colorspace_fragment>
  }
`;

const particleVertex = /* glsl */ `
  attribute float aSize;
  attribute float aPhase;
  attribute vec3 aColor;
  uniform float uTime;
  uniform float uPixelRatio;
  uniform float uNetwork;
  varying vec3 vColor;
  varying float vOpacity;
  void main() {
    vec3 p = position;
    float drift = uTime * .055 + aPhase;
    p.x += sin(drift + p.y) * .07;
    p.y += cos(drift + p.z) * .07;
    p *= 1.0 + uNetwork * .12;
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = clamp(aSize * uPixelRatio * (13.0 / max(-mv.z, .5)), 1.0, 9.0);
    vColor = aColor;
    vOpacity = (.35 + .25 * sin(aPhase + uTime * .42)) * (1.0 - smoothstep(3.0, 12.0, -mv.z));
  }
`;
const particleFragment = /* glsl */ `
  varying vec3 vColor;
  varying float vOpacity;
  void main() {
    float d = length(gl_PointCoord - .5);
    if (d > .5) discard;
    float glow = pow(1.0 - d * 2.0, 2.0);
    gl_FragColor = vec4(vColor, glow * vOpacity);
    #include <colorspace_fragment>
  }
`;

/** Decorative, self-contained WebGL scene. No assets, network or global animation ticker. */
export default function NeuralScene({ mode, paused, onReady }: NeuralSceneProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const fallbackRef = useRef<HTMLSpanElement>(null);
  const modeRef = useRef(mode);
  const pausedRef = useRef(paused);
  const readyRef = useRef(onReady);
  const controlsRef = useRef<SceneControls | null>(null);

  useEffect(() => { readyRef.current = onReady; }, [onReady]);
  useEffect(() => {
    modeRef.current = mode;
    controlsRef.current?.refresh();
  }, [mode]);
  useEffect(() => {
    pausedRef.current = paused;
    controlsRef.current?.sync();
  }, [paused]);

  useEffect(() => {
    const host = hostRef.current;
    const fallback = fallbackRef.current;
    if (!host || !fallback) return;
    // A fresh canvas per effect prevents a lost context being reused by StrictMode.
    const canvas = document.createElement('canvas');
    canvas.setAttribute('aria-hidden', 'true');
    host.insertBefore(canvas, fallback);

    let disposed = false;
    let contextLost = false;
    let failed = false;
    let renderer: THREE.WebGLRenderer | undefined;
    let raf = 0;
    let lastTime = 0;
    let lastDrawTime = 0;
    let elapsed = 0;
    let frame = 0;
    let width = 0;
    let height = 0;
    let visible = true;
    let reportedReady: boolean | undefined;
    let network = modeRef.current === 'network' ? 1 : 0;
    let scroll = 0;
    let scrollTarget = 0;
    const pointer = new THREE.Vector2();
    const pointerTarget = new THREE.Vector2();
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const smallScreen = window.matchMedia('(max-width: 767px)');
    const geometries = new Set<THREE.BufferGeometry>();
    const materials = new Set<THREE.Material>();
    const geometry = <T extends THREE.BufferGeometry,>(value: T): T => { geometries.add(value); return value; };
    const material = <T extends THREE.Material,>(value: T): T => { materials.add(value); return value; };
    const status = (value: 'loading' | 'ready' | 'fallback') => {
      if (disposed) return;
      host.dataset.state = value;
      fallback.hidden = value !== 'fallback';
      canvas.style.visibility = value === 'ready' ? 'visible' : 'hidden';
      const ready = value === 'ready';
      if (reportedReady !== ready) {
        reportedReady = ready;
        readyRef.current?.(ready);
      }
    };
    const release = () => {
      geometries.forEach((item) => item.dispose());
      materials.forEach((item) => item.dispose());
      geometries.clear();
      materials.clear();
      if (renderer) {
        renderer.dispose();
        renderer.forceContextLoss();
      }
    };
    status('loading');

    try {
      renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: !smallScreen.matches, powerPreference: 'high-performance' });
      renderer.setClearColor(0x05070c, 0);
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.18;
    } catch {
      status('fallback');
      return () => { disposed = true; canvas.remove(); release(); };
    }
    // Capture the successfully initialized renderer for callbacks (no non-null assertions).
    const gl = renderer;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(39, 1, .1, 40);
    camera.position.set(0, .18, 8.4);
    const assembly = new THREE.Group();
    scene.add(assembly);
    const core = new THREE.Group();
    assembly.add(core);

    const coreMaterial = material(new THREE.ShaderMaterial({
      uniforms: { uTime: { value: 0 }, uNetwork: { value: network } },
      vertexShader: coreVertex, fragmentShader: coreFragment,
    }));
    const coreGeometry = geometry(new THREE.IcosahedronGeometry(1.12, 1));
    const crystal = new THREE.Mesh(coreGeometry, coreMaterial);
    core.add(crystal);
    const edgeMaterial = material(new THREE.LineBasicMaterial({ color: CYAN, transparent: true, opacity: .28, blending: THREE.AdditiveBlending, depthWrite: false }));
    const crystalEdges = new THREE.LineSegments(geometry(new THREE.EdgesGeometry(coreGeometry, 12)), edgeMaterial);
    crystalEdges.scale.setScalar(1.003);
    core.add(crystalEdges);
    const cageMaterial = material(new THREE.LineBasicMaterial({ color: VIOLET, transparent: true, opacity: .15, blending: THREE.AdditiveBlending, depthWrite: false }));
    const cage = new THREE.LineSegments(geometry(new THREE.EdgesGeometry(geometry(new THREE.IcosahedronGeometry(1.36, 0)))), cageMaterial);
    cage.rotation.set(.32, .2, -.16);
    core.add(cage);

    const haloMaterial = material(new THREE.ShaderMaterial({
      uniforms: { uColor: { value: new THREE.Color(COBALT) }, uOpacity: { value: .38 } },
      vertexShader: glowVertex, fragmentShader: glowFragment,
      transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.BackSide,
    }));
    const halo = new THREE.Mesh(geometry(new THREE.SphereGeometry(1.7, 40, 28)), haloMaterial);
    assembly.add(halo);

    const orbitGroup = new THREE.Group();
    assembly.add(orbitGroup);
    const orbitCurves: THREE.CatmullRomCurve3[] = [];
    const orbitRigs: THREE.Group[] = [];
    const runners: THREE.Mesh[] = [];
    const runnerGeometry = geometry(new THREE.SphereGeometry(.027, 10, 8));
    const orbitColors = [CYAN, VIOLET, COBALT];
    for (let index = 0; index < 3; index++) {
      const rig = new THREE.Group();
      const points: THREE.Vector3[] = [];
      const radius = 1.82 + index * .24;
      for (let step = 0; step < 96; step++) {
        const angle = step / 96 * Math.PI * 2;
        points.push(new THREE.Vector3(Math.cos(angle) * radius, Math.sin(angle) * radius, Math.sin(angle * 2 + index) * .09));
      }
      const curve = new THREE.CatmullRomCurve3(points, true);
      orbitCurves.push(curve);
      const tubeMaterial = material(new THREE.MeshBasicMaterial({ color: orbitColors[index], transparent: true, opacity: index === 0 ? .7 : .38, blending: THREE.AdditiveBlending, depthWrite: false }));
      rig.add(new THREE.Mesh(geometry(new THREE.TubeGeometry(curve, 192, index === 0 ? .009 : .006, 5, true)), tubeMaterial));
      const companion = new THREE.Mesh(geometry(new THREE.TubeGeometry(curve, 192, .0025, 3, true)), tubeMaterial);
      companion.scale.setScalar(1.026);
      rig.add(companion);
      const runnerMaterial = material(new THREE.MeshBasicMaterial({ color: orbitColors[index], toneMapped: false }));
      const runner = new THREE.Mesh(runnerGeometry, runnerMaterial);
      rig.add(runner);
      runners.push(runner);
      orbitRigs.push(rig);
      orbitGroup.add(rig);
    }

    const satelliteGroup = new THREE.Group();
    assembly.add(satelliteGroup);
    const satellites: THREE.Group[] = [];
    const satelliteGeometry = geometry(new THREE.IcosahedronGeometry(.11, 1));
    const satelliteRingGeometry = geometry(new THREE.TorusGeometry(.195, .003, 4, 48));
    const satelliteHaloGeometry = geometry(new THREE.SphereGeometry(.27, 16, 12));
    for (let index = 0; index < 6; index++) {
      const satellite = new THREE.Group();
      const color = orbitColors[index % 3];
      const satelliteMaterial = material(new THREE.MeshBasicMaterial({ color, toneMapped: false }));
      satellite.add(new THREE.Mesh(satelliteGeometry, satelliteMaterial));
      const ringMaterial = material(new THREE.MeshBasicMaterial({ color, transparent: true, opacity: .55, blending: THREE.AdditiveBlending, depthWrite: false }));
      const ring = new THREE.Mesh(satelliteRingGeometry, ringMaterial);
      ring.rotation.x = .5 + index * .3;
      satellite.add(ring);
      const localHalo = material(new THREE.ShaderMaterial({
        uniforms: { uColor: { value: new THREE.Color(color) }, uOpacity: { value: .7 } },
        vertexShader: glowVertex, fragmentShader: glowFragment,
        transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.BackSide,
      }));
      satellite.add(new THREE.Mesh(satelliteHaloGeometry, localHalo));
      satelliteGroup.add(satellite);
      satellites.push(satellite);
    }

    // A fixed topology, but genuinely changing 3D node positions in network mode.
    const edges: [number, number][] = [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 0], [0, 3], [1, 4], [2, 5]];
    const connectionPositions = new Float32Array((edges.length + 6) * 6);
    const connectionGeometry = geometry(new THREE.BufferGeometry());
    connectionGeometry.setAttribute('position', new THREE.BufferAttribute(connectionPositions, 3).setUsage(THREE.DynamicDrawUsage));
    const connectionMaterial = material(new THREE.LineBasicMaterial({ color: CYAN, transparent: true, opacity: .11, blending: THREE.AdditiveBlending, depthWrite: false }));
    const connections = new THREE.LineSegments(connectionGeometry, connectionMaterial);
    connections.frustumCulled = false;
    satelliteGroup.add(connections);

    let seed = 82635;
    const random = () => { seed = (Math.imul(seed, 1664525) + 1013904223) | 0; return (seed >>> 0) / 4294967296; };
    const count = smallScreen.matches ? 450 : 1000;
    const positions = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    const phases = new Float32Array(count);
    const colors = new Float32Array(count * 3);
    const palette = orbitColors.map((color) => new THREE.Color(color));
    for (let index = 0; index < count; index++) {
      const angle = random() * Math.PI * 2;
      const elevation = (random() - .5) * 2;
      const radius = 1.55 + Math.pow(random(), .65) * 2.2;
      const flat = Math.sqrt(1 - elevation * elevation);
      positions[index * 3] = Math.cos(angle) * radius * flat;
      positions[index * 3 + 1] = elevation * radius * .73;
      positions[index * 3 + 2] = Math.sin(angle) * radius * flat;
      sizes[index] = .65 + random() * 2.0;
      phases[index] = random() * Math.PI * 2;
      palette[index % 3].toArray(colors, index * 3);
    }
    const particleGeometry = geometry(new THREE.BufferGeometry());
    particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particleGeometry.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));
    particleGeometry.setAttribute('aPhase', new THREE.BufferAttribute(phases, 1));
    particleGeometry.setAttribute('aColor', new THREE.BufferAttribute(colors, 3));
    const particleMaterial = material(new THREE.ShaderMaterial({
      uniforms: { uTime: { value: 0 }, uPixelRatio: { value: 1 }, uNetwork: { value: network } },
      vertexShader: particleVertex, fragmentShader: particleFragment,
      transparent: true, blending: THREE.AdditiveBlending, depthWrite: false,
    }));
    const particles = new THREE.Points(particleGeometry, particleMaterial);
    assembly.add(particles);
    const corePosition = new THREE.Vector3();
    const networkPosition = new THREE.Vector3();
    const packetPosition = new THREE.Vector3();

    const running = () => !disposed && !failed && !contextLost && !pausedRef.current && !reducedMotion.matches && visible && !document.hidden && width > 0 && height > 0;
    const stop = () => {
      if (raf) window.cancelAnimationFrame(raf);
      raf = 0;
      lastTime = 0;
    };
    const render = (delta: number, instant: boolean) => {
      if (disposed || failed || contextLost || !visible || document.hidden || width <= 0 || height <= 0) return;
      const blend = instant ? 1 : 1 - Math.exp(-delta * 3.2);
      network = THREE.MathUtils.lerp(network, modeRef.current === 'network' ? 1 : 0, blend);
      pointer.lerp(pointerTarget, instant ? 1 : 1 - Math.exp(-delta * 3));
      scroll = THREE.MathUtils.lerp(scroll, scrollTarget, blend);
      const time = elapsed;
      coreMaterial.uniforms.uTime.value = time;
      coreMaterial.uniforms.uNetwork.value = network;
      particleMaterial.uniforms.uTime.value = time;
      particleMaterial.uniforms.uNetwork.value = network;
      core.rotation.set(.13 + time * .065 + scroll * .18, time * .105 + network * .45, -.12 + Math.sin(time * .09) * .1);
      core.scale.setScalar(1 - network * .22);
      cage.rotation.y = -.2 - time * .08;
      cageMaterial.opacity = .14 + network * .2;
      halo.scale.setScalar(1 - network * .14);
      assembly.rotation.set(pointer.y * .08 + scroll * .08, pointer.x * .13, -.08 + scroll * .045);
      particles.rotation.y = -time * .018;
      particles.rotation.z = time * .008;
      for (let index = 0; index < 3; index++) {
        const rig = orbitRigs[index];
        rig.rotation.set(.92 + index * .56 + network * (index - 1) * .28, -.4 + index * .66 + time * .025 * (index % 2 ? 1 : -1), -.28 + index * .9 + network * .32);
        rig.scale.set(1 + network * .16, 1 - network * .17, 1);
        orbitCurves[index].getPointAt((time * (.035 + index * .008) + index / 3) % 1, packetPosition);
        runners[index].position.copy(packetPosition);
      }
      for (let index = 0; index < 6; index++) {
        const angle = index / 6 * Math.PI * 2 + .2 + time * .035;
        const radius = 2.16 + (index % 2) * .18 + scroll * .14;
        corePosition.set(Math.cos(angle) * radius, Math.sin(angle) * radius * .67, Math.sin(angle + .7) * .85);
        const networkAngle = index / 6 * Math.PI * 2 + .24;
        networkPosition.set(Math.cos(networkAngle) * (2.65 + scroll * .12), Math.sin(networkAngle) * 1.95, index % 2 ? .55 : -.6);
        satellites[index].position.copy(corePosition).lerp(networkPosition, network);
        satellites[index].rotation.set(time * .12 + index, time * .18, index * .7);
        satellites[index].scale.setScalar(1 + network * .25);
        const offset = index * 6;
        connectionPositions[offset] = 0;
        connectionPositions[offset + 1] = 0;
        connectionPositions[offset + 2] = 0;
        satellites[index].position.toArray(connectionPositions, offset + 3);
      }
      edges.forEach(([from, to], index) => {
        satellites[from].position.toArray(connectionPositions, (index + 6) * 6);
        satellites[to].position.toArray(connectionPositions, (index + 6) * 6 + 3);
      });
      connectionGeometry.attributes.position.needsUpdate = true;
      connectionMaterial.opacity = .065 + network * .24;
      camera.position.x = pointer.x * .19;
      camera.position.y = .18 - pointer.y * .13 + scroll * .08;
      camera.position.z = (width / height < .85 ? 10.4 : 8.4) + scroll * .32;
      camera.lookAt(.08, 0, 0);
      try {
        gl.render(scene, camera);
        if (failed || contextLost) return;
        frame++;
        if (frame === 1 || frame % 20 === 0 || instant) host.dataset.frame = String(frame);
        canvas.dataset.webgl = 'true';
        status('ready');
      } catch {
        failed = true;
        canvas.dataset.webgl = 'false';
        status('fallback');
        stop();
      }
    };
    gl.debug.onShaderError = () => {
      failed = true;
      canvas.dataset.webgl = 'false';
      status('fallback');
      stop();
    };
    const tick = (timestamp: number) => {
      raf = 0;
      if (!running()) { lastTime = 0; return; }
      const frameInterval = smallScreen.matches ? 1000 / 30 : 1000 / 60;
      if (timestamp - lastDrawTime < frameInterval - 1) {
        raf = window.requestAnimationFrame(tick);
        return;
      }
      lastDrawTime = timestamp;
      const delta = lastTime ? Math.min((timestamp - lastTime) / 1000, .05) : 1 / 60;
      lastTime = timestamp;
      elapsed += delta;
      render(delta, false);
      if (running()) raf = window.requestAnimationFrame(tick);
    };
    const sync = () => {
      if (running()) {
        if (!raf) raf = window.requestAnimationFrame(tick);
      } else {
        stop();
        if (visible && !document.hidden) render(0, true);
      }
    };
    const refresh = () => {
      if (running()) { sync(); return; }
      if (visible && !document.hidden) render(0, true);
    };
    controlsRef.current = { refresh, sync };
    const resize = () => {
      const bounds = host.getBoundingClientRect();
      width = Math.max(0, bounds.width);
      height = Math.max(0, bounds.height);
      if (width > 0 && height > 0) {
        gl.setPixelRatio(Math.min(window.devicePixelRatio || 1, smallScreen.matches ? 1.15 : 1.5));
        gl.setSize(width, height, false);
        canvas.style.width = '100%';
        canvas.style.height = '100%';
        canvas.style.display = 'block';
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        particleMaterial.uniforms.uPixelRatio.value = gl.getPixelRatio();
        render(0, true);
      }
      sync();
    };
    const onPointer = (event: PointerEvent) => {
      if (event.pointerType === 'touch') return;
      pointerTarget.set(THREE.MathUtils.clamp(event.clientX / window.innerWidth * 2 - 1, -1, 1), THREE.MathUtils.clamp(event.clientY / window.innerHeight * 2 - 1, -1, 1));
      // Paused and reduced-motion scenes remain genuinely still on pointer movement.
    };
    const onScroll = () => {
      scrollTarget = THREE.MathUtils.clamp(window.scrollY / Math.max(window.innerHeight, 1), 0, 2);
    };
    const onContextLost = (event: Event) => {
      event.preventDefault();
      contextLost = true;
      stop();
      canvas.dataset.webgl = 'false';
      status('fallback');
    };
    const onContextRestored = () => {
      if (disposed) return;
      contextLost = false;
      failed = false;
      status('loading');
      // Three.js rebuilds its GPU resources on context restoration.
      resize();
    };
    const resizeObserver = new ResizeObserver(resize);
    const intersectionObserver = new IntersectionObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      visible = entry.isIntersecting;
      sync();
    }, { threshold: 0 });
    const bounds = host.getBoundingClientRect();
    visible = bounds.bottom > 0 && bounds.top < window.innerHeight && bounds.right > 0 && bounds.left < window.innerWidth;
    resizeObserver.observe(host);
    intersectionObserver.observe(host);
    window.addEventListener('pointermove', onPointer, { passive: true });
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', resize, { passive: true });
    document.addEventListener('visibilitychange', sync);
    reducedMotion.addEventListener('change', sync);
    smallScreen.addEventListener('change', resize);
    canvas.addEventListener('webglcontextlost', onContextLost);
    canvas.addEventListener('webglcontextrestored', onContextRestored);
    onScroll();
    resize();

    return () => {
      disposed = true;
      stop();
      controlsRef.current = null;
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      window.removeEventListener('pointermove', onPointer);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', resize);
      document.removeEventListener('visibilitychange', sync);
      reducedMotion.removeEventListener('change', sync);
      smallScreen.removeEventListener('change', resize);
      canvas.removeEventListener('webglcontextlost', onContextLost);
      canvas.removeEventListener('webglcontextrestored', onContextRestored);
      scene.clear();
      canvas.remove();
      release();
      // Do not publish readiness during teardown: StrictMode immediately remounts.
    };
  }, []);

  return (
    <div ref={hostRef} className="neural-canvas-host" data-renderer="three-webgl" data-state="loading" data-mode={mode} data-frame="0" aria-hidden="true">
      <span ref={fallbackRef} className="neural-canvas-fallback" hidden>3D 미리보기를 사용할 수 없습니다</span>
    </div>
  );
}
