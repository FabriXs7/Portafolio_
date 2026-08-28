# Carta de presentación — Portafolio

Sitio de una sola página, listo para editar por código y desplegar en **Azure Static Web Apps**. No usa backend ni base de datos: todo el contenido vive en un solo archivo (`data.js`), así que actualizar el sitio es tan simple como editar texto y subir imágenes.

## Estructura del proyecto

```
portfolio/
├── index.html               → estructura de la página (normalmente no la tocas)
├── styles.css                → estilos visuales
├── script.js                  → lógica (tabs, lightbox, render de datos)
├── data.js                    → ⭐ AQUÍ EDITAS TODO EL CONTENIDO
├── staticwebapp.config.json   → configuración para Azure Static Web Apps
└── images/
    ├── blender/    → imágenes de tus proyectos de Blender
    ├── web/        → capturas de tus páginas web
    └── software/   → capturas de tus programas/software
```

## Cómo actualizar el contenido

Todo el contenido editable está en **`data.js`**. Ábrelo con cualquier editor de texto (VS Code, por ejemplo) y modifica el objeto `SITE_DATA`:

### 1. Tu presentación (`profile`)
```js
profile: {
  name: "Tu Nombre Apellido",
  role: "Artista 3D · Desarrollador Web · Software",
  tagline: "Una frase corta que te describa",
  location: "Trujillo, Perú",
  availability: "Disponible para proyectos freelance",
  experience: "3+ años de experiencia",
  bio: "Un párrafo breve sobre ti.",
  email: "tucorreo@ejemplo.com",
  social: [{ label: "GitHub", url: "https://github.com/tuusuario" }]
}
```

### 2. Proyectos de Blender
```js
blender: [
  {
    title: "Nombre del proyecto",
    image: "images/blender/mi-imagen.jpg",
    description: "Descripción corta (opcional)"
  }
]
```

### 3. Proyectos de páginas web (con link)
```js
web: [
  {
    title: "Nombre del sitio",
    link: "https://tusitio.com",
    image: "images/web/mi-captura.jpg",
    description: "Qué es y con qué está hecho"
  }
]
```

### 4. Proyectos de software (nombre + descripción + varias fotos)
```js
software: [
  {
    name: "Nombre del software",
    description: "Qué hace y para qué sirve",
    images: [
      "images/software/foto-1.jpg",
      "images/software/foto-2.jpg"
    ]
  }
]
```

Para agregar más proyectos en cualquier categoría, simplemente copia y pega otro bloque `{ ... }` dentro del arreglo, separado por coma.

### Agregar imágenes
Copia el archivo de imagen dentro de la carpeta que corresponda (`images/blender`, `images/web` o `images/software`) y escribe esa ruta exacta en el campo `image` / `images` del proyecto. Si una ruta está mal escrita o falta la imagen, la tarjeta muestra automáticamente un aviso en vez de romperse.

## Probar el sitio localmente

Como el sitio es 100% estático (HTML/CSS/JS sin build), puedes previsualizarlo con cualquier servidor local simple. Ejemplos:

```bash
# Opción 1: con Python
python3 -m http.server 8080

# Opción 2: con Node
npx serve .
```

Luego abre `http://localhost:8080` en el navegador. Evita abrir `index.html` con doble clic directamente (`file://`), porque algunos navegadores restringen la carga de archivos locales.

## Desplegar en Azure Static Web Apps

### Opción A — Desde GitHub (recomendada)
1. Sube esta carpeta a un repositorio en GitHub.
2. En Azure Portal, crea un recurso **Static Web App**.
3. Conéctalo a tu repositorio de GitHub y selecciona la rama principal.
4. En la configuración de build:
   - **App location**: `/`
   - **Api location**: (déjalo vacío)
   - **Output location**: (déjalo vacío)
5. Azure creará automáticamente un GitHub Action que despliega el sitio cada vez que hagas `git push`. Así, para actualizar tu portafolio en producción, solo editas `data.js` y/o agregas imágenes, y haces:
   ```bash
   git add .
   git commit -m "Actualizo proyectos"
   git push
   ```

### Opción B — Con la CLI de Azure (sin GitHub)
```bash
npm install -g @azure/static-web-apps-cli

swa deploy ./portfolio --deployment-token <TU_TOKEN_DE_DESPLIEGUE>
```
El token de despliegue lo obtienes desde el recurso Static Web App en Azure Portal, en la sección "Tokens de implementación".

## Personalización visual

Los colores, tipografías y espaciados están centralizados como variables CSS al inicio de `styles.css` (bloque `:root`). Cambiar, por ejemplo, `--violet` o `--amber` actualiza el acento en todo el sitio de forma consistente.
