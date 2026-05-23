# Proci-Ram S.R.L — Sitio Web

Sitio web profesional para constructora con estética cinematográfica oscura, partículas interactivas y diseño responsive.

## Estructura

```
constructora/
├── index.html              ← Estructura semántica (HTML5)
├── README.md               ← Este archivo
└── assets/
    ├── css/
    │   ├── main.css        ← Design tokens, reset, tipografía, layout
    │   ├── components.css  ← Header, botones, cards, secciones, footer
    │   └── animations.css  ← Keyframes, reveals, cursor follower
    ├── js/
    │   ├── particles.js    ← Sistema de partículas con interacción al cursor
    │   ├── animations.js   ← Scroll reveals, cursor halo, ripples
    │   └── main.js         ← Smooth scroll y orquestación
    └── img/                ← (Reservado para imágenes futuras)
```

## Paleta de colores

| Token                   | Valor       | Uso                                   |
| ----------------------- | ----------- | ------------------------------------- |
| `--color-ground`        | `#0d0c0a`   | Fondo principal (negro tierra cálido) |
| `--color-surface`       | `#181613`   | Cards y superficies elevadas          |
| `--color-accent`        | `#ff6b1a`   | Naranja construcción (acento primario)|
| `--color-accent-light`  | `#ffa05c`   | Naranja claro                         |
| `--color-amber`         | `#f5b942`   | Ámbar dorado (acento secundario)      |
| `--color-text-primary`  | `#f5f2ec`   | Blanco cálido                         |
| `--color-text-muted`    | `#9a948a`   | Texto secundario                      |

## Tipografía

- **Display**: `Anton` — titulares grandes, condensada, industrial
- **UI**: `Plus Jakarta Sans` — cuerpo y navegación
- **Mono**: `JetBrains Mono` — etiquetas, números, metadata

## Características

### Partículas interactivas (`particles.js`)
- Repulsión suave dentro de un radio de 180px del cursor
- Conexiones dinámicas entre partículas cercanas
- Líneas magnéticas hacia el cursor cuando está cerca
- Halo radial bajo el puntero
- Adaptativo por viewport y respeta `prefers-reduced-motion`

### Cursor follower (`animations.js`)
- Halo glow que sigue el cursor con interpolación lerp
- Aumenta de tamaño al hover sobre elementos interactivos
- Desactivado en pantallas táctiles

### Scroll reveals
- IntersectionObserver para revelar elementos al entrar al viewport
- Stagger automático con `transition-delay` por nth-child

## Cómo usarlo

Abre `index.html` directamente en un navegador moderno (Chrome, Firefox, Safari, Edge).

```bash
# Opcional: servir con un servidor local
npx serve constructora
```

## Personalización

- **Colores**: edita las variables en `assets/css/main.css` (`:root`)
- **Contenido**: edita el `index.html`
- **Partículas**: ajusta los parámetros en el objeto `config` en `particles.js`
