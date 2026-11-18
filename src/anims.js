// Poses clés des exercices (angles en degrés).
// Corps : rx/ry/rz = orientation du bassin (rx -90 = allongé sur le dos, +90 = face au sol),
//   x/z = décalage, lift = hauteur de saut.
// Tronc : sf = flexion avant, st = rotation, ss = inclinaison latérale ; nk = tête.
// Bras (l/r) : sf = élévation avant, sa = écart sur le côté, sh = vers l'intérieur,
//   st = rotation du bras, e = flexion du coude.
// Jambes (l/r) : hf = genou vers l'avant, ha = écart, k = flexion du genou,
//   a = pointe du pied (le pied reste à plat par défaut).
// Options d'un exercice : view {az, el, zoom}, hl (zone colorée), cycle (s),
//   level {a, b, dy, axis} (deux appuis au sol ensemble), anchor (appui fixe),
//   pin (mains fixées), bench (chaise/banc sous les mains), wall (mur devant les mains),
//   contacts (appuis au sol), linear. level.coord 'z' = écart horizontal au lieu de hauteur.
export const DEFAULT_POSE = {
  x: 0, z: 0, lift: 0, rx: 0, ry: 0, rz: 0, sf: 0, st: 0, ss: 0, nk: 0,
  lsf: 0, lsa: 8, lsh: 0, lst: 0, le: 10, rsf: 0, rsa: 8, rsh: 0, rst: 0, re: 10,
  lhf: 0, lha: 3, lk: 2, la: 0, rhf: 0, rha: 3, rk: 2, ra: 0,
};

// échange gauche/droite d'une pose (x, rotations et inclinaisons inversées)
const M = p => {
  const o = {};
  for (const k in p) {
    if (k[0] === 'l' && k.length > 1 && k !== 'lift') o['r' + k.slice(1)] = p[k];
    else if (k[0] === 'r' && k.length > 1 && !['rx', 'ry', 'rz'].includes(k)) o['l' + k.slice(1)] = p[k];
    else if (['x', 'st', 'ss', 'ry', 'rz'].includes(k)) o[k] = -p[k];
    else o[k] = p[k];
  }
  return o;
};
const W = (...ps) => Object.assign({}, ...ps);

const FRONT = { az: 28, el: 10 };
const SIDE = { az: 72, el: 14 };
const BACK_SIDE = { az: 105, el: 20 };

// positions réutilisées
const TEMPLES = { lsa: 125, rsa: 125, lst: 80, rst: 80, le: 150, re: 150, lsf: 15, rsf: 15 };
const SUPINE = { rx: -90 };
const PRONE = { rx: 90, lsf: 90, rsf: 90, lsa: 6, rsa: 6, le: 0, re: 0 };
const PLANK_LV = { a: 'hand', b: 'toe' };

const jjClosed = { lsa: 12, rsa: 12 };
const jjAir = { lsa: 95, rsa: 95, lha: 10, rha: 10, lift: 0.1, la: 25, ra: 25 };
const jjOpen = { lsa: 170, rsa: 170, le: 8, re: 8, lha: 17, rha: 17, lk: 5, rk: 5 };

const hk = { lhf: 88, lk: 95, rk: 4, lsf: -30, le: 80, rsf: 40, re: 80, lift: 0.02, sf: 4, la: 15 };
const hkMid = { lsf: 5, rsf: 5, le: 80, re: 80, lift: 0.06, la: 20, ra: 20, lk: 8, rk: 8 };
const march = { lhf: 72, lk: 80, lsf: -20, le: 60, rsf: 25, re: 60, la: 10 };
const marchMid = { le: 60, re: 60 };
const bk = { lhf: -12, lk: 120, la: 30, lsf: 25, le: 85, rsf: -25, re: 85, lift: 0.02 };
const bkMid = { le: 85, re: 85, lift: 0.06, la: 20, ra: 20, lk: 8, rk: 8 };

const squatDown = { lhf: 95, rhf: 95, lk: 120, rk: 120, lha: 10, rha: 10, sf: 40, lsf: 70, rsf: 70, le: 10, re: 10 };
const skL = { x: 0.38, lhf: 50, lk: 70, rhf: -22, rk: 40, rha: -18, sf: 30, rsf: 45, rsh: 40, re: 30, lsf: -30, le: 20 };
const skMid = { lift: 0.13, lhf: 20, rhf: 20, lk: 30, rk: 30, sf: 20 };

const burpSquat = { lhf: 110, rhf: 110, lk: 130, rk: 130, sf: 55, lsf: 120, rsf: 120, le: 0, re: 0, lha: 8, rha: 8 };
const burpPlank = { rx: 70, z: -0.3, lsf: 90, rsf: 90, le: 0, re: 0, lsa: 6, rsa: 6 };

