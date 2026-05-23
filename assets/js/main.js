/* ==========================================================================
   MAIN.JS — Tema día/noche, menú móvil, smooth scroll
   ========================================================================== */

(() => {
    'use strict';

    /* ========== TEMA DÍA / NOCHE ========== */

    const STORAGE_KEY = 'prociram-theme';
    const DARK  = 'dark';
    const LIGHT = 'light';

    /**
     * Devuelve el tema inicial:
     * 1. Preferencia guardada en localStorage
     * 2. prefers-color-scheme del sistema
     * 3. Dark como fallback
     */
    function getInitialTheme() {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved === DARK || saved === LIGHT) return saved;
        return window.matchMedia('(prefers-color-scheme: light)').matches ? LIGHT : DARK;
    }

    function applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);

        const btn = document.getElementById('themeToggle');
        if (btn) {
            const isLight = theme === LIGHT;
            btn.setAttribute(
                'aria-label',
                isLight ? 'Cambiar a modo oscuro' : 'Cambiar a modo claro'
            );
        }

        /* Notificar a las partículas para que actualicen el color */
        requestAnimationFrame(() =>
            document.dispatchEvent(new CustomEvent('theme-update'))
        );

        /* Actualizar meta theme-color dinámicamente */
        const metaTheme = document.querySelector('meta[name="theme-color"]:not([media])');
        if (metaTheme) {
            metaTheme.content = theme === DARK ? '#0d0c0a' : '#f5f0e8';
        }
    }

    function initTheme() {
        const theme = getInitialTheme();
        applyTheme(theme);

        const btn = document.getElementById('themeToggle');
        if (!btn) return;

        btn.addEventListener('click', () => {
            const current = document.documentElement.getAttribute('data-theme') || DARK;
            const next    = current === DARK ? LIGHT : DARK;
            localStorage.setItem(STORAGE_KEY, next);
            applyTheme(next);
        });

        /* Sincronizar si el usuario cambia preferencia del sistema mientras navega */
        const colorSchemeQuery = window.matchMedia('(prefers-color-scheme: light)');
        const onSchemeChange = (e) => {
            if (!localStorage.getItem(STORAGE_KEY)) {
                applyTheme(e.matches ? LIGHT : DARK);
            }
        };
        colorSchemeQuery.addEventListener('change', onSchemeChange);
    }

    /* ========== MENÚ MÓVIL ========== */

    function initMobileNav() {
        const toggle  = document.getElementById('navToggle');
        const nav     = document.getElementById('main-nav');
        const overlay = document.getElementById('navOverlay');

        if (!toggle || !nav || !overlay) return;

        function openNav() {
            nav.classList.add('is-open');
            overlay.classList.add('is-open');
            overlay.setAttribute('aria-hidden', 'false');
            toggle.setAttribute('aria-expanded', 'true');
            toggle.setAttribute('aria-label', 'Cerrar menú de navegación');
            document.body.style.overflow = 'hidden';
        }

        function closeNav() {
            nav.classList.remove('is-open');
            overlay.classList.remove('is-open');
            overlay.setAttribute('aria-hidden', 'true');
            toggle.setAttribute('aria-expanded', 'false');
            toggle.setAttribute('aria-label', 'Abrir menú de navegación');
            document.body.style.overflow = '';
        }

        toggle.addEventListener('click', () => {
            const isOpen = toggle.getAttribute('aria-expanded') === 'true';
            isOpen ? closeNav() : openNav();
        });

        /* Cerrar al hacer clic en el overlay */
        overlay.addEventListener('click', closeNav);

        /* Cerrar al hacer clic en un enlace del nav */
        nav.querySelectorAll('.nav-link').forEach((link) => {
            link.addEventListener('click', closeNav);
        });

        /* Cerrar con Escape */
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
                closeNav();
                toggle.focus();
            }
        });
    }

    /* ========== SMOOTH SCROLL ========== */

    function getHeaderHeight() {
        const header = document.querySelector('.header');
        return header ? header.offsetHeight : 0;
    }

    function scrollToSection(id) {
        const cleanId = id.startsWith('#') ? id.slice(1) : id;
        const target  = document.getElementById(cleanId);
        if (!target) return;
        const top = target.getBoundingClientRect().top + window.scrollY - getHeaderHeight() - 16;
        window.scrollTo({ top, behavior: 'smooth' });
    }

    function initSmoothScroll() {
        /* Links con href="#seccion" */
        document.querySelectorAll('a[href^="#"]').forEach((link) => {
            link.addEventListener('click', (e) => {
                const href = link.getAttribute('href');
                if (!href || href === '#') return;
                const target = document.querySelector(href);
                if (!target) return;
                e.preventDefault();
                scrollToSection(href);
            });
        });

        /* Botones con data-scroll-to="id" */
        document.querySelectorAll('[data-scroll-to]').forEach((btn) => {
            btn.addEventListener('click', () => {
                scrollToSection('#' + btn.dataset.scrollTo);
            });
        });
    }

    /* ========== COUNTER ANIMATION ========== */

    function initCounters() {
        const els = document.querySelectorAll('[data-counter]');
        if (!els.length) return;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(({ target, isIntersecting }) => {
                if (!isIntersecting) return;
                const end    = parseInt(target.dataset.counter, 10);
                const suffix = target.dataset.suffix ?? '';
                const dur    = 1800;
                const t0     = performance.now();

                const tick = (now) => {
                    const p = Math.min((now - t0) / dur, 1);
                    const v = Math.round((1 - Math.pow(1 - p, 3)) * end);
                    target.textContent = v + suffix;
                    if (p < 1) requestAnimationFrame(tick);
                };
                requestAnimationFrame(tick);
                observer.unobserve(target);
            });
        }, { threshold: 0.7 });

        els.forEach(el => observer.observe(el));
    }

    /* ========== BOOT LOG ========== */

    function logBoot() {
        const isLocal = location.protocol === 'file:' ||
                        location.hostname === 'localhost' ||
                        location.hostname === '127.0.0.1';
        if (!isLocal) return;

        const css = [
            'background:linear-gradient(135deg,#ff6b1a,#f5b942)',
            'color:#0d0c0a',
            'font-family:monospace',
            'font-weight:700',
            'padding:5px 12px',
        ].join(';');
        console.log('%c PROCI-RAM S.R.L ', css, '— Sitio inicializado correctamente.');
    }

    /* ========== INIT ========== */

    /* Tema aplicado lo antes posible para evitar flash */
    initTheme();

    document.addEventListener('DOMContentLoaded', () => {
        initMobileNav();
        initSmoothScroll();
        initCounters();
        const yearEl = document.getElementById('footer-year');
        if (yearEl) yearEl.textContent = new Date().getFullYear();
        logBoot();
    });
})();
