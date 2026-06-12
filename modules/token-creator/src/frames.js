// frames.js — procedural frame graphics for the Token Creator.
//
// These texture + frame-drawing routines are ported VERBATIM from the original
// tool (reference_sources/foundry-token-creator/src/main.js, via
// reference_sources/design_handoff_dnd_toolbox/design-reference/token-creator.jsx).
// Do not change the graphics — `frameDefs` exposes the 10 built-in frames.
//
// Each draw function takes a 2D canvas context `c` and a square size `s`.

/* ── TEXTURE HELPERS (verbatim) ── */
function seededRand(seed) {
  return function () {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };
}
function textureSoftNoise(txS, rng, colFn) {
  var oc = document.createElement('canvas');
  oc.width = oc.height = txS;
  var c2 = oc.getContext('2d');
  var cell = 8,
    cw = Math.ceil(txS / cell) + 1,
    grid = [];
  for (var i = 0; i < cw * cw; i++) grid.push(rng());
  function sample(x, y) {
    var cx = Math.floor(x / cell),
      cy = Math.floor(y / cell);
    var fx = x / cell - cx,
      fy = y / cell - cy;
    fx = fx * fx * (3 - 2 * fx);
    fy = fy * fy * (3 - 2 * fy);
    var a = grid[cy * cw + cx] || 0,
      b = grid[cy * cw + cx + 1] || 0;
    var d = grid[(cy + 1) * cw + cx] || 0,
      e = grid[(cy + 1) * cw + cx + 1] || 0;
    return a + (b - a) * fx + (d - a) * fy + (a - b - d + e) * fx * fy;
  }
  var id = c2.createImageData(txS, txS),
    dd = id.data;
  for (var y = 0; y < txS; y++)
    for (var x = 0; x < txS; x++) {
      var n = sample(x, y),
        col = colFn(n),
        idx = (y * txS + x) * 4;
      dd[idx] = col[0];
      dd[idx + 1] = col[1];
      dd[idx + 2] = col[2];
      dd[idx + 3] = col[3];
    }
  c2.putImageData(id, 0, 0);
  return oc;
}
function textureMetal(txS, r, g, b) {
  return textureSoftNoise(txS, seededRand(42), function (n) {
    var v = Math.floor(n * 50 - 25);
    return [
      Math.max(0, Math.min(255, r + v)),
      Math.max(0, Math.min(255, g + Math.floor(v * 0.9))),
      Math.max(0, Math.min(255, b + Math.floor(v * 0.7))),
      40 + Math.floor(n * 35),
    ];
  });
}
function textureHammered(txS) {
  return textureSoftNoise(txS, seededRand(77), function (n) {
    var v = Math.floor(80 + n * 60);
    return [v, v, v, Math.floor(20 + n * 40)];
  });
}
function textureWood(txS) {
  return textureSoftNoise(txS, seededRand(13), function (n) {
    var dark = n < 0.3;
    return dark ? [25, 8, 0, Math.floor(50 + n * 60)] : [70, 28, 4, Math.floor(25 + n * 35)];
  });
}
function textureBark(txS) {
  return textureSoftNoise(txS, seededRand(31), function (n) {
    return [Math.floor(30 + n * 40), Math.floor(10 + n * 18), 0, Math.floor(20 + n * 40)];
  });
}
function textureArcaneShimmer(txS) {
  return textureSoftNoise(txS, seededRand(7), function (n) {
    var v = Math.floor(n * 60);
    return [30 + v, 0 + Math.floor(v * 0.4), 60 + v, Math.floor(30 + n * 55)];
  });
}
function textureSoftMoss(txS) {
  return textureSoftNoise(txS, seededRand(23), function (n) {
    return [Math.floor(n * 18), Math.floor(30 + n * 50), Math.floor(n * 12), Math.floor(25 + n * 45)];
  });
}
function textureSoftEmber(txS) {
  return textureSoftNoise(txS, seededRand(55), function (n) {
    var hot = n > 0.72;
    return hot
      ? [Math.floor(80 + n * 100), Math.floor(n * 30), 0, Math.floor(40 + n * 60)]
      : [10, 0, 0, Math.floor(n * 25)];
  });
}
function textureSoftStars(txS) {
  return textureSoftNoise(txS, seededRand(61), function (n) {
    return [Math.floor(n * 20), Math.floor(n * 30), Math.floor(30 + n * 60), Math.floor(20 + n * 40)];
  });
}
var TX = 128;
function drawTexture(c, s, lw, tex) {
  var r = s / 2,
    cx = r,
    cy = r,
    ro = r - 1,
    ri = r - lw;
  c.save();
  c.beginPath();
  c.arc(cx, cy, ro, 0, Math.PI * 2);
  c.arc(cx, cy, ri, 0, Math.PI * 2, true);
  c.clip('evenodd');
  c.fillStyle = c.createPattern(tex, 'repeat');
  c.fillRect(0, 0, s, s);
  c.restore();
}
function volumetricRing(c, s, lw, dark, mid, hi) {
  var r = s / 2,
    cx = r,
    cy = r,
    ro = r - 1,
    ri = r - lw;
  c.save();
  c.shadowColor = 'rgba(0,0,0,0.72)';
  c.shadowBlur = s * 0.035;
  c.shadowOffsetX = s * 0.012;
  c.shadowOffsetY = s * 0.016;
  c.beginPath();
  c.arc(cx, cy, ro, 0, Math.PI * 2);
  c.arc(cx, cy, ri, 0, Math.PI * 2, true);
  c.fillStyle = dark;
  c.fill('evenodd');
  c.restore();
  c.beginPath();
  c.arc(cx, cy, ro, 0, Math.PI * 2);
  c.arc(cx, cy, ri, 0, Math.PI * 2, true);
  c.fillStyle = mid;
  c.fill('evenodd');
  var rmid = r - lw / 2,
    ghi = c.createLinearGradient(cx - rmid, cy - rmid, cx + rmid * 0.7, cy + rmid * 0.7);
  ghi.addColorStop(0, hi);
  ghi.addColorStop(0.3, hi);
  ghi.addColorStop(0.58, mid);
  ghi.addColorStop(1, dark);
  c.beginPath();
  c.arc(cx, cy, ro, 0, Math.PI * 2);
  c.arc(cx, cy, ri, 0, Math.PI * 2, true);
  c.fillStyle = ghi;
  c.fill('evenodd');
  var gsh = c.createRadialGradient(cx, cy, ri, cx, cy, ri + lw * 0.5);
  gsh.addColorStop(0, 'rgba(0,0,0,0.5)');
  gsh.addColorStop(0.6, 'rgba(0,0,0,0.1)');
  gsh.addColorStop(1, 'rgba(0,0,0,0)');
  c.beginPath();
  c.arc(cx, cy, ro, 0, Math.PI * 2);
  c.arc(cx, cy, ri, 0, Math.PI * 2, true);
  c.fillStyle = gsh;
  c.fill('evenodd');
  c.beginPath();
  c.arc(cx, cy, ro, 0, Math.PI * 2);
  c.strokeStyle = 'rgba(0,0,0,0.55)';
  c.lineWidth = s * 0.007;
  c.stroke();
  c.beginPath();
  c.arc(cx, cy, ri + 1, 0, Math.PI * 2);
  c.strokeStyle = 'rgba(255,255,255,0.16)';
  c.lineWidth = s * 0.005;
  c.stroke();
}

