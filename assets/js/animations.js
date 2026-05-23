/* ==========================================================================
   ANIMATIONS.JS — Scroll reveals, cursor follower con lerp, ripples, header
   ========================================================================== */

(() => {
    'use strict';

    /* — SCROLL REVEALS con IntersectionObserver — */
    function initScrollReveals() {
        const elements = document.querySelectorAll('[data-reveal]');
        if (!elements.length) return;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.style.willChange = 'opacity, transform';
                    entry.target.classList.add('is-visible');
                    entry.target.addEventListener('transitionend', () => {
                        entry.target.style.willChange = 'auto';
                    }, { once: true });
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold:  0.1,
            rootMargin: '0px 0px -70px 0px',
        });

        elements.forEach((el) => observer.observe(el));
    }

    /* — CURSOR GLOW con interpolación lerp (solo pointer fino) — */
    function initCursorFollower() {
        if (window.matchMedia('(pointer: coarse)').matches) return;

        const cursor = document.createElement('div');
        cursor.className = 'cursor-glow';
        cursor.setAttribute('aria-hidden', 'true');
        document.body.appendChild(cursor);

        let targetX = 0, targetY = 0;
        let currentX = 0, currentY = 0;
        const LERP = 0.16;

        document.addEventListener('mousemove', (e) => {
            targetX = e.clientX;
            targetY = e.clientY;
            cursor.classList.add('is-active');
        });

        document.addEventListener('mouseleave', () => {
            cursor.classList.remove('is-active');
        });

        /* Agrandar el cursor sobre interactivos */
        const interactives = document.querySelectorAll(
            'a, button, .project-card, .service-card, .testimonial-card'
        );
        interactives.forEach((el) => {
            el.addEventListener('mouseenter', () => cursor.classList.add('is-hover'));
            el.addEventListener('mouseleave', () => cursor.classList.remove('is-hover'));
        });

        /* Loop de interpolación suave con cleanup al ocultar la tab */
        let rafId = null;

        function loopCursor() {
            currentX += (targetX - currentX) * LERP;
            currentY += (targetY - currentY) * LERP;
            cursor.style.transform = `translate(${currentX}px, ${currentY}px) translate(-50%, -50%)`;
            rafId = requestAnimationFrame(loopCursor);
        }

        rafId = requestAnimationFrame(loopCursor);

        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                if (rafId) cancelAnimationFrame(rafId);
            } else {
                rafId = requestAnimationFrame(loopCursor);
            }
        });
    }

    /* — HEADER scroll compact — */
    function initHeaderScroll() {
        const header = document.querySelector('.header');
        if (!header) return;

        let ticking = false;

        const update = () => {
            header.classList.toggle('is-scrolled', window.scrollY > 60);
            ticking = false;
        };

        window.addEventListener('scroll', () => {
            if (!ticking) {
                requestAnimationFrame(update);
                ticking = true;
            }
        }, { passive: true });
    }

    /* — RIPPLE en botones — */
    function initRipples() {
        document.addEventListener('click', (e) => {
            const btn = e.target.closest('.btn');
            if (!btn) return;

            const rect   = btn.getBoundingClientRect();
            const size   = Math.max(rect.width, rect.height);
            const ripple = document.createElement('span');

            ripple.className    = 'ripple';
            ripple.style.width  = ripple.style.height = `${size}px`;
            ripple.style.left   = `${e.clientX - rect.left - size / 2}px`;
            ripple.style.top    = `${e.clientY - rect.top  - size / 2}px`;

            btn.appendChild(ripple);
            ripple.addEventListener('animationend', () => ripple.remove(), { once: true });
        });
    }

    /* — INIT — */
    document.addEventListener('DOMContentLoaded', () => {
        initScrollReveals();
        initCursorFollower();
        initHeaderScroll();
        initRipples();
    });
})();
