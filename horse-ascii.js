/**
 * Dot-grid horse silhouette,
 * with a light gallop cycle on the legs.
 */
(function () {
  const el = document.getElementById('ascii-horse');
  if (!el) return;

  const COLS = 46;
  const ROWS = 35;
  const DOT = '·';
  const SPACE = ' ';
  const LEG_START = 0.52;
  const GRID = [
  "0000000000000000000000000000000110010001100000",
  "0000000000000000000000000000000110111111100000",
  "0000000000000000000000000000000011111111110000",
  "0000000000000000000000000000010111111111111000",
  "0000000000000000000000000000001111111111111100",
  "0000000000000000000000000000101111111111111100",
  "0000000000000000000000000000111111111111111110",
  "0000000000000000000000000000011111111111111110",
  "0000000000000000000000000000011111111111111111",
  "0000000000000000000000000011011111111110111111",
  "0000000000000000000000000000111111111110001110",
  "0000000000000001111100000111111111111100000000",
  "0100000111100011111111000011111111111100000000",
  "0110001111110111111111111111111111111100000000",
  "0111111111111111111111111111111111111000000000",
  "0111111111001111111111111111111111111000000000",
  "0011111110001111111111111111111111111000000000",
  "0000111111001111111111111111111111110000000000",
  "1101111111101111111111111111111111100000000000",
  "0111111111100111111111111111111111110000000000",
  "0011111011100011111101111111111111111000000000",
  "0000111011100011111111101111111111111100000000",
  "0000000011000000111101100011111111111110000000",
  "0000000110000000111100000000100111101110000000",
  "0000001100000000111100000000000111100110000000",
  "0000000000000000011110000000000011100110000000",
  "0000000000000000001111000000000011000110000000",
  "0000000000000000000111000000000011001100000000",
  "0000000000000000000011110000000111011100000000",
  "0000000000000000000000110001111101111000000000",
  "0000000000000000000000011001111101111000000000",
  "0000000000000000000000011100000001110000000000",
  "0000000000000000000000001100000000000000000000",
  "0000000000000000000000000110000000000000000000",
  "0000000000000000000000000111000000000000000000"
  ];

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const inkAt = (x, y) => {
    if (x < 0 || y < 0 || x >= COLS || y >= ROWS) return false;
    return GRID[y].charAt(x) === '1';
  };

  const sampleFrame = (phase) => {
    const t = phase * Math.PI * 2;
    const bodyBob = Math.sin(t) * 0.45;
    const hindSwing = Math.sin(t) * 1.6;
    const frontSwing = Math.sin(t + Math.PI) * 1.6;
    const hindLift = Math.max(0, Math.sin(t)) * 1.1;
    const frontLift = Math.max(0, Math.sin(t + Math.PI)) * 1.1;

    const lines = [];
    for (let y = 0; y < ROWS; y++) {
      let line = '';
      const legBlend = Math.max(0, (y / ROWS - LEG_START) / (1 - LEG_START));

      for (let x = 0; x < COLS; x++) {
        const side = x / (COLS - 1);
        const swing = hindSwing * (1 - side) + frontSwing * side;
        const lift = hindLift * (1 - side) + frontLift * side;
        const srcX = Math.round(x - swing * legBlend);
        const srcY = Math.round(y - bodyBob - lift * legBlend * 1.15);
        line += inkAt(srcX, srcY) ? DOT : SPACE;
      }
      lines.push(line.replace(/\s+$/, ''));
    }

    while (lines.length && !/\S/.test(lines[0])) lines.shift();
    while (lines.length && !/\S/.test(lines[lines.length - 1])) lines.pop();
    return lines.join('\n');
  };

  const frameCount = 8;
  const frames = [];
  for (let f = 0; f < frameCount; f++) {
    frames.push(sampleFrame(f / frameCount));
  }

  let i = 0;
  el.textContent = frames[0];
  el.classList.add('is-ready');

  if (reduced) return;

  window.setInterval(() => {
    i = (i + 1) % frames.length;
    el.textContent = frames[i];
  }, 260);
})();