const circle = (r, n) => Array.from({ length: n }, (_, i) => {
  const a = (i / n) * Math.PI * 2;
  return { lsa: 90 + r * Math.sin(a), rsa: 90 + r * Math.sin(a), lsh: r * Math.cos(a), rsh: r * Math.cos(a), le: 0, re: 0 };
});

const lunge = { lhf: -32, lk: 100, la: 45, rhf: 82, rk: 92, sf: 4, lsa: 12, rsa: 12 };
const sCrunch = W(TEMPLES, { lhf: 85, lk: 95, st: 28, ss: 10, sf: 12 });

// bras croisés sur la poitrine (conseil Mayo Clinic pour ménager la nuque)
const CHEST = { lsf: 35, rsf: 35, lsh: 70, rsh: 70, le: 115, re: 115, lsa: 8, rsa: 8 };
const crunchBase = W(SUPINE, CHEST, { lhf: 50, rhf: 50, lk: 105, rk: 105 });
const bike = W(SUPINE, TEMPLES, { sf: 30, st: -24, lhf: 85, lk: 95, rhf: 22, rk: 4 });
const russian = { rx: -45, lhf: 112, rhf: 112, lk: 95, rk: 95, lsf: 60, rsf: 60, le: 85, re: 85, lsh: 35, rsh: 35 };

const fPlank = W(PRONE, { le: 90, re: 90 });
const sPlank = { rz: 70, rsa: 70, re: 90, lsa: 110, le: 0, lha: 0, rha: 0 };
const pushUp = W(PRONE, { lsa: 12, rsa: 12 });
const pushDn = W(PRONE, { lsf: 6, rsf: 6, le: 98, re: 98, lsa: 28, rsa: 28 });
const tap = W(PRONE, { lha: 10, rha: 10, lsf: 40, lsh: 50, le: 140 });

const dipUp = { lsf: -45, rsf: -45, le: 0, re: 0, lsa: 8, rsa: 8, lhf: 85, rhf: 85, lk: 85, rk: 85 };
const dipDn = { lsf: -75, rsf: -75, le: 85, re: 85, lsa: 8, rsa: 8, lhf: 70, rhf: 70, lk: 90, rk: 90 };

const pike = { rx: 135, lhf: 95, rhf: 95, lsf: 178, rsf: 178, le: 0, re: 0 };
const fold = { sf: 115, lsf: 165, rsf: 165, le: 0, re: 0 };

const QUAD = W(PRONE, { lhf: 90, rhf: 90, lk: 90, rk: 90, la: 40, ra: 40, lha: 6, rha: 6 });
const bridgeDown = W(SUPINE, { lhf: 50, rhf: 50, lk: 105, rk: 105 });
const bridgeUp = { rx: -112, lhf: -15, rhf: -15, lk: 100, rk: 100, lsf: -25, rsf: -25, le: 0, re: 0 };
const birdA = W(QUAD, { rsf: 178, lhf: 0, lk: 0, la: 20 });