/* ── FRAME DRAW FUNCTIONS (verbatim) ── */
function drawGold(c, s) {
  var r = s / 2,
    cx = r,
    cy = r,
    lw = s * 0.072;
  volumetricRing(c, s, lw, '#3d2200', '#9a6a10', '#f5e070');
  drawTexture(c, s, lw, textureMetal(TX, 160, 120, 20));
  var ri = r - lw;
  c.beginPath();
  c.arc(cx, cy, ri - s * 0.01, 0, Math.PI * 2);
  c.strokeStyle = '#f0d060';
  c.lineWidth = s * 0.007;
  c.stroke();
  c.beginPath();
  c.arc(cx, cy, ri - s * 0.01, 0, Math.PI * 2);
  c.strokeStyle = 'rgba(0,0,0,0.4)';
  c.lineWidth = s * 0.003;
  c.stroke();
  for (var i = 0; i < 8; i++) {
    var a = (i * Math.PI) / 4,
      bx = cx + Math.cos(a) * (r - lw / 2),
      by = cy + Math.sin(a) * (r - lw / 2);
    c.beginPath();
    c.arc(bx, by, s * 0.025, 0, Math.PI * 2);
    c.fillStyle = '#3d2200';
    c.fill();
    c.beginPath();
    c.arc(bx, by, s * 0.016, 0, Math.PI * 2);
    c.fillStyle = '#e8c840';
    c.fill();
    c.beginPath();
    c.arc(bx - s * 0.005, by - s * 0.005, s * 0.006, 0, Math.PI * 2);
    c.fillStyle = 'rgba(255,250,180,0.8)';
    c.fill();
  }
}
function drawSilver(c, s) {
  var r = s / 2,
    cx = r,
    cy = r,
    lw = s * 0.068;
  volumetricRing(c, s, lw, '#1e1e1e', '#707070', '#f2f2f2');
  drawTexture(c, s, lw, textureMetal(TX, 120, 120, 125));
  var ri = r - lw,
    rmid = r - lw / 2;
  for (var i = 0; i < 32; i++) {
    var a = (i * Math.PI) / 16;
    c.save();
    c.translate(cx + Math.cos(a) * rmid, cy + Math.sin(a) * rmid);
    c.rotate(a + Math.PI / 2);
    c.beginPath();
    c.moveTo(-s * 0.006, -s * 0.018);
    c.lineTo(-s * 0.006, s * 0.018);
    c.strokeStyle = 'rgba(0,0,0,0.28)';
    c.lineWidth = s * 0.006;
    c.stroke();
    c.beginPath();
    c.moveTo(s * 0.006, -s * 0.018);
    c.lineTo(s * 0.006, s * 0.018);
    c.strokeStyle = 'rgba(255,255,255,0.18)';
    c.lineWidth = s * 0.004;
    c.stroke();
    c.restore();
  }
  c.beginPath();
  c.arc(cx, cy, ri - s * 0.009, 0, Math.PI * 2);
  c.strokeStyle = 'rgba(255,255,255,0.35)';
  c.lineWidth = s * 0.006;
  c.stroke();
}
function drawIron(c, s) {
  var r = s / 2,
    cx = r,
    cy = r,
    lw = s * 0.072;
  volumetricRing(c, s, lw, '#0a0a0a', '#2c2c2c', '#707070');
  drawTexture(c, s, lw, textureHammered(TX));
  var ri = r - lw;
  for (var i = 0; i < 6; i++) {
    var a = (i * Math.PI) / 3;
    c.save();
    c.translate(cx, cy);
    c.rotate(a);
    c.beginPath();
    c.moveTo(ri, 0);
    c.lineTo(r - 1, 0);
    c.strokeStyle = '#080808';
    c.lineWidth = s * 0.014;
    c.stroke();
    c.beginPath();
    c.moveTo(ri, 0);
    c.lineTo(r - 1, 0);
    c.strokeStyle = 'rgba(120,120,120,0.25)';
    c.lineWidth = s * 0.004;
    c.stroke();
    c.restore();
  }
  c.beginPath();
  c.arc(cx, cy, ri - s * 0.008, 0, Math.PI * 2);
  c.strokeStyle = 'rgba(80,80,80,0.5)';
  c.lineWidth = s * 0.006;
  c.stroke();
  for (var i = 0; i < 12; i++) {
    var a = (i * Math.PI) / 6 + Math.PI / 12,
      bx = cx + Math.cos(a) * (r - lw / 2),
      by = cy + Math.sin(a) * (r - lw / 2);
    c.beginPath();
    c.arc(bx, by, s * 0.019, 0, Math.PI * 2);
    c.fillStyle = '#111';
    c.fill();
    c.beginPath();
    c.arc(bx, by, s * 0.011, 0, Math.PI * 2);
    c.fillStyle = '#484848';
    c.fill();
    c.beginPath();
    c.arc(bx - s * 0.004, by - s * 0.004, s * 0.004, 0, Math.PI * 2);
    c.fillStyle = 'rgba(160,160,160,0.5)';
    c.fill();
  }
}
function drawWood(c, s) {
  var r = s / 2,
    cx = r,
    cy = r,
    lw = s * 0.07;
  volumetricRing(c, s, lw, '#150800', '#4a2408', '#b07838');
  drawTexture(c, s, lw, textureWood(TX));
  drawTexture(c, s, lw, textureBark(TX));
  var ri = r - lw;
  for (var i = 0; i < 48; i++) {
    var a = (i * Math.PI) / 24;
    c.beginPath();
    c.moveTo(cx + Math.cos(a) * ri, cy + Math.sin(a) * ri);
    c.lineTo(cx + Math.cos(a) * (r - 1), cy + Math.sin(a) * (r - 1));
    c.strokeStyle =
      i % 4 === 0
        ? 'rgba(200,130,50,0.22)'
        : i % 2 === 0
          ? 'rgba(30,10,0,0.30)'
          : 'rgba(90,40,10,0.18)';
    c.lineWidth = s * 0.008;
    c.stroke();
  }
  c.beginPath();
  c.arc(cx, cy, r - 2, 0, Math.PI * 2);
  c.strokeStyle = '#c09040';
  c.lineWidth = s * 0.009;
  c.stroke();
  c.beginPath();
  c.arc(cx, cy, ri - s * 0.008, 0, Math.PI * 2);
  c.strokeStyle = '#c09040';
  c.lineWidth = s * 0.008;
  c.stroke();
  for (var i = 0; i < 6; i++) {
    var a = (i * Math.PI) / 3,
      bx = cx + Math.cos(a) * (r - lw / 2),
      by = cy + Math.sin(a) * (r - lw / 2);
    c.beginPath();
    c.arc(bx, by, s * 0.02, 0, Math.PI * 2);
    c.fillStyle = '#3a1800';
    c.fill();
    c.beginPath();
    c.arc(bx, by, s * 0.013, 0, Math.PI * 2);
    c.fillStyle = '#d4a030';
    c.fill();
    c.beginPath();
    c.arc(bx - s * 0.004, by - s * 0.004, s * 0.005, 0, Math.PI * 2);
    c.fillStyle = 'rgba(255,230,140,0.7)';
    c.fill();
  }
}
function drawArcane(c, s) {
  var r = s / 2,
    cx = r,
    cy = r,
    lw = s * 0.07;
  volumetricRing(c, s, lw, '#0e0020', '#4a0090', '#c080ff');
  drawTexture(c, s, lw, textureArcaneShimmer(TX));
  var ri = r - lw,
    rmid = r - lw / 2;
  c.beginPath();
  c.arc(cx, cy, ri - s * 0.008, 0, Math.PI * 2);
  c.strokeStyle = 'rgba(160,80,255,0.6)';
  c.lineWidth = s * 0.007;
  c.stroke();
  c.beginPath();
  c.arc(cx, cy, ri - s * 0.008, 0, Math.PI * 2);
  c.strokeStyle = 'rgba(220,160,255,0.35)';
  c.lineWidth = s * 0.003;
  c.stroke();
  for (var i = 0; i < 6; i++) {
    var a = (i * Math.PI) / 3,
      bx = cx + Math.cos(a) * rmid,
      by = cy + Math.sin(a) * rmid;
    c.save();
    c.translate(bx, by);
    c.rotate(a + Math.PI / 2);
    c.beginPath();
    c.moveTo(0, -s * 0.033);
    c.lineTo(s * 0.019, 0);
    c.lineTo(0, s * 0.033);
    c.lineTo(-s * 0.019, 0);
    c.closePath();
    c.fillStyle = '#200040';
    c.fill();
    c.beginPath();
    c.moveTo(0, -s * 0.022);
    c.lineTo(s * 0.013, 0);
    c.lineTo(0, s * 0.022);
    c.lineTo(-s * 0.013, 0);
    c.closePath();
    c.fillStyle = 'rgba(180,80,255,0.85)';
    c.fill();
    c.beginPath();
    c.arc(-s * 0.004, -s * 0.008, s * 0.006, 0, Math.PI * 2);
    c.fillStyle = 'rgba(240,200,255,0.7)';
    c.fill();
    c.restore();
  }
  for (var i = 0; i < 6; i++) {
    var a = (i * Math.PI) / 3 + Math.PI / 6,
      bx = cx + Math.cos(a) * rmid,
      by = cy + Math.sin(a) * rmid;
    c.save();
    c.translate(bx, by);
    c.rotate(a + Math.PI / 2);
    c.beginPath();
    c.moveTo(0, -s * 0.016);
    c.lineTo(0, s * 0.016);
    c.strokeStyle = 'rgba(180,80,255,0.5)';
    c.lineWidth = s * 0.008;
    c.stroke();
    c.restore();
  }
}
function drawNature(c, s) {
  var r = s / 2,
    cx = r,
    cy = r,
    lw = s * 0.07;
  volumetricRing(c, s, lw, '#061204', '#1e4018', '#6ab870');
  drawTexture(c, s, lw, textureSoftMoss(TX));
  var ri = r - lw,
    rmid = r - lw / 2;
  c.beginPath();
  c.arc(cx, cy, ri - s * 0.009, 0, Math.PI * 2);
  c.strokeStyle = 'rgba(80,160,80,0.5)';
  c.lineWidth = s * 0.006;
  c.stroke();
  for (var i = 0; i < 12; i++) {
    var a = (i * Math.PI) / 6,
      bx = cx + Math.cos(a) * rmid,
      by = cy + Math.sin(a) * rmid;
    c.save();
    c.translate(bx, by);
    c.rotate(a + Math.PI / 2);
    c.beginPath();
    c.ellipse(0, 0, s * 0.021, s * 0.042, 0, 0, Math.PI * 2);
    c.fillStyle = i % 3 === 0 ? '#0e2a0a' : i % 3 === 1 ? '#3a7830' : '#236620';
    c.fill();
    c.beginPath();
    c.moveTo(0, -s * 0.038);
    c.lineTo(0, s * 0.038);
    c.strokeStyle = 'rgba(120,200,100,0.45)';
    c.lineWidth = s * 0.005;
    c.stroke();
    c.restore();
  }
  for (var i = 0; i < 4; i++) {
    var a = (i * Math.PI) / 2 + Math.PI / 4,
      bx = cx + Math.cos(a) * rmid,
      by = cy + Math.sin(a) * rmid;
    c.beginPath();
    c.arc(bx, by, s * 0.018, 0, Math.PI * 2);
    c.fillStyle = '#1a0a00';
    c.fill();
    c.beginPath();
    c.arc(bx, by, s * 0.011, 0, Math.PI * 2);
    c.fillStyle = '#cc3030';
    c.fill();
    c.beginPath();
    c.arc(bx - s * 0.003, by - s * 0.003, s * 0.004, 0, Math.PI * 2);
    c.fillStyle = 'rgba(255,160,140,0.65)';
    c.fill();
  }
}
function drawDraconic(c, s) {
  var r = s / 2,
    cx = r,
    cy = r,
    lw = s * 0.072;
  volumetricRing(c, s, lw, '#100000', '#500000', '#e03010');
  drawTexture(c, s, lw, textureSoftEmber(TX));
  var ri = r - lw,
    rmid = r - lw / 2;
  c.beginPath();
  c.arc(cx, cy, ri - s * 0.008, 0, Math.PI * 2);
  c.strokeStyle = 'rgba(220,40,0,0.55)';
  c.lineWidth = s * 0.007;
  c.stroke();
  c.beginPath();
  c.arc(cx, cy, ri - s * 0.008, 0, Math.PI * 2);
  c.strokeStyle = 'rgba(255,120,60,0.3)';
  c.lineWidth = s * 0.003;
  c.stroke();
  for (var i = 0; i < 18; i++) {
    var a = (i * Math.PI) / 9,
      bx = cx + Math.cos(a) * rmid,
      by = cy + Math.sin(a) * rmid;
    c.save();
    c.translate(bx, by);
    c.rotate(a + Math.PI / 2);
    c.beginPath();
    c.ellipse(0, s * 0.008, s * 0.026, s * 0.036, 0, Math.PI, Math.PI * 2);
    c.fillStyle = '#180000';
    c.fill();
    c.strokeStyle = 'rgba(200,30,0,0.6)';
    c.lineWidth = s * 0.005;
    c.stroke();
    c.restore();
  }
  for (var i = 0; i < 6; i++) {
    var a = (i * Math.PI) / 3,
      bx = cx + Math.cos(a) * (r - 1),
      by = cy + Math.sin(a) * (r - 1);
    c.save();
    c.translate(bx, by);
    c.rotate(a);
    c.beginPath();
    c.moveTo(0, -s * 0.048);
    c.lineTo(s * 0.016, -s * 0.014);
    c.lineTo(0, s * 0.004);
    c.lineTo(-s * 0.016, -s * 0.014);
    c.closePath();
    c.fillStyle = '#aa1800';
    c.fill();
    c.strokeStyle = 'rgba(255,100,50,0.6)';
    c.lineWidth = s * 0.005;
    c.stroke();
    c.restore();
  }
}
function drawCelestial(c, s) {
  var r = s / 2,
    cx = r,
    cy = r,
    lw = s * 0.07;
  volumetricRing(c, s, lw, '#020510', '#0c1a50', '#6090e0');
  drawTexture(c, s, lw, textureSoftStars(TX));
  drawTexture(c, s, lw, textureSoftStars(TX));
  var ri = r - lw,
    rmid = r - lw / 2;
  c.beginPath();
  c.arc(cx, cy, ri - s * 0.009, 0, Math.PI * 2);
  c.strokeStyle = 'rgba(80,140,255,0.5)';
  c.lineWidth = s * 0.007;
  c.stroke();
  c.beginPath();
  c.arc(cx, cy, ri - s * 0.009, 0, Math.PI * 2);
  c.strokeStyle = 'rgba(180,210,255,0.3)';
  c.lineWidth = s * 0.003;
  c.stroke();
  var seeds = [
    0, 4, 8, 12, 17, 21, 26, 30, 35, 40, 45, 49, 53, 57, 62, 67, 71, 75, 80, 85, 90, 95, 100, 105,
    111, 116, 122, 128, 134, 140,
  ];
  for (var i = 0; i < seeds.length; i++) {
    var a = (seeds[i] * Math.PI * 2) / 144,
      off = ((i % 3) - 1) * lw * 0.25;
    var bx = cx + Math.cos(a) * (rmid + off),
      by = cy + Math.sin(a) * (rmid + off);
    var sz = i % 7 === 0 ? s * 0.014 : i % 3 === 0 ? s * 0.009 : s * 0.005;
    c.beginPath();
    c.arc(bx, by, sz, 0, Math.PI * 2);
    c.fillStyle = i % 7 === 0 ? '#ffffff' : i % 3 === 0 ? '#c0d8ff' : '#6a9aee';
    c.fill();
  }
  for (var i = 0; i < 4; i++) {
    var a = (i * Math.PI) / 2 + Math.PI / 4,
      bx = cx + Math.cos(a) * rmid,
      by = cy + Math.sin(a) * rmid;
    if (i % 2 === 0) {
      c.beginPath();
      c.arc(bx, by, s * 0.023, 0, Math.PI * 2);
      c.fillStyle = '#f0c820';
      c.fill();
      for (var j = 0; j < 8; j++) {
        var ra = (j * Math.PI) / 4;
        c.beginPath();
        c.moveTo(bx + Math.cos(ra) * s * 0.027, by + Math.sin(ra) * s * 0.027);
        c.lineTo(bx + Math.cos(ra) * s * 0.038, by + Math.sin(ra) * s * 0.038);
        c.strokeStyle = '#f0c820';
        c.lineWidth = s * 0.008;
        c.stroke();
      }
    } else {
      c.beginPath();
      c.arc(bx, by, s * 0.024, 0, Math.PI * 2);
      c.fillStyle = '#c0d8ff';
      c.fill();
      c.beginPath();
      c.arc(bx + s * 0.013, by, s * 0.019, 0, Math.PI * 2);
      c.fillStyle = '#0c1a50';
      c.fill();
    }
  }
}
function drawFoundrySteel(c, s) {
  var r = s / 2,
    cx = r,
    cy = r,
    lw = s * 0.09,
    ro = r - 1,
    ri = r - lw;
  c.save();
  c.shadowColor = 'rgba(0,0,0,0.8)';
  c.shadowBlur = s * 0.04;
  c.shadowOffsetX = s * 0.014;
  c.shadowOffsetY = s * 0.018;
  c.beginPath();
  c.arc(cx, cy, ro, 0, Math.PI * 2);
  c.arc(cx, cy, ri, 0, Math.PI * 2, true);
  c.fillStyle = '#111';
  c.fill('evenodd');
  c.restore();
  c.beginPath();
  c.arc(cx, cy, ro, 0, Math.PI * 2);
  c.arc(cx, cy, ri, 0, Math.PI * 2, true);
  c.fillStyle = '#5a6070';
  c.fill('evenodd');
  var rmid = r - lw / 2;
  var g1 = c.createLinearGradient(cx - rmid, cy - rmid, cx + rmid * 0.6, cy + rmid * 0.6);
  g1.addColorStop(0, '#d8dde8');
  g1.addColorStop(0.28, '#c0c8d8');
  g1.addColorStop(0.55, '#6a7080');
  g1.addColorStop(1, '#1a1e28');
  c.beginPath();
  c.arc(cx, cy, ro, 0, Math.PI * 2);
  c.arc(cx, cy, ri, 0, Math.PI * 2, true);
  c.fillStyle = g1;
  c.fill('evenodd');
  drawTexture(c, s, lw, textureMetal(TX, 90, 100, 115));
  var gsh = c.createRadialGradient(cx, cy, ri, cx, cy, ri + lw * 0.55);
  gsh.addColorStop(0, 'rgba(0,0,0,0.6)');
  gsh.addColorStop(0.5, 'rgba(0,0,0,0.15)');
  gsh.addColorStop(1, 'rgba(0,0,0,0)');
  c.beginPath();
  c.arc(cx, cy, ro, 0, Math.PI * 2);
  c.arc(cx, cy, ri, 0, Math.PI * 2, true);
  c.fillStyle = gsh;
  c.fill('evenodd');
  c.beginPath();
  c.arc(cx, cy, ri + lw * 0.18, 0, Math.PI * 2);
  c.arc(cx, cy, ri, 0, Math.PI * 2, true);
  c.fillStyle = 'rgba(160,180,210,0.45)';
  c.fill('evenodd');
  c.beginPath();
  c.arc(cx, cy, ri + lw * 0.09, 0, Math.PI * 2);
  c.strokeStyle = 'rgba(200,220,255,0.6)';
  c.lineWidth = s * 0.006;
  c.stroke();
  c.beginPath();
  c.arc(cx, cy, ro, 0, Math.PI * 2);
  c.strokeStyle = 'rgba(0,0,0,0.6)';
  c.lineWidth = s * 0.008;
  c.stroke();
  c.beginPath();
  c.arc(cx, cy, ro - s * 0.006, -Math.PI * 0.85, -Math.PI * 0.1);
  c.strokeStyle = 'rgba(255,255,255,0.35)';
  c.lineWidth = s * 0.007;
  c.stroke();
  c.beginPath();
  c.arc(cx, cy, ri + 1, 0, Math.PI * 2);
  c.strokeStyle = 'rgba(255,255,255,0.12)';
  c.lineWidth = s * 0.005;
  c.stroke();
}
function drawFoundryBronze(c, s) {
  var r = s / 2,
    cx = r,
    cy = r,
    lw = s * 0.09,
    ro = r - 1,
    ri = r - lw;
  c.save();
  c.shadowColor = 'rgba(0,0,0,0.8)';
  c.shadowBlur = s * 0.04;
  c.shadowOffsetX = s * 0.014;
  c.shadowOffsetY = s * 0.018;
  c.beginPath();
  c.arc(cx, cy, ro, 0, Math.PI * 2);
  c.arc(cx, cy, ri, 0, Math.PI * 2, true);
  c.fillStyle = '#1a0e00';
  c.fill('evenodd');
  c.restore();
  c.beginPath();
  c.arc(cx, cy, ro, 0, Math.PI * 2);
  c.arc(cx, cy, ri, 0, Math.PI * 2, true);
  c.fillStyle = '#7a5020';
  c.fill('evenodd');
  var rmid = r - lw / 2;
  var g1 = c.createLinearGradient(cx - rmid, cy - rmid, cx + rmid * 0.6, cy + rmid * 0.6);
  g1.addColorStop(0, '#f0d080');
  g1.addColorStop(0.25, '#d4a040');
  g1.addColorStop(0.55, '#7a5020');
  g1.addColorStop(1, '#1a0e00');
  c.beginPath();
  c.arc(cx, cy, ro, 0, Math.PI * 2);
  c.arc(cx, cy, ri, 0, Math.PI * 2, true);
  c.fillStyle = g1;
  c.fill('evenodd');
  drawTexture(c, s, lw, textureMetal(TX, 130, 90, 20));
  var gsh = c.createRadialGradient(cx, cy, ri, cx, cy, ri + lw * 0.55);
  gsh.addColorStop(0, 'rgba(0,0,0,0.6)');
  gsh.addColorStop(0.5, 'rgba(0,0,0,0.15)');
  gsh.addColorStop(1, 'rgba(0,0,0,0)');
  c.beginPath();
  c.arc(cx, cy, ro, 0, Math.PI * 2);
  c.arc(cx, cy, ri, 0, Math.PI * 2, true);
  c.fillStyle = gsh;
  c.fill('evenodd');
  c.beginPath();
  c.arc(cx, cy, ri + lw * 0.18, 0, Math.PI * 2);
  c.arc(cx, cy, ri, 0, Math.PI * 2, true);
  c.fillStyle = 'rgba(220,160,60,0.4)';
  c.fill('evenodd');
  c.beginPath();
  c.arc(cx, cy, ri + lw * 0.09, 0, Math.PI * 2);
  c.strokeStyle = 'rgba(255,210,100,0.55)';
  c.lineWidth = s * 0.006;
  c.stroke();
  c.beginPath();
  c.arc(cx, cy, ro, 0, Math.PI * 2);
  c.strokeStyle = 'rgba(0,0,0,0.6)';
  c.lineWidth = s * 0.008;
  c.stroke();
  c.beginPath();
  c.arc(cx, cy, ro - s * 0.006, -Math.PI * 0.85, -Math.PI * 0.1);
  c.strokeStyle = 'rgba(255,230,140,0.4)';
  c.lineWidth = s * 0.007;
  c.stroke();
  c.beginPath();
  c.arc(cx, cy, ri + 1, 0, Math.PI * 2);
  c.strokeStyle = 'rgba(255,200,80,0.15)';
  c.lineWidth = s * 0.005;
  c.stroke();
}

// The 10 built-in frames, in display order.
export const frameDefs = [
  { name: 'Foundry Steel', fn: drawFoundrySteel },
  { name: 'Foundry Bronze', fn: drawFoundryBronze },
  { name: 'Gold Ornate', fn: drawGold },
  { name: 'Silver Clean', fn: drawSilver },
  { name: 'Dark Iron', fn: drawIron },
  { name: 'Wooden', fn: drawWood },
  { name: 'Arcane', fn: drawArcane },
  { name: 'Nature', fn: drawNature },
  { name: 'Draconic', fn: drawDraconic },
  { name: 'Celestial', fn: drawCelestial },
];
