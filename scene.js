/* Original F monogram study, using the scene lifecycle from library practice 03.
   This is decorative brand artwork, separate from Fabricio's Blender portfolio. */
(() => {
  'use strict';
  const host = document.getElementById('studio');
  const mount = document.getElementById('studioCanvas');
  const hint = document.getElementById('sceneHint');
  const motion = window.PortfolioMotion || { reduced: true };
  let loaded = false, initScene;
  function fallback() {
    host.classList.remove('is-ready');
    host.dataset.sceneState = 'fallback';
    hint.textContent = 'Fabricio / Interactive brand study';
    host.querySelector('.studio__controls').hidden = true;
    host.querySelector('.studio__top > span:last-child').textContent = 'BRAND STUDY';
  }
  if (navigator.connection?.saveData) { fallback(); return; }
  const loader = new IntersectionObserver(entries => {
    if (!entries.some(entry => entry.isIntersecting) || loaded) return;
    loaded = true; loader.disconnect();
    const script = document.createElement('script');
    script.src = 'vendor/three.min.js';
    script.onload = () => { try { initScene(); } catch (error) { fallback(); console.warn('The 3D study is unavailable:', error.message); } };
    script.onerror = fallback;
    document.head.append(script);
  }, { rootMargin: '180px' });
  loader.observe(host);

  initScene = function () {
    const T = window.THREE;
    let renderer;
    try { renderer = new T.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'low-power' }); }
    catch { fallback(); return; }
    renderer.setClearColor(0x090a0d, 0);
    renderer.toneMapping = T.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    renderer.outputColorSpace = T.SRGBColorSpace;
    mount.append(renderer.domElement);
    const scene = new T.Scene();
    const camera = new T.PerspectiveCamera(35, 1, .1, 60);
    camera.position.set(4.2, 2.4, 8.5);
    camera.lookAt(0, -.05, 0);
    const resources = new Set();
    const remember = resource => { resources.add(resource); return resource; };
    const room = new window.LabRoomEnvironment();
    const pmrem = new T.PMREMGenerator(renderer);
    const environment = pmrem.fromScene(room, .04);
    scene.environment = environment.texture;
    scene.environmentIntensity = .75;
    room.dispose(); pmrem.dispose();
    const root = new T.Group(); scene.add(root);
    const sculpture = new T.Group(); root.add(sculpture);
    const finish = params => remember(new T.MeshStandardMaterial(params));
    const royalBlue = finish({ color: 0x1755d2, metalness: .62, roughness: .24 });
    const pale = finish({ color: 0xcdd2dd, metalness: .92, roughness: .22 });
    const graphite = finish({ color: 0x232731, metalness: .85, roughness: .31 });
    const gold = finish({ color: 0xe2b13a, metalness: .7, roughness: .24, emissive: 0x8a5c0a, emissiveIntensity: .2 });
    const blueGlow = remember(new T.MeshBasicMaterial({ color: 0x4d87ff }));
    const goldGlow = remember(new T.MeshBasicMaterial({ color: 0xf3cb64 }));
    function mesh(geometry, material, parent, x = 0, y = 0, z = 0) {
      const object = new T.Mesh(remember(geometry), material);
      object.position.set(x, y, z); parent.add(object); return object;
    }

    // A beveled, continuous silhouette makes the identity legible from every angle.
    const letter = new T.Shape();
    letter.moveTo(-.91, -1.28); letter.lineTo(-.91, 1.28); letter.lineTo(.94, 1.28);
    letter.lineTo(.94, .66); letter.lineTo(-.2, .66); letter.lineTo(-.2, .22);
    letter.lineTo(.68, .22); letter.lineTo(.68, -.39); letter.lineTo(-.2, -.39);
    letter.lineTo(-.2, -1.28); letter.closePath();
    mesh(new T.ExtrudeGeometry(letter, { depth: .48, bevelEnabled: true, bevelSegments: 4, steps: 1, bevelSize: .075, bevelThickness: .075, curveSegments: 12 }), [royalBlue, gold], sculpture, 0, .38, -.2);
    mesh(new T.ExtrudeGeometry(letter, { depth: .055, bevelEnabled: true, bevelSegments: 2, bevelSize: .06, bevelThickness: .035, steps: 1 }), gold, sculpture, 0, .38, -.34);
    sculpture.rotation.z = -.12;

    const pedestal = new T.Group(); root.add(pedestal);
    mesh(new T.CylinderGeometry(2.02, 1.83, .23, 80), graphite, pedestal, 0, -1.52, 0);
    mesh(new T.CylinderGeometry(1.85, 1.85, .035, 80), pale, pedestal, 0, -1.385, 0);
    mesh(new T.CylinderGeometry(1.79, 1.79, .045, 80), graphite, pedestal, 0, -1.36, 0);
    const baseRing = mesh(new T.TorusGeometry(1.96, .018, 8, 96), blueGlow, pedestal, 0, -1.43, 0);
    baseRing.rotation.x = Math.PI / 2;
    const halo = mesh(new T.TorusGeometry(2.5, .009, 6, 128), finish({ color: 0xa6b0c4, metalness: .7, roughness: .6, transparent: true, opacity: .4 }), root, 0, -.25, 0);
    halo.rotation.set(1.05, .08, -.25);
    const haloAccent = mesh(new T.TorusGeometry(2.5, .019, 8, 40, .7), goldGlow, halo);
    haloAccent.rotation.z = .5;
    const tickGeometry = remember(new T.BoxGeometry(.035, .012, .12));
    for (let i = 0; i < 32; i++) {
      const angle = i / 32 * Math.PI * 2;
      const tick = new T.Mesh(tickGeometry, i % 8 === 0 ? gold : pale);
      tick.position.set(Math.sin(angle) * 1.7, -1.33, Math.cos(angle) * 1.7);
      tick.rotation.y = angle; pedestal.add(tick);
    }
    const satelliteA = mesh(new T.IcosahedronGeometry(.3, 0), gold, root, 1.77, .93, .36);
    const satelliteB = mesh(new T.BoxGeometry(.42, .42, .42), royalBlue, root, -1.7, -.1, .55);
    satelliteB.rotation.set(.3, .6, .2);
    const edgeMaterial = remember(new T.LineBasicMaterial({ color: 0xadc4f3, transparent: true, opacity: .5 }));
    const cageGeometry = remember(new T.BoxGeometry(.64, .64, .64));
    const cage = new T.LineSegments(remember(new T.EdgesGeometry(cageGeometry)), edgeMaterial);
    satelliteB.add(cage);
    const dot = mesh(new T.SphereGeometry(.075, 12, 8), goldGlow, root, -.95, 1.95, .05);
    // Fine floor grid: geometry is allocated once, never inside a frame.
    const vertices = [];
    for (let i = -5; i <= 5; i++) {
      const p = i * .45; vertices.push(-2.25,-1.66,p,2.25,-1.66,p,p,-1.66,-2.25,p,-1.66,2.25);
    }
    const gridGeometry = remember(new T.BufferGeometry());
    gridGeometry.setAttribute('position', new T.Float32BufferAttribute(vertices, 3));
    root.add(new T.LineSegments(gridGeometry, remember(new T.LineBasicMaterial({ color: 0x52658a, transparent: true, opacity: .2 }))));
    scene.add(new T.HemisphereLight(0xe4eaff, 0x242b40, 1.7));
    const key = new T.DirectionalLight(0xf2f4ff, 3.4); key.position.set(-3, 5, 4); scene.add(key);
    const rim = new T.DirectionalLight(0xffd487, 3); rim.position.set(3, 1, -2); scene.add(rim);
    const fill = new T.DirectionalLight(0x4a80ff, 2.5); fill.position.set(-3, 0, -2); scene.add(fill);

    let visible = true, disposed = false, contextLost = false, frame = 0, last = 0, elapsed = 0;
    let yaw = -.25, targetYaw = -.25, pitch = 0, targetPitch = 0, spinVelocity = 0;
    let pointerId = null, lastX = 0, lastY = 0, lastPointer = 0, dragging = false;
    let mobile = false;
    const reduced = () => motion.reduced;
    function resize() {
      const width = mount.clientWidth, height = mount.clientHeight;
      if (!width || !height || disposed) return;
      mobile = width < 500;
      renderer.setPixelRatio(Math.min(devicePixelRatio || 1, mobile ? 1.4 : 1.7));
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.fov = mobile ? 41 : 35;
      camera.updateProjectionMatrix();
      draw(); wake();
    }
    function draw() {
      if (!disposed && !contextLost) renderer.render(scene, camera);
    }
    function tick(time) {
      frame = 0;
      if (disposed || contextLost || document.hidden || !visible) return;
      // Mobile idle motion is sampled at 30 Hz; active manipulation remains responsive.
      if (mobile && !dragging && !reduced() && time - last < 30) { wake(); return; }
      const dt = Math.min((time - last) / 1000 || .016, .05); last = time;
      if (!reduced()) elapsed += dt;
      if (!dragging && !reduced()) { targetYaw += spinVelocity * dt; spinVelocity *= Math.exp(-dt * 6); }
      const follow = reduced() ? 1 : 1 - Math.exp(-dt * 10);
      yaw += (targetYaw - yaw) * follow; pitch += (targetPitch - pitch) * follow;
      root.rotation.y = yaw + (reduced() ? 0 : Math.sin(elapsed * .28) * .075);
      root.rotation.x = pitch;
      sculpture.position.y = reduced() ? 0 : Math.sin(elapsed * .9) * .09;
      satelliteA.position.y = .93 + (reduced() ? 0 : Math.sin(elapsed * .8 + 1) * .12);
      satelliteA.rotation.y = reduced() ? .2 : elapsed * .2;
      satelliteB.rotation.y = reduced() ? .6 : .6 + elapsed * .14;
      dot.position.y = 1.95 + (reduced() ? 0 : Math.sin(elapsed + 2) * .06);
      draw();
      host.dataset.sceneState = reduced() ? 'static' : 'active';
      if (!reduced() || Math.abs(yaw - targetYaw) > .001 || Math.abs(pitch - targetPitch) > .001) wake();
    }
    function wake() {
      if (!frame && !disposed && !contextLost && visible && !document.hidden) frame = requestAnimationFrame(tick);
    }
    function stop() { cancelAnimationFrame(frame); frame = 0; host.dataset.sceneState = 'paused'; }
    const visibilityObserver = new IntersectionObserver(entries => {
      visible = entries[0].isIntersecting;
      if (visible) { last = performance.now(); wake(); } else stop();
    }, { threshold: .01 });
    visibilityObserver.observe(host);
    const resizeObserver = new ResizeObserver(resize); resizeObserver.observe(mount);
    const visibilityChange = () => { if (document.hidden) stop(); else { last = performance.now(); wake(); } };
    document.addEventListener('visibilitychange', visibilityChange);
    const preferenceChange = () => { elapsed = 0; spinVelocity = 0; last = performance.now(); wake(); };
    document.addEventListener('motionchange', preferenceChange);
    mount.addEventListener('pointerdown', event => {
      if (event.button !== 0 || !event.isPrimary) return;
      dragging = true; pointerId = event.pointerId; lastX = event.clientX; lastY = event.clientY;
      targetYaw = yaw; targetPitch = pitch; spinVelocity = 0; lastPointer = performance.now();
      mount.setPointerCapture(pointerId); wake();
    });
    mount.addEventListener('pointermove', event => {
      if (!dragging || event.pointerId !== pointerId) return;
      const dx = event.clientX - lastX, dy = event.clientY - lastY, now = performance.now();
      const dt = Math.max(.008, (now - lastPointer) / 1000);
      targetYaw += dx * .009;
      targetPitch = Math.max(-.35, Math.min(.35, targetPitch + dy * .004));
      spinVelocity = dx * .009 / dt;
      lastX = event.clientX; lastY = event.clientY; lastPointer = now;
      // Direct manipulation tracks the pointer exactly; easing resumes on release.
      yaw = targetYaw; pitch = targetPitch; wake();
    });
    function release(event) {
      if (!dragging || pointerId !== event.pointerId) return;
      dragging = false;
      if (event.type !== 'pointerup' || performance.now() - lastPointer > 100 || reduced()) spinVelocity = 0;
      spinVelocity = Math.max(-2, Math.min(2, spinVelocity));
      if (mount.hasPointerCapture(pointerId)) mount.releasePointerCapture(pointerId);
      pointerId = null; wake();
    }
    mount.addEventListener('pointerup', release);
    mount.addEventListener('pointercancel', release);
    mount.addEventListener('lostpointercapture', release);
    document.getElementById('sceneRotate').addEventListener('click', () => { targetYaw += Math.PI / 3; spinVelocity = 0; wake(); });
    document.getElementById('sceneReset').addEventListener('click', () => { targetYaw = -.25; targetPitch = 0; spinVelocity = 0; wake(); });
    renderer.domElement.addEventListener('webglcontextlost', event => { event.preventDefault(); contextLost = true; stop(); fallback(); });
    renderer.domElement.addEventListener('webglcontextrestored', () => {
      contextLost = false; host.classList.add('is-ready'); host.querySelector('.studio__controls').hidden = false;
      hint.textContent = 'Drag to orbit · Interactive brand study'; host.querySelector('.studio__top > span:last-child').textContent = 'LIVE 3D'; wake();
    });
    function dispose() {
      if (disposed) return;
      stop(); disposed = true; resizeObserver.disconnect(); visibilityObserver.disconnect();
      document.removeEventListener('visibilitychange', visibilityChange); document.removeEventListener('motionchange', preferenceChange);
      resources.forEach(resource => resource.dispose()); environment.dispose(); renderer.dispose();
    }
    addEventListener('pagehide', event => { if (!event.persisted) dispose(); else stop(); });
    addEventListener('pageshow', () => { if (!disposed) wake(); });
    resize(); wake();
    host.classList.add('is-ready');
  };
})();
