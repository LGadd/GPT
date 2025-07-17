/* scripts.js */
// Constants for simulation
const G = 0.5;  // Gravitational constant (tweak for effect)
const PARTICLE_RADIUS = 5;

// Vector utility class
class Vector {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
  add(v) { this.x += v.x; this.y += v.y; }
  sub(v) { this.x -= v.x; this.y -= v.y; }
  mult(s) { this.x *= s; this.y *= s; }
  div(s) { this.x /= s; this.y /= s; }
  mag() { return Math.hypot(this.x, this.y); }
  norm() { const m = this.mag() || 1; this.div(m); }
}

// Particle class representing one body in simulation
class Particle {
  constructor(x, y, mass = (Math.Random() * 100 + 1)) {
    this.pos = new Vector(x, y);
    this.vel = new Vector((0.5-x),(0.5-y));
    this.mass = mass;
  }
  applyForce(force) {
    // F = m * a => a = F / m
    const f = new Vector(force.x, force.y);
    f.div(this.mass);
    this.vel.add(f);
  }
  update() {
    this.pos.add(this.vel);
  }
  draw(ctx) {
    ctx.beginPath();
    ctx.arc(this.pos.x, this.pos.y, PARTICLE_RADIUS, 0, Math.PI*2);
    ctx.fillStyle = '#66fcf1';
    ctx.fill();
  }
}

// Main simulation handler
class Simulation {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.particles = [];
    this.resize();
    window.addEventListener('resize', () => this.resize());
    canvas.addEventListener('click', (e) => this.spawn(e));
    requestAnimationFrame(() => this.loop());
  }
  resize() {
    this.canvas.width = window.innerWidth * 0.8;
    this.canvas.height = window.innerHeight * 0.6;
  }
  spawn(e) {
    const rect = this.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const mass = Math.random() * 3 + 1;  // random mass
    this.particles.push(new Particle(x, y, mass));
  }
  loop() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Calculate forces between particles
    for (let i = 0; i < this.particles.length; i++) {
      for (let j = i + 1; j < this.particles.length; j++) {
        const a = this.particles[i];
        const b = this.particles[j];
        const force = this.computeGravity(a, b);
        a.applyForce(force);
        force.mult(-1);
        b.applyForce(force);
      }
    }

    // Update and draw
    this.particles.forEach(p => {
      p.update();
      p.draw(ctx);
    });

    requestAnimationFrame(() => this.loop());
  }
  computeGravity(a, b) {
    const dir = new Vector(b.pos.x - a.pos.x, b.pos.y - a.pos.y);
    const distance = Math.max(dir.mag(), 5);
    dir.norm();
    const strength = (G * a.mass * b.mass) / (distance * distance);
    dir.mult(strength);
    return dir;
  }
}

// Initialize simulation when DOM is ready
window.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('simulationCanvas');
  new Simulation(canvas);
});
