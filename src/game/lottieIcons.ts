import type { LottieIconKind } from "../types/game";

type Color = [number, number, number, number];
type Point = [number, number];

const ease = {
  i: { x: [0.42, 0.42, 0.42], y: [1, 1, 1] },
  o: { x: [0.58, 0.58, 0.58], y: [0, 0, 0] },
};

const singleEase = {
  i: { x: [0.42], y: [1] },
  o: { x: [0.58], y: [0] },
};

const iconColors: Record<LottieIconKind, { primary: Color; secondary: Color; accent: Color; dark: Color; light: Color }> = {
  smile: {
    primary: [1, 0.78, 0.24, 1],
    secondary: [0.33, 0.8, 1, 1],
    accent: [1, 0.48, 0.72, 1],
    dark: [0.28, 0.19, 0.42, 1],
    light: [1, 0.96, 0.82, 1],
  },
  spark: {
    primary: [1, 0.57, 0.78, 1],
    secondary: [0.58, 0.78, 1, 1],
    accent: [1, 0.9, 0.3, 1],
    dark: [0.34, 0.24, 0.55, 1],
    light: [1, 0.94, 0.99, 1],
  },
  heart: {
    primary: [1, 0.35, 0.59, 1],
    secondary: [1, 0.74, 0.88, 1],
    accent: [0.5, 0.84, 1, 1],
    dark: [0.46, 0.23, 0.43, 1],
    light: [1, 0.91, 0.96, 1],
  },
  coin: {
    primary: [1, 0.78, 0.18, 1],
    secondary: [1, 0.49, 0.22, 1],
    accent: [0.54, 0.82, 1, 1],
    dark: [0.45, 0.28, 0.12, 1],
    light: [1, 0.94, 0.62, 1],
  },
  gift: {
    primary: [0.56, 0.77, 1, 1],
    secondary: [1, 0.52, 0.82, 1],
    accent: [1, 0.86, 0.36, 1],
    dark: [0.34, 0.24, 0.55, 1],
    light: [1, 0.93, 0.98, 1],
  },
  bag: {
    primary: [0.43, 0.88, 0.75, 1],
    secondary: [1, 0.78, 0.32, 1],
    accent: [0.45, 0.74, 1, 1],
    dark: [0.24, 0.36, 0.39, 1],
    light: [0.91, 1, 0.96, 1],
  },
  brush: {
    primary: [1, 0.58, 0.73, 1],
    secondary: [0.58, 0.84, 1, 1],
    accent: [1, 0.86, 0.36, 1],
    dark: [0.38, 0.28, 0.48, 1],
    light: [1, 0.95, 0.99, 1],
  },
  tools: {
    primary: [0.7, 0.58, 1, 1],
    secondary: [0.54, 0.86, 1, 1],
    accent: [1, 0.7, 0.36, 1],
    dark: [0.34, 0.3, 0.52, 1],
    light: [0.94, 0.96, 1, 1],
  },
  rocket: {
    primary: [0.48, 0.84, 1, 1],
    secondary: [1, 0.48, 0.7, 1],
    accent: [1, 0.84, 0.26, 1],
    dark: [0.26, 0.3, 0.55, 1],
    light: [0.94, 0.98, 1, 1],
  },
  trophy: {
    primary: [1, 0.76, 0.22, 1],
    secondary: [1, 0.55, 0.32, 1],
    accent: [0.62, 0.83, 1, 1],
    dark: [0.45, 0.28, 0.13, 1],
    light: [1, 0.95, 0.66, 1],
  },
  crown: {
    primary: [1, 0.78, 0.2, 1],
    secondary: [1, 0.43, 0.77, 1],
    accent: [0.5, 0.84, 1, 1],
    dark: [0.42, 0.26, 0.32, 1],
    light: [1, 0.96, 0.67, 1],
  },
  gem: {
    primary: [0.61, 0.86, 1, 1],
    secondary: [0.85, 0.58, 1, 1],
    accent: [1, 0.56, 0.83, 1],
    dark: [0.28, 0.26, 0.54, 1],
    light: [0.95, 0.98, 1, 1],
  },
};

function v(k: unknown) {
  return { a: 0, k };
}

function scalePulse(base = 100, peak = 107) {
  return {
    a: 1,
    k: [
      { t: 0, s: [base, base, 100], e: [peak, peak, 100], ...ease },
      { t: 45, s: [peak, peak, 100], e: [base, base, 100], ...ease },
      { t: 90, s: [base, base, 100] },
    ],
  };
}

