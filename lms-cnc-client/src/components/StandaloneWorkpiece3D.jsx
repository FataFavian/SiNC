// =============================================================
// StandaloneWorkpiece3D.jsx - Pratinjau 3D benda kerja mandiri (raw stock & turned).
// Dilengkapi pencekam chuck, dimensi melayang 3D otomatis (Turned & Raw),
// dan visualisasi hasil pembubutan presisi real-time.
// =============================================================
import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { COLORS } from '../three/theme';
import Icon from '../ui/Icon.jsx';

function makeMachinedTexture() {
  const size = 512;
  const c = document.createElement('canvas');
  c.width = size;
  c.height = size;
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#8c8c8c';
  ctx.fillRect(0, 0, size, size);
  for (let y = 0; y < size; y++) {
    const g = 105 + Math.random() * 55;
    ctx.fillStyle = `rgb(${g},${g},${g})`;
    ctx.fillRect(0, y, size, 1);
  }
  ctx.globalAlpha = 0.08;
  for (let i = 0; i < 60; i++) {
    ctx.fillStyle = Math.random() < 0.5 ? '#ffffff' : '#000000';
    ctx.fillRect(Math.random() * size, 0, 1, size);
  }
  ctx.globalAlpha = 1;
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(2, 1);
  return tex;
}

