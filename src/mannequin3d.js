// Mannequin 3D léger pour Cardio Maison.
// Construit un personnage en capsules (Three.js), anime chaque exercice à partir
// de quelques poses clés, colore la zone travaillée et pose le corps au sol.
// Source : ce fichier + anims.js. Build : `npm run build` -> ../mannequin3d.js
import {
  WebGLRenderer, Scene, PerspectiveCamera, Group, Object3D, Mesh,
  CapsuleGeometry, SphereGeometry, BoxGeometry, PlaneGeometry, CircleGeometry,
  MeshLambertMaterial, ShadowMaterial, MeshBasicMaterial, CanvasTexture,
  HemisphereLight, DirectionalLight, Vector3, PCFSoftShadowMap, SRGBColorSpace,
} from 'three';
import { ANIMS, DEFAULT_POSE } from './anims.js';

const D = Math.PI / 180;
const ASPECT = 1.75;
const BODY = 0xd5d9e4;

function capsule(r, len, mat) {
  const m = new Mesh(new CapsuleGeometry(r, len, 6, 12), mat);
  m.position.y = -len / 2;
  m.castShadow = true;
  return m;
}
function marker(parent, x, y, z, r, name, list) {
  const o = new Object3D();
  o.position.set(x, y, z);
  parent.add(o);
  list.push({ o, r, name });
  return o;
}

class Mannequin {
  constructor() {
    this.bodyMat = new MeshLambertMaterial({ color: BODY });
    this.hiMat = new MeshLambertMaterial({ color: 0xff5a3c });
    this.pts = [];
    this.parts = { core: [], arms: [], legs: [] };
    const P = this.pts, mat = this.bodyMat;

    const root = (this.root = new Group());
    root.rotation.order = 'YXZ';

    const pelvis = new Mesh(new CapsuleGeometry(0.105, 0.13, 6, 12), mat);
    pelvis.rotation.z = Math.PI / 2;
    pelvis.scale.set(1, 1, 0.9);
    pelvis.castShadow = true;
    root.add(pelvis);
    this.parts.core.push(pelvis);
    marker(root, 0, 0, 0, 0.11, 'pelvis', P);
    marker(root, 0, -0.02, -0.07, 0.09, 'pelvis', P);

    const spine = (this.spine = new Group());
    spine.rotation.order = 'XYZ';
    spine.position.y = 0.03;
    root.add(spine);
    const torso = new Mesh(new CapsuleGeometry(0.13, 0.28, 6, 14), mat);
    torso.position.y = 0.24;
    torso.scale.set(1.22, 1, 0.82);
    torso.castShadow = true;
    spine.add(torso);
    this.parts.core.push(torso);
    marker(spine, 0, 0.2, 0, 0.11, 'back', P);
    marker(spine, 0, 0.4, 0, 0.11, 'chest', P);

    const neck = (this.neck = new Group());
    neck.position.y = 0.5;
    spine.add(neck);
    const neckM = capsule(0.045, 0.06, mat);
    neckM.position.y = 0.04;
    neck.add(neckM);
    const head = new Mesh(new SphereGeometry(0.115, 20, 14), mat);
    head.position.y = 0.17;
    head.castShadow = true;
    neck.add(head);
    const nose = new Mesh(new SphereGeometry(0.035, 10, 8), mat);
    nose.position.set(0, 0.16, 0.11);
    neck.add(nose);
    marker(neck, 0, 0.17, 0, 0.115, 'head', P);

    this.side = {};
    for (const [c, sg] of [['l', 1], ['r', -1]]) {
      const S = (this.side[c] = { sg });
      // bras
      S.sh = new Group(); S.sh.rotation.order = 'YXZ';
      S.sh.position.set(sg * 0.2, 0.44, 0);
      spine.add(S.sh);
      const shBall = new Mesh(new SphereGeometry(0.06, 12, 10), mat);
      shBall.castShadow = true; S.sh.add(shBall);
      S.tw = new Group(); S.sh.add(S.tw);
      const up = capsule(0.05, 0.27, mat); S.tw.add(up);
      S.el = new Group(); S.el.position.y = -0.29; S.tw.add(S.el);
      const fo = capsule(0.044, 0.25, mat); S.el.add(fo);
      const hand = new Mesh(new SphereGeometry(0.052, 12, 10), mat);
      hand.position.y = -0.29; hand.castShadow = true; S.el.add(hand);
      this.parts.arms.push(up, fo, hand, shBall);
      marker(S.sh, 0, 0, 0, 0.07, 'shoulder', P);
      marker(S.el, 0, 0, 0, 0.05, 'elbow', P);
      marker(S.el, 0, -0.29, 0, 0.05, 'hand', P);
      // jambes
      S.hip = new Group(); S.hip.rotation.order = 'YXZ';
      S.hip.position.set(sg * 0.1, -0.03, 0);
      root.add(S.hip);
      const th = capsule(0.072, 0.42, mat); S.hip.add(th);
      S.kn = new Group(); S.kn.position.y = -0.44; S.hip.add(S.kn);
      const sh = capsule(0.058, 0.41, mat); S.kn.add(sh);
      S.an = new Group(); S.an.position.y = -0.43; S.kn.add(S.an);
      const foot = new Mesh(new CapsuleGeometry(0.046, 0.12, 6, 10), mat);
      foot.rotation.x = Math.PI / 2; foot.position.set(0, -0.035, 0.06);
      foot.castShadow = true; S.an.add(foot);
      this.parts.legs.push(th, sh, foot);
      marker(S.kn, 0, 0, 0, 0.06, 'knee', P);
      marker(S.an, 0, -0.035, -0.02, 0.05, 'heel', P);
      marker(S.an, 0, -0.035, 0.13, 0.045, 'toe', P);
    }
    this.allMeshes = [pelvis, torso, ...this.parts.arms, ...this.parts.legs];
  }