function rotationPulse(from: number, to: number) {
  return {
    a: 1,
    k: [
      { t: 0, s: [from], e: [to], ...singleEase },
      { t: 45, s: [to], e: [from], ...singleEase },
      { t: 90, s: [from] },
    ],
  };
}

function transform(x = 0, y = 0, rotation = 0) {
  return {
    ty: "tr",
    p: v([x, y]),
    a: v([0, 0]),
    s: v([100, 100]),
    r: v(rotation),
    o: v(100),
    sk: v(0),
    sa: v(0),
    nm: "Transform",
  };
}

function fill(color: Color) {
  return { ty: "fl", c: v(color), o: v(100), r: 1, bm: 0, nm: "Fill" };
}

function stroke(color: Color, width: number) {
  return { ty: "st", c: v(color), o: v(100), w: v(width), lc: 2, lj: 2, bm: 0, nm: "Stroke" };
}

function ellipse(x: number, y: number, width: number, height: number) {
  return { ty: "el", p: v([x, y]), s: v([width, height]), d: 1, nm: "Ellipse" };
}

function rect(x: number, y: number, width: number, height: number, radius = 8) {
  return { ty: "rc", p: v([x, y]), s: v([width, height]), r: v(radius), d: 1, nm: "Rounded rectangle" };
}

function star(x: number, y: number, points: number, outer: number, inner: number, rotation = 0) {
  return {
    ty: "sr",
    sy: 1,
    d: 1,
    pt: v(points),
    p: v([x, y]),
    r: v(rotation),
    or: v(outer),
    os: v(0),
    ir: v(inner),
    is: v(0),
    nm: "Star",
  };
}

function path(points: Point[]) {
  return {
    ty: "sh",
    ks: {
      a: 0,
      k: {
        i: points.map(() => [0, 0]),
        o: points.map(() => [0, 0]),
        v: points,
        c: true,
      },
    },
    nm: "Path",
  };
}

function group(name: string, items: unknown[], x = 0, y = 0, rotation = 0) {
  return { ty: "gr", it: [...items, transform(x, y, rotation)], nm: name };
}

function shapeGroup(name: string, shape: unknown, color: Color, x = 0, y = 0, rotation = 0) {
  return group(name, [shape, fill(color)], x, y, rotation);
}

function strokedGroup(name: string, shape: unknown, color: Color, width: number) {
  return group(name, [shape, stroke(color, width)]);
}

function layer(name: string, groups: unknown[], rotation = 0, pulse = true) {
  return {
    ddd: 0,
    ind: 1,
    ty: 4,
    nm: name,
    sr: 1,
    ks: {
      o: v(100),
      r: rotation ? rotationPulse(-rotation, rotation) : v(0),
      p: v([48, 48, 0]),
      a: v([48, 48, 0]),
      s: pulse ? scalePulse() : v([100, 100, 100]),
    },
    ao: 0,
    shapes: groups,
    ip: 0,
    op: 90,
    st: 0,
    bm: 0,
  };
}

