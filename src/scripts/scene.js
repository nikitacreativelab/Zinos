import * as THREE from 'three';

/**
 * Soft drifting glow orbs for the hero section — a light WebGL presence
 * inspired by the calm, premium motion on klimtwine.com.
 */
export function initHeroScene(canvas) {
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 100);
  camera.position.z = 6;

  const colors = [0xff7a3d, 0xffd8b8, 0xffe3d1];
  const orbs = colors.map((color, i) => {
    const geo = new THREE.SphereGeometry(0.9 + i * 0.25, 32, 32);
    const mat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.35 });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set((i - 1) * 1.6, (i % 2 === 0 ? 1 : -1) * 0.6, -i * 1.2);
    scene.add(mesh);
    return { mesh, speed: 0.2 + i * 0.08, offset: i * 2 };
  });

  function resize() {
    const { clientWidth: w, clientHeight: h } = canvas;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }

  const ro = new ResizeObserver(resize);
  ro.observe(canvas);
  resize();

  let raf;
  const clock = new THREE.Clock();
  function animate() {
    const t = clock.getElapsedTime();
    for (const o of orbs) {
      o.mesh.position.y += Math.sin(t * o.speed + o.offset) * 0.0025;
      o.mesh.position.x += Math.cos(t * o.speed * 0.7 + o.offset) * 0.0015;
      o.mesh.rotation.y = t * 0.05;
    }
    renderer.render(scene, camera);
    raf = requestAnimationFrame(animate);
  }
  animate();

  return () => {
    cancelAnimationFrame(raf);
    ro.disconnect();
    renderer.dispose();
  };
}

/**
 * A single product photo rendered as a textured plane in a real WebGL/Three.js
 * scene, given a gentle turntable rotation. Built from front-facing product
 * photos only (no volumetric 3D model available), so the "3D rotation" is a
 * lit, perspective-correct textured card rather than a full mesh — the
 * deliberate fallback agreed with the client for this iteration.
 *
 * Exposes { start, stop } instead of auto-playing on intersection, so a
 * parent controller (the scroll-driven product carousel) can decide exactly
 * which single scene should be animating at any moment.
 */
export function initBottleScene(canvas, imageUrl) {
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
  camera.position.z = 4;

  const light = new THREE.DirectionalLight(0xffffff, 1.1);
  light.position.set(2, 3, 4);
  scene.add(light);
  scene.add(new THREE.AmbientLight(0xffffff, 0.55));

  const loader = new THREE.TextureLoader();
  let mesh;

  function resize() {
    const { clientWidth: w, clientHeight: h } = canvas;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.render(scene, camera);
  }
  const ro = new ResizeObserver(resize);
  ro.observe(canvas);
  resize();

  loader.load(imageUrl, (texture) => {
    texture.colorSpace = THREE.SRGBColorSpace;
    const imgW = texture.image.width;
    const imgH = texture.image.height;
    const aspect = imgW / imgH;
    const height = 2.6;
    const width = height * aspect;
    const geo = new THREE.PlaneGeometry(width, height, 1, 1);
    const mat = new THREE.MeshStandardMaterial({
      map: texture,
      transparent: true,
      alphaTest: 0.02,
      roughness: 0.35,
      metalness: 0.05,
    });
    mesh = new THREE.Mesh(geo, mat);
    scene.add(mesh);
    resize();
    renderer.render(scene, camera);
  });

  let running = false;
  let raf;
  const clock = new THREE.Clock();

  function animate() {
    if (!running) return;
    const t = clock.getElapsedTime();
    if (mesh) {
      mesh.rotation.y = Math.sin(t * 0.5) * 0.55;
      mesh.position.y = Math.sin(t * 0.8) * 0.06;
    }
    renderer.render(scene, camera);
    raf = requestAnimationFrame(animate);
  }

  function start() {
    if (running) return;
    running = true;
    clock.start();
    animate();
  }

  function stop() {
    running = false;
    cancelAnimationFrame(raf);
  }

  function dispose() {
    stop();
    ro.disconnect();
    renderer.dispose();
  }

  return { start, stop, dispose };
}