  setHighlight(zones, color) {
    this.hiMat.color.setHex(color);
    const on = new Set();
    const z = zones === 'full' ? ['arms', 'legs', 'core'] : [].concat(zones || []);
    z.forEach(k => (this.parts[k] || []).forEach(m => on.add(m)));
    this.allMeshes.forEach(m => (m.material = on.has(m) ? this.hiMat : this.bodyMat));
  }

  apply(p) {
    this.root.rotation.set(p.rx * D, p.ry * D, p.rz * D);
    this.spine.rotation.set(p.sf * D, p.st * D, p.ss * D);
    this.neck.rotation.x = p.nk * D;
    for (const c of ['l', 'r']) {
      const S = this.side[c], sg = S.sg;
      S.sh.rotation.set(-p[c + 'sf'] * D, -sg * p[c + 'sh'] * D, sg * p[c + 'sa'] * D);
      S.tw.rotation.y = sg * p[c + 'st'] * D;
      S.el.rotation.x = -p[c + 'e'] * D;
      S.hip.rotation.set(-p[c + 'hf'] * D, 0, sg * p[c + 'ha'] * D);
      S.kn.rotation.x = p[c + 'k'] * D;
      S.an.rotation.x = (p[c + 'hf'] - p[c + 'k'] + p[c + 'a']) * D;
    }
  }

  // plus bas point (y - rayon) parmi une catégorie de repères
  low(names) {
    let m = Infinity;
    const v = new Vector3();
    for (const q of this.pts) {
      if (names && !names.includes(q.name)) continue;
      q.o.getWorldPosition(v);
      m = Math.min(m, v.y - q.r);
    }
    return m;
  }
  avg(names) {
    const v = new Vector3(), s = new Vector3();
    let n = 0;
    for (const q of this.pts) if (names.includes(q.name)) { q.o.getWorldPosition(v); s.add(v); n++; }
    return s.divideScalar(n || 1);
  }
}

const GROUPS = {
  hand: ['hand'], elbow: ['elbow'], toe: ['toe'], heel: ['heel'], foot: ['toe', 'heel'],
  arm: ['hand', 'elbow'], knee: ['knee'], pelvis: ['pelvis'],
};

function lerpPose(a, b, t) {
  const o = {};
  for (const k in a) o[k] = a[k] + (b[k] - a[k]) * t;
  return o;
}
const ease = t => t * t * (3 - 2 * t);

class Clip {
  constructor(def) {
    this.def = def;
    this.keys = def.keys.map(k => ({ ...DEFAULT_POSE, ...k }));
    this.cycle = def.cycle || 1.6;
  }
  pose(u) {
    const K = this.keys.length;
    if (K === 1) return this.keys[0];
    const s = (((u % 1) + 1) % 1) * K, i = Math.floor(s) % K, t = s - Math.floor(s);
    return lerpPose(this.keys[i], this.keys[(i + 1) % K], this.def.linear ? t : ease(t));
  }
}