function iconGroups(kind: LottieIconKind) {
  const c = iconColors[kind];
  const shine = shapeGroup("shine", ellipse(32, 30, 18, 10), [1, 1, 1, 0.58]);

  if (kind === "smile") {
    return [
      shapeGroup("face", ellipse(48, 50, 72, 66), c.primary),
      shapeGroup("left eye", ellipse(38, 44, 6, 8), c.dark),
      shapeGroup("right eye", ellipse(58, 44, 6, 8), c.dark),
      strokedGroup("smile", path([[36, 55], [43, 63], [56, 63], [64, 55]]), c.dark, 4),
      shine,
    ];
  }

  if (kind === "spark") {
    return [
      shapeGroup("star body", star(48, 48, 5, 39, 16, -18), c.primary),
      shapeGroup("small sparkle", star(70, 25, 4, 9, 3, 20), c.accent),
      shapeGroup("small sparkle 2", star(25, 68, 4, 7, 2, -10), c.secondary),
      shine,
    ];
  }

  if (kind === "heart") {
    return [
      shapeGroup("heart left", ellipse(38, 41, 34, 34), c.primary),
      shapeGroup("heart right", ellipse(58, 41, 34, 34), c.primary),
      shapeGroup("heart point", rect(48, 58, 39, 39, 4), c.primary, 0, 0, 45),
      shapeGroup("heart shine", ellipse(39, 36, 10, 6), c.light),
    ];
  }

  if (kind === "coin") {
    return [
      shapeGroup("coin", ellipse(48, 48, 72, 72), c.primary),
      shapeGroup("coin inset", ellipse(48, 48, 52, 52), c.secondary),
      shapeGroup("coin shine", rect(45, 48, 8, 32, 4), c.light),
      shapeGroup("coin dot", ellipse(58, 35, 8, 8), c.accent),
    ];
  }

  if (kind === "gift") {
    return [
      shapeGroup("box", rect(48, 58, 66, 48, 10), c.primary),
      shapeGroup("lid", rect(48, 35, 70, 20, 8), c.secondary),
      shapeGroup("ribbon vertical", rect(48, 51, 12, 56, 4), c.accent),
      shapeGroup("ribbon horizontal", rect(48, 47, 58, 10, 4), c.accent),
      shapeGroup("bow left", ellipse(39, 27, 20, 14), c.secondary, 0, 0, -20),
      shapeGroup("bow right", ellipse(57, 27, 20, 14), c.secondary, 0, 0, 20),
    ];
  }

  if (kind === "bag") {
    return [
      strokedGroup("handle", path([[34, 40], [36, 26], [48, 22], [60, 26], [62, 40]]), c.dark, 5),
      shapeGroup("bag body", rect(48, 58, 66, 50, 13), c.primary),
      shapeGroup("bag flap", rect(48, 43, 42, 12, 7), c.secondary),
      shapeGroup("badge", ellipse(64, 60, 12, 12), c.accent),
    ];
  }

  if (kind === "brush") {
    return [
      shapeGroup("handle", rect(48, 50, 13, 52, 6), c.secondary, 0, 0, 35),
      shapeGroup("ferrule", rect(62, 31, 18, 13, 5), c.dark, 0, 0, 35),
      shapeGroup("paint", ellipse(67, 24, 30, 24), c.primary, 0, 0, 35),
      shapeGroup("paint drop", ellipse(29, 65, 12, 12), c.accent),
    ];
  }

  if (kind === "tools") {
    return [
      shapeGroup("tool one", rect(44, 50, 16, 66, 7), c.secondary, 0, 0, -35),
      shapeGroup("tool two", rect(56, 50, 16, 66, 7), c.primary, 0, 0, 35),
      shapeGroup("bolt", star(48, 48, 6, 20, 10, 30), c.accent),
      shapeGroup("cap", ellipse(28, 29, 16, 16), c.dark),
    ];
  }

  if (kind === "rocket") {
    return [
      shapeGroup("flame", star(35, 69, 5, 18, 7, 18), c.accent),
      shapeGroup("rocket body", ellipse(50, 45, 36, 74), c.primary, 0, 0, -28),
      shapeGroup("window", ellipse(51, 38, 14, 14), c.light),
      shapeGroup("fin left", path([[32, 58], [18, 69], [37, 70]]), c.secondary),
      shapeGroup("fin right", path([[58, 61], [61, 80], [73, 64]]), c.secondary),
    ];
  }

  if (kind === "trophy") {
    return [
      shapeGroup("cup", rect(48, 42, 54, 42, 14), c.primary),
      strokedGroup("left handle", path([[28, 38], [15, 40], [17, 54], [30, 54]]), c.primary, 5),
      strokedGroup("right handle", path([[68, 38], [81, 40], [79, 54], [66, 54]]), c.primary, 5),
      shapeGroup("stem", rect(48, 65, 12, 20, 5), c.secondary),
      shapeGroup("base", rect(48, 76, 38, 12, 6), c.dark),
      shine,
    ];
  }

  if (kind === "crown") {
    return [
      shapeGroup("crown", path([[18, 64], [27, 27], [42, 50], [48, 20], [58, 50], [73, 27], [82, 64]]), c.primary),
      shapeGroup("band", rect(48, 65, 54, 14, 6), c.secondary),
      shapeGroup("jewel", ellipse(48, 61, 12, 12), c.accent),
      shine,
    ];
  }

  return [
    shapeGroup("gem", path([[48, 14], [80, 36], [68, 74], [48, 86], [28, 74], [16, 36]]), c.primary),
    shapeGroup("gem left", path([[22, 38], [38, 38], [32, 72]]), c.secondary),
    shapeGroup("gem right", path([[74, 38], [58, 38], [64, 72]]), c.accent),
    strokedGroup("gem shine", path([[39, 34], [48, 22], [57, 34]]), c.light, 3),
  ];
}

export function createLottieIconData(kind: LottieIconKind) {
  return {
    v: "5.7.4",
    fr: 30,
    ip: 0,
    op: 90,
    w: 96,
    h: 96,
    nm: `merge-${kind}`,
    ddd: 0,
    assets: [],
    layers: [layer(`animated-${kind}`, iconGroups(kind), kind === "coin" || kind === "spark" || kind === "rocket" ? 5 : 3)],
  };
}