export const ANIMS = {
  // ---------- cardio ----------
  jumpingJacks: { keys: [jjClosed, jjAir, jjOpen, jjAir], cycle: 1.0, view: FRONT, hl: 'legs' },
  highKnees: { keys: [hk, hkMid, M(hk), hkMid], cycle: 0.72, view: FRONT, hl: 'legs' },
  buttKicks: { keys: [bk, bkMid, M(bk), bkMid], cycle: 0.72, view: { az: 55, el: 10 }, hl: 'legs' },
  mountainClimbers: {
    keys: [W(PRONE, { rx: 62, lhf: 88, lk: 135, la: 10 }), W(PRONE, { rx: 62, rhf: 88, rk: 135, ra: 10 })],
    cycle: 0.64, view: SIDE, hl: 'core', anchor: 'hand', contacts: ['hand'],
  },
  burpees: {
    keys: [{}, burpSquat, burpPlank, burpSquat, { lsf: 165, rsf: 165, le: 5, re: 5, lift: 0.2, la: 30, ra: 30 }],
    cycle: 3.0, view: SIDE, hl: 'full',
  },
  squatJumps: {
    keys: [squatDown, { lsf: 160, rsf: 160, le: 5, re: 5, lift: 0.2, la: 30, ra: 30, lha: 8, rha: 8 }],
    cycle: 1.2, view: FRONT, hl: 'legs',
  },
  skater: { keys: [skL, skMid, M(skL), skMid], cycle: 1.4, view: { az: 0, el: 12 }, hl: 'legs' },
  crossJacks: {
    keys: [{ lsa: 85, rsa: 85, lha: 17, rha: 17, le: 0, re: 0 }, jjAir,
      { lsf: 80, rsf: 80, lsh: 30, rsh: 30, lsa: 0, rsa: 0, le: 0, re: 0, lha: -6, rha: -6 }, jjAir],
    cycle: 1.1, view: FRONT, hl: 'legs',
  },
  plankJacks: {
    keys: [PRONE, W(PRONE, { lha: 8, rha: 8, lift: 0.05 }), W(PRONE, { lha: 16, rha: 16 }), W(PRONE, { lha: 8, rha: 8, lift: 0.05 })],
    cycle: 1.0, view: { az: 140, el: 26 }, hl: 'legs', level: PLANK_LV, anchor: 'hand',
  },
  // ---------- cardio doux (mode réveil) ----------
  stepJacks: {
    keys: [jjClosed, { lsa: 150, rsa: 150, lha: 20, lk: 4 }, jjClosed, { lsa: 150, rsa: 150, rha: 20, rk: 4 }],
    cycle: 2.6, view: FRONT, hl: 'legs',
  },
  march: { keys: [march, marchMid, M(march), marchMid], cycle: 1.6, view: FRONT, hl: 'legs' },
  squat: { keys: [{ lha: 12, rha: 12 }, W(squatDown, { lsf: 85, rsf: 85 })], cycle: 2.6, view: FRONT, hl: 'legs' },
  reverseLunge: { keys: [{}, lunge, {}, M(lunge)], cycle: 3.6, view: { az: 60, el: 10 }, hl: 'legs' },
  standingCrunch: { keys: [W(TEMPLES), sCrunch, W(TEMPLES), M(sCrunch)], cycle: 2.2, view: FRONT, hl: 'core' },
  torsoTwist: {
    keys: [{ st: 45, lsf: 90, rsf: 90, le: 0, re: 0, lsh: 28, rsh: 28, lha: 10, rha: 10 },
      { st: -45, lsf: 90, rsf: 90, le: 0, re: 0, lsh: 28, rsh: 28, lha: 10, rha: 10 }],
    cycle: 2.2, view: { az: 20, el: 32 }, hl: 'core',
  },
  // ---------- abdos / gainage ----------
  crunch: { keys: [crunchBase, W(crunchBase, { sf: 38, nk: 12 })], cycle: 1.8, view: { az: 70, el: 25 }, hl: 'core' },
  legRaises: {
    keys: [W(SUPINE, { lhf: 8, rhf: 8 }), W(SUPINE, { lhf: 85, rhf: 85 })],
    cycle: 2.4, view: BACK_SIDE, hl: 'core',
  },
  reverseCrunch: {
    keys: [W(SUPINE, { lhf: 85, rhf: 85, lk: 90, rk: 90 }), { rx: -112, sf: 22, lhf: 120, rhf: 120, lk: 95, rk: 95 }],
    cycle: 1.8, view: BACK_SIDE, hl: 'core',
  },
  flutterKicks: {
    keys: [W(SUPINE, { lhf: 28, rhf: 10, nk: 15, sf: 6 }), W(SUPINE, { lhf: 10, rhf: 28, nk: 15, sf: 6 })],
    cycle: 0.6, view: BACK_SIDE, hl: 'core',
  },
  toeTouches: {
    keys: [W(SUPINE, { lhf: 88, rhf: 88, lsf: 95, rsf: 95, le: 0, re: 0 }),
      W(SUPINE, { lhf: 88, rhf: 88, sf: 38, nk: 10, lsf: 115, rsf: 115, le: 0, re: 0 })],
    cycle: 1.6, view: BACK_SIDE, hl: 'core',
  },
  hollowHold: {
    keys: [W(SUPINE, { sf: 20, nk: 8, lhf: 25, rhf: 25, lsf: 170, rsf: 170, le: 0, re: 0 }),
      W(SUPINE, { sf: 23, nk: 8, lhf: 28, rhf: 28, lsf: 170, rsf: 170, le: 0, re: 0 })],
    cycle: 2.6, view: BACK_SIDE, hl: 'core',
  },
  bicycle: { keys: [bike, M(bike)], cycle: 1.3, view: BACK_SIDE, hl: 'core' },
  russianTwist: { keys: [W(russian, { st: 40 }), W(russian, { st: -40 })], cycle: 1.4, view: { az: 25, el: 18 }, hl: 'core' },
  plank: {
    keys: [fPlank, W(fPlank, { nk: -6 })], cycle: 3, view: SIDE, hl: 'core',
    level: { a: 'elbow', b: 'toe' }, anchor: 'toe',
  },
  sidePlank: {
    keys: [sPlank, W(sPlank, { ss: -8 })], cycle: 2.6, view: { az: 8, el: 14 }, hl: 'core',
    level: { a: 'elbow', b: 'foot', axis: 'rz' },
  },
  // ---------- ajouts Mayo Clinic / BHF / ACE ----------
  gluteBridge: {
    keys: [bridgeDown, bridgeUp], cycle: 2.4, view: { az: 100, el: 22 }, hl: 'core',
    level: { a: 'chest', b: 'heel' },
  },
  birdDog: {
    keys: [QUAD, birdA, QUAD, M(birdA)], cycle: 4.0, view: { az: 60, el: 18 }, hl: 'core',
    level: { a: 'hand', b: 'knee' }, contacts: ['hand', 'knee', 'toe'],
  },
  kneePlank: {
    keys: [W(fPlank, { lk: 95, rk: 95 }), W(fPlank, { lk: 95, rk: 95, nk: -6 })], cycle: 3, view: SIDE, hl: 'core',
    level: { a: 'elbow', b: 'knee' },
  },
  catCow: {
    keys: [W(QUAD, { nk: 45, sf: 6, lsf: 96, rsf: 96 }), W(QUAD, { nk: -35, sf: -8, lsf: 84, rsf: 84 })],
    cycle: 3.2, view: { az: 85, el: 8 }, hl: 'core', contacts: ['hand', 'knee', 'toe'],
  },
  wallPush: {
    keys: [{ rx: 18, lsf: 72, rsf: 72, le: 0, re: 0, lsa: 10, rsa: 10 }, { rx: 30, lsf: 65, rsf: 65, le: 95, re: 95, lsa: 25, rsa: 25 }],
    cycle: 2.2, view: { az: 75, el: 10 }, hl: 'arms', level: { a: 'hand', b: 'toe', coord: 'z', dz: 0.95 }, anchor: 'toe', wall: {},
  },
  cobra: {
    keys: [W(PRONE, { lsf: 15, rsf: 15, le: 120, re: 120, lsa: 30, rsa: 30 }),
      W(PRONE, { sf: -40, nk: -15, lsf: 55, rsf: 55, le: 25, re: 25, lsa: 15, rsa: 15 })],
    cycle: 3.0, view: { az: 75, el: 14 }, hl: 'core',
  },
  // ---------- haut du corps ----------
  pushUp: { keys: [pushUp, pushDn], cycle: 1.8, view: SIDE, hl: 'arms', level: PLANK_LV, anchor: 'toe' },
  inclinePush: {
    keys: [pushUp, pushDn], cycle: 1.8, view: SIDE, hl: 'arms',
    level: { a: 'hand', b: 'toe', dy: 0.42 }, anchor: 'toe', bench: { depth: 0.55 },
  },
  diamondPush: {
    keys: [W(pushUp, { lsa: 0, rsa: 0, lsh: 22, rsh: 22 }), W(pushDn, { lsa: 40, rsa: 40, lsh: 10, rsh: 10 })],
    cycle: 1.8, view: { az: 50, el: 18 }, hl: 'arms', level: PLANK_LV, anchor: 'toe',
  },
  widePush: {
    keys: [W(pushUp, { lsa: 35, rsa: 35 }), W(pushDn, { lsa: 55, rsa: 55 })],
    cycle: 1.8, view: { az: 50, el: 18 }, hl: 'arms', level: PLANK_LV, anchor: 'toe',
  },
  dips: { keys: [dipUp, dipDn], cycle: 1.8, view: { az: 60, el: 12 }, hl: 'arms', pin: 'hand', bench: { dz: -0.08 } },
  pikePush: {
    keys: [pike, W(pike, { lsf: 150, rsf: 150, le: 70, re: 70, nk: 20 })],
    cycle: 1.8, view: { az: 85, el: 10 }, hl: 'arms', level: PLANK_LV, anchor: 'toe',
  },
  superman: {
    keys: [{ rx: 90, lsf: 178, rsf: 178, le: 0, re: 0 },
      { rx: 90, sf: -14, nk: -12, lsf: 192, rsf: 192, le: 0, re: 0, lhf: -14, rhf: -14 }],
    cycle: 2.0, view: { az: 80, el: 14 }, hl: 'core',
  },
  plankUpDown: {
    keys: [fPlank, W(fPlank, { le: 0 }), PRONE, W(PRONE, { le: 90 }), fPlank],
    cycle: 3.2, view: { az: 60, el: 18 }, hl: 'arms', level: { a: 'arm', b: 'toe' }, anchor: 'toe',
  },
  armCircles: { keys: circle(16, 8), linear: true, cycle: 1.0, view: { az: 15, el: 12 }, hl: 'arms' },
  shoulderTaps: {
    keys: [tap, W(PRONE, { lha: 10, rha: 10 }), M(tap), W(PRONE, { lha: 10, rha: 10 })],
    cycle: 1.8, view: { az: 58, el: 24 }, hl: 'arms', level: PLANK_LV, anchor: 'toe',
  },
  inchworm: {
    keys: [{}, fold, pike, PRONE, pike, fold],
    cycle: 4.5, view: SIDE, hl: 'arms', anchor: 'toe',
  },
};