class Stage {
  constructor() {
    const canvas = document.createElement('canvas');
    canvas.className = 'ex3d';
    const r = (this.renderer = new WebGLRenderer({ canvas, antialias: true, alpha: true, preserveDrawingBuffer: !!window.__EX3D_TEST__ }));
    r.setPixelRatio(Math.min(window.devicePixelRatio || 1, 3));
    r.outputColorSpace = SRGBColorSpace;
    r.shadowMap.enabled = true;
    r.shadowMap.type = PCFSoftShadowMap;
    this.canvas = canvas;
    this.scene = new Scene();
    this.cam = new PerspectiveCamera(32, ASPECT, 0.1, 50);

    this.scene.add(new HemisphereLight(0xffffff, 0x30364a, 1.9));
    const sun = (this.sun = new DirectionalLight(0xffffff, 1.7));
    sun.position.set(1.5, 4, 2.5);
    sun.castShadow = true;
    sun.shadow.mapSize.set(1024, 1024);
    Object.assign(sun.shadow.camera, { left: -2, right: 2, top: 2, bottom: -2, near: 0.5, far: 10 });
    sun.shadow.radius = 4;
    this.scene.add(sun, sun.target);

    const floor = new Mesh(new PlaneGeometry(8, 8), new ShadowMaterial({ opacity: 0.32 }));
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    this.scene.add(floor);
    // tapis de sol discret
    const c = document.createElement('canvas'); c.width = c.height = 128;
    const g = c.getContext('2d'), grd = g.createRadialGradient(64, 64, 4, 64, 64, 64);
    grd.addColorStop(0, 'rgba(255,255,255,0.08)'); grd.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = grd; g.fillRect(0, 0, 128, 128);
    const spot = (this.spot = new Mesh(new CircleGeometry(1.3, 40), new MeshBasicMaterial({ map: new CanvasTexture(c), transparent: true, depthWrite: false })));
    spot.rotation.x = -Math.PI / 2; spot.position.y = 0.001;
    this.scene.add(spot);

    this.man = new Mannequin();
    this.scene.add(this.man.root);
    this.bench = new Mesh(new BoxGeometry(1, 1, 1), new MeshLambertMaterial({ color: 0x4a5168 }));
    this.bench.castShadow = this.bench.receiveShadow = true;
    this.bench.visible = false;
    this.scene.add(this.bench);

    this.t = 0; this.paused = false; this.clip = null; this.raf = 0; this.last = 0;
  }

  // Place le corps : contrainte d'appui, contact au sol, point fixe.
  place(p) {
    const man = this.man, d = this.clip.def, root = man.root;
    man.apply(p);
    root.position.set(0, 0, 0);
    if (d.level) this.solveLevel(p, d.level);
    root.updateMatrixWorld(true);
    if (d.pin && this.pinRef) {
      const a = man.avg(GROUPS[d.pin]);
      root.position.add(this.pinRef.clone().sub(a));
      root.position.y += p.lift;
      return;
    }
    root.position.y = -man.low(d.contacts ? d.contacts.flatMap(g => GROUPS[g]) : null) + p.lift;
    root.updateMatrixWorld(true);
    if (this.anchorRef) {
      const a = man.avg(GROUPS[d.anchor]);
      root.position.x += this.anchorRef.x - a.x;
      root.position.z += this.anchorRef.z - a.z;
    } else {
      root.position.x = p.x + this.off.x;
      root.position.z = p.z + this.off.z;
    }
  }

  // Ajuste l'inclinaison du corps pour que deux appuis touchent le sol ensemble.
  solveLevel(p, lv) {
    const man = this.man, root = man.root, ax = lv.axis || 'rx';
    const base = p[ax] * D, A = GROUPS[lv.a], B = GROUPS[lv.b], dy = lv.dy || 0;
    const f = ang => {
      root.rotation[ax.slice(1)] = ang;
      root.updateMatrixWorld(true);
      return man.low(A) - man.low(B) - dy;
    };
    let lo = base - 45 * D, hi = base + 45 * D, flo = f(lo), fhi = f(hi);
    if (flo * fhi > 0) { f(base); return; }
    for (let i = 0; i < 18; i++) {
      const mid = (lo + hi) / 2, fm = f(mid);
      if (fm * flo > 0) { lo = mid; flo = fm; } else { hi = mid; }
    }
    f((lo + hi) / 2);
  }

