/* ==========================================================================
   PARTICLES.JS — Sistema de partículas interactivas con soporte de tema
   Corregido: acumulación de escala en resize, params sin uso eliminados
   ========================================================================== */

(() => {
    'use strict';

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const RGB_RE = /^\s*\d{1,3}\s*,\s*\d{1,3}\s*,\s*\d{1,3}\s*$/;

    function getParticleColors() {
        const style     = getComputedStyle(document.documentElement);
        const rawMain   = style.getPropertyValue('--particle-color').trim();
        const rawAccent = style.getPropertyValue('--particle-accent-color').trim();
        return {
            main:   RGB_RE.test(rawMain)   ? rawMain   : '255, 107, 26',
            accent: RGB_RE.test(rawAccent) ? rawAccent : '245, 185, 66',
        };
    }

    class ParticleField {
        constructor(canvas) {
            this.canvas    = canvas;
            this.ctx       = canvas.getContext('2d', { alpha: true });
            this.particles = [];
            this.mouse     = { x: -9999, y: -9999, active: false };
            this.dpr       = Math.min(window.devicePixelRatio || 1, 2);
            this.animId    = null;
            this.colors    = getParticleColors();

            this.config = {
                density:            18000,
                maxParticles:       140,
                minSize:            0.6,
                maxSize:            2.2,
                maxSpeed:           0.35,
                connectionDist:     130,
                mouseInfluenceDist: 180,
                mouseRepelStrength: 0.45,
                mouseConnectDist:   220,
            };

            this._bindEvents();
            this._resize();
            this._spawn();
            this._tick();
        }

        /* — Resize: usa setTransform en lugar de scale() acumulado — */
        _resize() {
            const w = window.innerWidth;
            const h = window.innerHeight;
            this.canvas.width  = Math.round(w * this.dpr);
            this.canvas.height = Math.round(h * this.dpr);
            this.canvas.style.width  = `${w}px`;
            this.canvas.style.height = `${h}px`;
            // setTransform resetea la transformación antes de escalar
            this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
            this.width  = w;
            this.height = h;
        }

        _spawn() {
            const count = Math.min(
                this.config.maxParticles,
                Math.floor((this.width * this.height) / this.config.density)
            );
            this.particles = Array.from({ length: count }, () => this._makeParticle());
        }

        _makeParticle() {
            return {
                x:       Math.random() * this.width,
                y:       Math.random() * this.height,
                vx:      (Math.random() - 0.5) * this.config.maxSpeed,
                vy:      (Math.random() - 0.5) * this.config.maxSpeed,
                size:    this.config.minSize + Math.random() * (this.config.maxSize - this.config.minSize),
                opacity: 0.25 + Math.random() * 0.4,
                pulse:   Math.random() * Math.PI * 2,
            };
        }

        _updateParticle(p) {
            /* Repulsión suave del cursor */
            if (this.mouse.active) {
                const dx   = p.x - this.mouse.x;
                const dy   = p.y - this.mouse.y;
                const dist = Math.hypot(dx, dy);

                if (dist < this.config.mouseInfluenceDist && dist > 0) {
                    const strength = (1 - dist / this.config.mouseInfluenceDist) * this.config.mouseRepelStrength;
                    p.vx += (dx / dist) * strength;
                    p.vy += (dy / dist) * strength;
                }
            }

            /* Fricción para que la repulsión decaiga naturalmente */
            p.vx *= 0.96;
            p.vy *= 0.96;

            /* Velocidad mínima ambient — usa dirección aleatoria acumulada */
            const speed = Math.hypot(p.vx, p.vy);
            if (speed < 0.08) {
                const angle = Math.random() * Math.PI * 2;
                p.vx += Math.cos(angle) * 0.04;
                p.vy += Math.sin(angle) * 0.04;
            }

            p.x += p.vx;
            p.y += p.vy;

            /* Wrap-around en bordes */
            if (p.x < -10)              p.x = this.width  + 10;
            if (p.x > this.width  + 10) p.x = -10;
            if (p.y < -10)              p.y = this.height + 10;
            if (p.y > this.height + 10) p.y = -10;

            p.pulse += 0.012;
        }

        _draw() {
            const { ctx, particles, mouse, config, colors } = this;
            const len = particles.length;

            ctx.clearRect(0, 0, this.width, this.height);

            /* 1) Conexiones entre partículas */
            for (let i = 0; i < len; i++) {
                const a = particles[i];
                for (let j = i + 1; j < len; j++) {
                    const b    = particles[j];
                    const dist = Math.hypot(a.x - b.x, a.y - b.y);
                    if (dist < config.connectionDist) {
                        const alpha = (1 - dist / config.connectionDist) * 0.18;
                        ctx.strokeStyle = `rgba(${colors.main}, ${alpha})`;
                        ctx.lineWidth   = 0.6;
                        ctx.beginPath();
                        ctx.moveTo(a.x, a.y);
                        ctx.lineTo(b.x, b.y);
                        ctx.stroke();
                    }
                }
            }

            /* 2) Conexiones cursor → partículas + halo */
            if (mouse.active) {
                for (let i = 0; i < len; i++) {
                    const p    = particles[i];
                    const dist = Math.hypot(p.x - mouse.x, p.y - mouse.y);
                    if (dist < config.mouseConnectDist) {
                        const alpha = (1 - dist / config.mouseConnectDist) * 0.45;
                        ctx.strokeStyle = `rgba(${colors.accent}, ${alpha})`;
                        ctx.lineWidth   = 0.8;
                        ctx.beginPath();
                        ctx.moveTo(p.x, p.y);
                        ctx.lineTo(mouse.x, mouse.y);
                        ctx.stroke();
                    }
                }

                /* Halo radial bajo el puntero */
                const grad = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, 110);
                grad.addColorStop(0, `rgba(${colors.main}, 0.16)`);
                grad.addColorStop(1, `rgba(${colors.main}, 0)`);
                ctx.fillStyle = grad;
                ctx.beginPath();
                ctx.arc(mouse.x, mouse.y, 110, 0, Math.PI * 2);
                ctx.fill();
            }

            /* 3) Partículas */
            for (let i = 0; i < len; i++) {
                const p = particles[i];
                ctx.fillStyle = `rgba(${colors.main}, ${p.opacity + Math.sin(p.pulse) * 0.08})`;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        _tick() {
            this.particles.forEach(p => this._updateParticle(p));
            this._draw();
            this.animId = requestAnimationFrame(() => this._tick());
        }

        /** Actualiza colores al cambiar de tema */
        updateColors() {
            this.colors = getParticleColors();
        }

        _debounce(fn, wait) {
            let timer;
            return (...args) => {
                clearTimeout(timer);
                timer = setTimeout(() => fn.apply(this, args), wait);
            };
        }

        _bindEvents() {
            /* Pausar el loop cuando la tab está oculta — ahorra CPU */
            document.addEventListener('visibilitychange', () => {
                if (document.hidden) {
                    if (this.animId) {
                        cancelAnimationFrame(this.animId);
                        this.animId = null;
                    }
                } else {
                    this._tick();
                }
            });

            /* Resize con debounce para evitar múltiples respawns */
            window.addEventListener('resize', this._debounce(() => {
                this._resize();
                this._spawn();
            }, 220));

            /* Mouse */
            window.addEventListener('mousemove', (e) => {
                this.mouse.x      = e.clientX;
                this.mouse.y      = e.clientY;
                this.mouse.active = true;
            });

            window.addEventListener('mouseleave', () => {
                this.mouse.active = false;
                this.mouse.x      = -9999;
                this.mouse.y      = -9999;
            });

            /* Touch: interacción táctil (passive para no bloquear scroll) */
            window.addEventListener('touchmove', (e) => {
                if (e.touches.length > 0) {
                    this.mouse.x      = e.touches[0].clientX;
                    this.mouse.y      = e.touches[0].clientY;
                    this.mouse.active = true;
                }
            }, { passive: true });

            window.addEventListener('touchend', () => {
                this.mouse.active = false;
            }, { passive: true });
        }
    }

    /* — Auto-init — */
    let field = null;

    document.addEventListener('DOMContentLoaded', () => {
        const canvas = document.getElementById('particleCanvas');
        if (canvas) {
            field = new ParticleField(canvas);
        }
    });

    document.addEventListener('theme-update', () => {
        if (field) field.updateColors();
    });
})();
