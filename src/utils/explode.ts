// A simple canvas explosion effect for wrong answers
// Usage: import { explodeEffect } from './explode'; explodeEffect({ x, y });

export function explodeEffect({ x = window.innerWidth / 2, y = window.innerHeight / 2 } = {}) {
  const canvas = document.createElement('canvas');
  canvas.style.position = 'fixed';
  canvas.style.left = '0';
  canvas.style.top = '0';
  canvas.style.pointerEvents = 'none';
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  document.body.appendChild(canvas);

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const particles = Array.from({ length: 32 }, () => ({
    x,
    y,
    angle: Math.random() * 2 * Math.PI,
    speed: 4 + Math.random() * 4,
    radius: 6 + Math.random() * 8,
    color: `hsl(${Math.random() * 30 + 0}, 90%, 60%)`,
    alpha: 1,
  }));

  let frame = 0;
  function animate() {
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (const p of particles) {
      p.x += Math.cos(p.angle) * p.speed;
      p.y += Math.sin(p.angle) * p.speed;
      p.radius *= 0.95;
      p.alpha *= 0.93;
      ctx.globalAlpha = p.alpha;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, 2 * Math.PI);
      ctx.fillStyle = p.color;
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    frame++;
    if (frame < 32) {
      requestAnimationFrame(animate);
    } else {
      document.body.removeChild(canvas);
    }
  }
  animate();
}
