# creationsFX — web

Web de [creationsFX](https://www.creationsfx.com/): sangres, material para bonzos y protecciones para especialistas de cine.

Sitio estático (HTML, CSS y JS sin framework ni build).

- `index.html` — portada
- `sangres.html`, `bonzos.html`, `protecciones.html` — páginas de cada línea
- `data/productos.json` — catálogo (textos, precios, formatos, fotos)
- `js/catalogo.js` — pinta las líneas y la ficha de producto
- `assets/brand/` — logos vectorizados (SVG + PNG)

Para verla en local:

```bash
python3 -m http.server 5510
```
