const canvas = document.querySelector('#crystal');
const context = canvas.getContext('2d');
const motion = matchMedia('(prefers-reduced-motion: reduce)');

if (context) {
  const vertices = [];
  const rings = [[0.35, -1.5], [0.73, -0.92], [0.62, 0.95], [0.28, 1.5]];
  const faces = [];
  let frame = 0;

  for (const [radius, y] of rings) {
    for (let side = 0; side < 6; side++) {
      const angle = side * Math.PI / 3;
      vertices.push([Math.cos(angle) * radius, y, Math.sin(angle) * radius]);
    }
  }

  faces.push([5, 4, 3, 2, 1, 0], [18, 19, 20, 21, 22, 23]);
  for (let ring = 0; ring < rings.length - 1; ring++) {
    for (let side = 0; side < 6; side++) {
      const current = ring * 6 + side;
      const next = ring * 6 + (side + 1) % 6;
      faces.push([current, next, next + 6, current + 6]);
    }
  }

  function draw(angle) {
    const size = canvas.width;
    const scale = size * 0.23;
    const tilt = -0.53;
    const points = vertices.map(([x, y, z]) => {
      const rotatedX = x * Math.cos(angle) - z * Math.sin(angle);
      const depth = x * Math.sin(angle) + z * Math.cos(angle);
      const perspective = 5 / (5 - depth);
      return {
        x: size / 2 + (rotatedX * Math.cos(tilt) - y * Math.sin(tilt)) * scale * perspective,
        y: size / 2 + (rotatedX * Math.sin(tilt) + y * Math.cos(tilt)) * scale * perspective,
        depth,
      };
    });

    context.clearRect(0, 0, size, size);
    const layers = faces.map((face) => {
      const corners = face.map((index) => points[index]);
      const depth = corners.reduce((sum, point) => sum + point.depth, 0) / corners.length;
      return { corners, depth };
    }).sort((first, second) => first.depth - second.depth);

    for (const { corners, depth } of layers) {
      const [start] = corners;
      const light = Math.round(43 + depth * 20 - (start.y / size) * 16);
      const gradient = context.createLinearGradient(0, size * 0.12, size * 0.65, size * 0.9);
      gradient.addColorStop(0, `hsl(148 62% ${light + 21}% / .9)`);
      gradient.addColorStop(0.55, `hsl(158 67% ${light}% / .84)`);
      gradient.addColorStop(1, 'hsl(166 69% 11% / .94)');
      context.beginPath();
      context.moveTo(start.x, start.y);
      for (const corner of corners.slice(1)) context.lineTo(corner.x, corner.y);
      context.closePath();
      context.fillStyle = gradient;
      context.strokeStyle = 'hsl(148 85% 83% / .55)';
      context.lineWidth = size / 650;
      context.fill();
      context.stroke();
    }
  }

  function resize() {
    canvas.width = canvas.height = Math.max(1, Math.round(canvas.clientWidth * Math.min(devicePixelRatio, 2)));
    draw(0.55);
  }

  function animate(time) {
    draw(0.55 + time / 9500);
    frame = requestAnimationFrame(animate);
  }

  function updateMotion() {
    cancelAnimationFrame(frame);
    if (motion.matches) draw(0.55);
    else frame = requestAnimationFrame(animate);
  }

  new ResizeObserver(resize).observe(canvas);
  motion.addEventListener('change', updateMotion);
  resize();
  updateMotion();
}
