# IBM Bob Bootcamp Web

Sitio estático con **navegación por páginas** (estilo del lab Bitbucket, pero **sin Vite/React**):

```
bootcamp-web/
  index.html          # inicio + agenda + descargas
  lab1.html … lab4.html
  styles.css
  assets/lab2/*.png   # capturas del DOCX Lab 2
  downloads/
    lab1-documentacion.zip
    lab2-migracion.zip      # guía + imágenes
    lab3-4-java.zip         # UN solo ZIP para Labs 3 y 4
  README.md
```

## Sugerencia de arquitectura

| Opción | Cuándo |
|--------|--------|
| **Esta (recomendada ahora)** | Páginas HTML + sidenav + `downloads/`. Ideal para GitHub Pages / Object Storage, sin build. |
| Vite + React Router (como `bitbucket-lab-web`) | Si quieres Carbon Design System, SPA y más componentes. Más mantenimiento. |
| Un solo `index.html` gigante | Peor con Lab 2 (27 imágenes). Evitar. |

Labs 3 y 4 = **mismo proyecto** → **un ZIP** (`lab3-4-java.zip`).

## Desplegar

Sube **toda** la carpeta `bootcamp-web/` (HTML + `assets/` + `downloads/`) a GitHub Pages o Object Storage.

## Seguridad

No publiques URLs de `git clone` con tokens personales (`ghp_…`). Usa autenticación normal.