  load(key, color) {
    const def = ANIMS[key];
    if (!def) return false;
    this.clip = new Clip(def);
    this.t = 0;
    this.man.setHighlight(def.hl, color);
    this.off = new Vector3(); this.anchorRef = null; this.pinRef = null;
    const man = this.man;

    // 1) références (point fixe) calculées sur la première pose
    this.place(this.clip.pose(0));
    if (def.pin) this.pinRef = man.avg(GROUPS[def.pin]);
    if (def.anchor) this.anchorRef = man.avg(GROUPS[def.anchor]);

    // 2) cadrage : boîte englobante sur tout le cycle
    const mn = new Vector3(Infinity, Infinity, Infinity), mx = mn.clone().negate(), v = new Vector3();
    for (let i = 0; i < 16; i++) {
      this.place(this.clip.pose(i / 16));
      man.root.updateMatrixWorld(true);
      for (const q of man.pts) { q.o.getWorldPosition(v); mn.min(v.clone().subScalar(q.r)); mx.max(v.clone().addScalar(q.r)); }
    }
    const c = mn.clone().add(mx).multiplyScalar(0.5);
    const shift = new Vector3(-c.x, 0, -c.z);
    this.off.add(shift);
    if (this.anchorRef) this.anchorRef.add(shift);
    if (this.pinRef) this.pinRef.add(shift);
    mn.add(shift); mx.add(shift);

    // banc / chaise
    this.bench.visible = !!def.bench;
    if (def.bench) {
      this.place(this.clip.pose(0));
      const h = man.avg(['hand']), top = man.low(['hand']);
      this.bench.scale.set(0.95, top, def.bench.depth || 0.38);
      this.bench.position.set(h.x, top / 2, h.z + (def.bench.dz || 0));
      mn.min(new Vector3(-0.5, 0, h.z - 0.2)); mx.max(new Vector3(0.5, top, h.z + 0.2));
    }

    // caméra
    const view = def.view || { az: 30, el: 12 };
    const size = mx.clone().sub(mn), center = new Vector3(0, (mn.y + mx.y) / 2, 0);
    const rad = Math.max(size.x, size.y * 1.15, size.z) * 0.5 + 0.12;
    const dist = rad / Math.tan(16 * D) * (view.zoom || 0.84);
    const az = view.az * D, el = view.el * D;
    this.cam.position.set(center.x + dist * Math.sin(az) * Math.cos(el), center.y + dist * Math.sin(el), center.z + dist * Math.cos(az) * Math.cos(el));
    this.cam.lookAt(center);
    this.spot.position.set(0, 0.001, 0);
    this.frame();
    return true;
  }

  frame() {
    if (!this.clip) return;
    this.place(this.clip.pose(this.t / this.clip.cycle));
    this.renderer.render(this.scene, this.cam);
  }

  resize() {
    const w = this.canvas.parentElement ? this.canvas.parentElement.clientWidth : 320;
    const cw = Math.min(w, 340), h = Math.round(cw / ASPECT);
    this.renderer.setSize(cw, h, true);
    this.cam.aspect = ASPECT;
    this.cam.updateProjectionMatrix();
  }

  loop = ts => {
    this.raf = requestAnimationFrame(this.loop);
    const dt = this.last ? Math.min((ts - this.last) / 1000, 0.1) : 0;
    this.last = ts;
    if (!this.paused) this.t += dt;
    this.frame();
  };
  start() { if (!this.raf) { this.last = 0; this.raf = requestAnimationFrame(this.loop); } }
  stop() { cancelAnimationFrame(this.raf); this.raf = 0; }
}

function webglOk() {
  try {
    const c = document.createElement('canvas');
    return !!(window.WebGLRenderingContext && (c.getContext('webgl2') || c.getContext('webgl')));
  } catch (e) { return false; }
}

let stage = null;
const api = {
  ok: false,
  has: key => !!ANIMS[key],
  // Affiche l'exercice `key` dans `el`, zone travaillée en `color`.
  show(el, key, color) {
    if (!stage || !ANIMS[key]) return false;
    if (stage.canvas.parentElement !== el) { el.innerHTML = ''; el.appendChild(stage.canvas); }
    stage.resize();
    stage.load(key, color);
    stage.start();
    return true;
  },
  setColor(color) { if (stage) stage.man.hiMat.color.setHex(color); },
  pause(b) { if (stage) stage.paused = !!b; },
  stop() { if (stage) stage.stop(); },
  // pour les tests : image fixe à une phase donnée du cycle
  still(key, u, color = 0xff5a3c) {
    stage.load(key, color);
    stage.t = u * stage.clip.cycle;
    stage.frame();
    return stage.canvas.toDataURL('image/png');
  },
  keys: () => Object.keys(ANIMS),
  define: (k, def) => { ANIMS[k] = def; },
  _stage: () => stage,
};
if (webglOk()) {
  try { stage = new Stage(); api.ok = true; } catch (e) { api.ok = false; }
}
window.Ex3D = api;
window.dispatchEvent(new Event('ex3d-ready'));