export default function StandaloneWorkpiece3D({ stockD = 30, stockL = 60, height = 480, cutProfile = null }) {
  const canvasRef = useRef(null);
  const sceneRef = useRef(null);
  const meshGroupRef = useRef(null);
  const calloutTurnedRef = useRef(null);
  const calloutRawRef = useRef(null);
  const cutInfoRef = useRef(null);

  const [dimensionCallouts, setDimensionCallouts] = useState(null);
  const [spinMode, setSpinMode] = useState('turntable');
  const spinModeRef = useRef('turntable');
  spinModeRef.current = spinMode;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
      precision: 'mediump',
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.25));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Refleksi lembut dan pencahayaan realistis persis seperti di mesin CNC 3D
    let pmrem = null;
    let envRT = null;
    try {
      pmrem = new THREE.PMREMGenerator(renderer);
      const room = new RoomEnvironment();
      envRT = pmrem.fromScene(room, 0.04);
      scene.environment = envRT.texture;
      room.dispose?.();
    } catch {
      /* fallback jika context terbatas */
    }

    const camera = new THREE.PerspectiveCamera(36, 1, 0.1, 100);
    // Sudut kamera horizontal tampak bubut (Chuck di kiri, muka di kanan)
    camera.position.set(5.8, 2.2, 0.6);

    const controls = new OrbitControls(camera, canvas);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.minDistance = 2.0;
    controls.maxDistance = 18.0;
    controls.maxPolarAngle = Math.PI * 0.88;
    controls.autoRotate = false;

    // Pencahayaan persis sama dengan mesin bubut CNC 3D (CncScene.js)
    const hemiLight = new THREE.HemisphereLight(0xcfe0f0, 0x1a2128, 0.45);
    scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 2.15);
    keyLight.position.set(8, 14, 7);
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0x9fc4e8, 0.7);
    fillLight.position.set(-9, 6, -8);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0xffffff, 0.55);
    rimLight.position.set(-2, 5, -13);
    scene.add(rimLight);

    // Lantai bayangan kontak lembut
    const floorGeo = new THREE.CircleGeometry(3.6, 32);
    const floorMat = new THREE.MeshBasicMaterial({
      color: 0x04080c,
      transparent: true,
      opacity: 0.6,
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -1.6;
    scene.add(floor);

    // Grid studio melingkar yang halus
    const gridHelper = new THREE.GridHelper(8, 20, 0x223040, 0x141e28);
    gridHelper.position.y = -1.59;
    scene.add(gridHelper);

    // Group silinder benda kerja
    const meshGroup = new THREE.Group();
    meshGroupRef.current = meshGroup;
    scene.add(meshGroup);

    const brushedTex = makeMachinedTexture();
    const material = new THREE.MeshStandardMaterial({
      color: COLORS.stock,
      metalness: 0.6,
      roughness: 0.78,
      roughnessMap: brushedTex,
      bumpMap: brushedTex,
      bumpScale: 0.004,
      envMapIntensity: 1.0,
      side: THREE.DoubleSide,
    });

    // Fungsi membuat silinder atau hasil bubut 3D
    function buildWorkpiece(d, l, profile) {
      // Kosongkan mesh sebelumnya
      while (meshGroup.children.length > 0) {
        const obj = meshGroup.children[0];
        meshGroup.remove(obj);
        if (obj.geometry) obj.geometry.dispose();
      }

      const r = (d / 2) * 0.05;
      const len = l * 0.05;

      let cutInfo = null;

      if (profile && Array.isArray(profile) && profile.length > 0) {
        // Tampilkan hasil pemotongan bubut (turned workpiece) padat & solid via LatheGeometry
        const points = [];
        points.push(new THREE.Vector2(0, -len / 2));

        const backR = Math.min(d / 2, Math.max(0.2, profile[profile.length - 1] ?? (d / 2))) * 0.05;
        points.push(new THREE.Vector2(backR, -len / 2));

        const stepSize = Math.max(1, Math.floor(profile.length / 90));
        for (let i = profile.length - 1; i >= 0; i -= stepSize) {
          const zMm = i * 0.5; // RES = 0.5 mm
          const currR = Math.min(d / 2, Math.max(0.2, profile[i])) * 0.05;
          const visualZ = len / 2 - zMm * 0.05;
          points.push(new THREE.Vector2(currR, visualZ));
        }

        const frontR = Math.min(d / 2, Math.max(0.2, profile[0] ?? (d / 2))) * 0.05;
        points.push(new THREE.Vector2(frontR, len / 2));
        points.push(new THREE.Vector2(0, len / 2));

        const turnedGeo = new THREE.LatheGeometry(points, 48);
        turnedGeo.rotateX(Math.PI / 2);
        turnedGeo.computeVertexNormals();

        const turnedMesh = new THREE.Mesh(turnedGeo, material);
        meshGroup.add(turnedMesh);

        // Analisis segmen potongan untuk label dimensi mengambang 3D
        const rawR = d / 2;
        const cutIndices = [];
        const rawIndices = [];
        let minTurnedR = rawR;

        for (let i = 0; i < profile.length; i++) {
          const rVal = profile[i];
          if (rVal < rawR - 0.05) {
            cutIndices.push(i);
            if (rVal < minTurnedR) minTurnedR = rVal;
          } else {
            rawIndices.push(i);
          }
        }

        if (cutIndices.length > 0) {
          const turnedD = Math.round(minTurnedR * 2 * 10) / 10;
          const avgCutZMm = (cutIndices.reduce((a, b) => a + b, 0) / cutIndices.length) * 0.5;
          const visualZ_turned = len / 2 - avgCutZMm * 0.05;
          const turned3D = new THREE.Vector3(0, minTurnedR * 0.05 + 0.16, visualZ_turned);

          let raw3D = null;
          if (rawIndices.length > 0) {
            const avgRawZMm = (rawIndices.reduce((a, b) => a + b, 0) / rawIndices.length) * 0.5;
            const visualZ_raw = len / 2 - avgRawZMm * 0.05;
            raw3D = new THREE.Vector3(0, r + 0.16, visualZ_raw);
          }

          cutInfo = {
            turnedD,
            stockD: d,
            turned3D,
            raw3D,
            visualZ_turned,
            hasRaw: rawIndices.length > 0,
          };
        }
      } else {
        // Bodi silinder mentah (raw cylinder)
        const bodyGeo = new THREE.CylinderGeometry(r, r, len, 48, 1, false);
        bodyGeo.rotateX(Math.PI / 2);
        const bodyMesh = new THREE.Mesh(bodyGeo, material);

        const bevelR = Math.max(0.02, r * 0.06);
        const capGeo = new THREE.CylinderGeometry(r - bevelR, r, bevelR, 48);
        capGeo.rotateX(Math.PI / 2);

        const capFront = new THREE.Mesh(capGeo, material);
        capFront.position.z = len / 2 + bevelR / 2;

        const capBackGeo = capGeo.clone();
        capBackGeo.rotateX(Math.PI);
        const capBack = new THREE.Mesh(capBackGeo, material);
        capBack.position.z = -len / 2 - bevelR / 2;

        meshGroup.add(bodyMesh, capFront, capBack);
      }

      // Simpan ref data dimensi untuk animasi
      cutInfoRef.current = cutInfo;
      setDimensionCallouts(cutInfo);

      meshGroup.position.set(0, 0, 0);
      floor.position.y = -Math.max(1.2, r + 0.4);
      gridHelper.position.y = floor.position.y + 0.005;

      controls.target.set(0, -0.05, 0);
      controls.update();
    }

    buildWorkpiece(stockD, stockL, cutProfile);

    // Resize handler
    const resize = () => {
      const w = canvas.parentElement?.clientWidth || 500;
      const h = height || 480;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    resize();

    let ro = null;
    if (typeof ResizeObserver !== 'undefined' && canvas.parentElement) {
      ro = new ResizeObserver(resize);
      ro.observe(canvas.parentElement);
    }

    function updateCallout(pos, elem) {
      if (!elem || !pos || !camera || !renderer) return;
      const v = pos.clone();
      v.project(camera);
      if (v.z > 1.0) {
        elem.style.display = 'none';
        return;
      }
      const w = canvas.clientWidth || 500;
      const h = canvas.clientHeight || 480;
      const x = (v.x * 0.5 + 0.5) * w;
      const y = (-v.y * 0.5 + 0.5) * h;
      elem.style.display = 'flex';
      elem.style.left = `${Math.round(x)}px`;
      elem.style.top = `${Math.round(y)}px`;
    }

    let raf = 0;
    const animate = () => {
      // Mode aktif bawaan: Rotasi pameran 360° keliling horizontal (turntable)
      if (spinModeRef.current === 'turntable') {
        controls.autoRotate = true;
        controls.autoRotateSpeed = 1.6;
      } else {
        controls.autoRotate = false;
      }

      controls.update();
      renderer.render(scene, camera);

      if (cutInfoRef.current) {
        if (calloutTurnedRef.current && cutInfoRef.current.turned3D) {
          updateCallout(cutInfoRef.current.turned3D, calloutTurnedRef.current);
        }
        if (calloutRawRef.current && cutInfoRef.current.raw3D) {
          updateCallout(cutInfoRef.current.raw3D, calloutRawRef.current);
        }
      }

      raf = requestAnimationFrame(animate);
    };
    raf = requestAnimationFrame(animate);

    meshGroupRef.current.rebuild = buildWorkpiece;

    return () => {
      cancelAnimationFrame(raf);
      ro?.disconnect();
      controls.dispose();
      brushedTex.dispose();
      material.dispose();
      floorMat.dispose();
      floorGeo.dispose();
      envRT?.dispose();
      pmrem?.dispose();
      renderer.dispose();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Update dimensi diameter, panjang, atau profil potongan saat berubah
  useEffect(() => {
    if (meshGroupRef.current?.rebuild) {
      meshGroupRef.current.rebuild(stockD, stockL, cutProfile);
    }
  }, [stockD, stockL, cutProfile]);

  return (
    <div className="standalone-workpiece-wrap" style={{ height }}>
      <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block' }} />

      <div className="standalone-workpiece-topbar">
        <div className={`standalone-workpiece-badge${cutProfile ? ' standalone-workpiece-badge--cut' : ''}`}>
          <span className="badge-dot" style={cutProfile ? { background: '#34d399', boxShadow: '0 0 8px #34d399' } : {}} />
          <span>{cutProfile ? 'Hasil Pembubutan Anda' : 'Bahan Mentah'}</span>
        </div>
        <div className="standalone-workpiece-right">
          <button
            type="button"
            className={`standalone-spin-toggle${spinMode === 'turntable' ? ' standalone-spin-toggle--active' : ''}`}
            onClick={() => setSpinMode((m) => (m === 'turntable' ? 'off' : 'turntable'))}
            title={spinMode === 'turntable' ? 'Jeda rotasi 360°' : 'Aktifkan rotasi pameran 360°'}
          >
            <Icon name="cube" size={11} />
            <span>{spinMode === 'turntable' ? 'Pameran 360° Aktif' : 'Pameran 360°'}</span>
          </button>
          <div className="standalone-workpiece-dim">
            <b>Ø {stockD} mm</b> × <b>{stockL} mm</b>
          </div>
        </div>
      </div>

      {/* Floating 3D Dimension Callouts on Turned and Raw Sections */}
      {dimensionCallouts && (
        <>
          <div
            ref={calloutTurnedRef}
            className="dimension-callout dimension-callout--turned"
          >
            <b>Ø {dimensionCallouts.turnedD} mm</b>
            <span>(Turned)</span>
          </div>

          {dimensionCallouts.hasRaw && (
            <div
              ref={calloutRawRef}
              className="dimension-callout dimension-callout--raw"
            >
              <b>Ø {dimensionCallouts.stockD} mm</b>
              <span>(Raw)</span>
            </div>
          )}
        </>
      )}

      {/* Petunjuk Sumbu Sesuai Mockup */}
      <div className="workpiece-axis-hint">
        <span className="axis-x">+X (Diameter / Radial)</span>
        <span className="axis-z">+Z (Panjang / Aksial)</span>
      </div>

      {/* Petunjuk Navigasi Interaktif */}
      <div className="workpiece-cam-hint">
        <span>Drag = putar 3D • Scroll = zoom</span>
      </div>
    </div>
  );
}
