☁️ Downloader YT Fer32
Descargador de videos y audio de YouTube con interfaz web premium

Python FastAPI yt--dlp License

Descarga videos y audio de YouTube en máxima calidad desde una interfaz moderna, elegante y fácil de usar. Todo en local, sin servicios de terceros.

✨ Características
Característica	Descripción
🎬 Video hasta 4K	Descarga en 4K (2160p), 2K (1440p), 1080p, 720p, 480p y 360p
🎵 Audio MP3 320kbps	Extrae el audio y conviértelo automáticamente a MP3 de alta calidad
📋 Listas de reproducción	Soporte completo para playlists: selecciona los videos que quieras y descárgalos en lote
📊 Progreso en tiempo real	Barra de progreso, velocidad de descarga y tiempo estimado restante
🖥️ Modo App o Navegador	Ejecútalo como ventana independiente (pywebview) o en tu navegador favorito
⚙️ Ajustes persistentes	Configura tu modo de inicio preferido y se recuerda automáticamente
📦 FFmpeg automático	Descarga e instala FFmpeg y FFprobe automáticamente si no están presentes
🎨 Interfaz Premium	Diseño glassmorphism con tema oscuro, animaciones suaves y tipografía Outfit
🖼️ Capturas de Pantalla
💡 Próximamente: Agrega capturas de pantalla de la interfaz aquí para dar una vista previa del proyecto.

📋 Requisitos del Sistema
Requisitos Obligatorios
Requisito	Versión mínima	Detalles
Sistema Operativo	Windows 10+	El launcher start.bat y funciones como abrir carpeta están diseñados para Windows
Python	3.7 o superior	Debe estar instalado y disponible en el PATH del sistema
Conexión a Internet	—	Necesaria para descargar videos y para la primera instalación de dependencias
Dependencias de Python (se instalan automáticamente)
Las siguientes librerías se instalan automáticamente al ejecutar start.bat:

Paquete	Función
fastapi	Framework web para el servidor backend (API REST)
uvicorn	Servidor ASGI de alto rendimiento para ejecutar FastAPI
yt-dlp	Motor de descarga de videos de YouTube (fork mejorado de youtube-dl)
requests	Librería HTTP para peticiones auxiliares
pywebview	Permite ejecutar la interfaz en una ventana nativa independiente (modo App)
Requisitos Opcionales (Recomendados)
Requisito	Función	¿Auto-instalable?
FFmpeg	Fusionar video + audio en calidades superiores a 720p (1080p, 2K, 4K)	✅ Sí, la app lo descarga automáticamente
FFprobe	Analizar información de streams multimedia	✅ Sí, se descarga junto con FFmpeg
⚠️ Sin FFmpeg: las descargas de video se limitan a un máximo de 720p y el audio se descargará en su formato original (m4a/webm) en lugar de MP3.

Verificar que Python está instalado
Abre una terminal (CMD o PowerShell) y ejecuta:

python --version
Deberías ver algo como Python 3.11.x o superior. Si no tienes Python:

Ve a python.org/downloads
Descarga la última versión estable
Importante: durante la instalación, marca la casilla ☑ "Add Python to PATH"
Reinicia la terminal después de instalar
🚀 Instrucciones de Instalación
Método 1: Instalación Automática (Recomendado) ⭐
Este es el método más sencillo. El script start.bat se encarga de todo.

Clona el repositorio (o descárgalo como ZIP):

git clone https://github.com/fermin-jpg/Descargador-de-videos-YT-F32.git
cd Descargador-de-videos-YT-F32
💡 Si no tienes Git, puedes descargar el repositorio como ZIP desde GitHub → botón verde "Code" → "Download ZIP", y descomprímelo donde quieras.

Ejecuta el launcher:

Haz doble clic en start.bat o ejecútalo desde la terminal:

start.bat
El script hará todo automáticamente:

✅ Verifica que Python esté instalado (si no, te ofrece abrir la página de descarga)
✅ Crea un entorno virtual de Python (.venv) si no existe
✅ Instala y actualiza pip dentro del entorno virtual
✅ Instala todas las dependencias: fastapi, uvicorn, yt-dlp, requests, pywebview
✅ Te pregunta qué modo de inicio prefieres (Navegador o App)
✅ Inicia el servidor local y abre la interfaz
FFmpeg (primera ejecución):

Al iniciar por primera vez, la aplicación detectará que FFmpeg no está instalado y te preguntará:

¿Descargar e instalar automáticamente? (S/N) [S]:
Pulsa Enter o escribe S para descargarlo automáticamente (~128 MB cada binario)
FFmpeg y FFprobe se guardarán en la carpeta bin/ del proyecto
Solo necesitas hacer esto una vez
Método 2: Instalación Manual
Si prefieres instalar todo manualmente o estás en un entorno sin start.bat:

Clona el repositorio:

git clone https://github.com/fermin-jpg/Descargador-de-videos-YT-F32.git
cd Descargador-de-videos-YT-F32
Crea un entorno virtual:

python -m venv .venv
Activa el entorno virtual:

# Windows CMD
.venv\Scripts\activate

# Windows PowerShell
.venv\Scripts\Activate.ps1
Instala las dependencias:

pip install --upgrade pip
pip install fastapi uvicorn yt-dlp requests pywebview
Ejecuta la aplicación:

# Modo navegador (se abre en Chrome, Edge, etc.)
python app.py --mode browser

# Modo app (ventana nativa independiente)
python app.py --mode app
Abre tu navegador (solo si usas modo browser) en: http://localhost:8000

Descarga manual de FFmpeg (opcional)
Si la descarga automática falla, puedes instalar FFmpeg manualmente:

Descarga los binarios desde ffbinaries.com o ffmpeg.org
Copia ffmpeg.exe y ffprobe.exe dentro de la carpeta bin/ del proyecto:
Descargador-de-videos-YT-F32/
└── bin/
    ├── ffmpeg.exe
    └── ffprobe.exe
📖 Cómo Usar
Descarga de un Video Individual
Pega una URL de YouTube en el campo de entrada
Ejemplo: https://www.youtube.com/watch?v=dQw4w9WgXcQ
Haz clic en "Analizar" (o pulsa Enter) para obtener la información del video
Se mostrará la miniatura, título, canal y duración del video
Selecciona la calidad deseada en el menú desplegable:
Video: 4K, 2K, 1080p, 720p, 480p, 360p
Audio: MP3 320kbps (requiere FFmpeg) o Audio original
Haz clic en "Comenzar Descarga"
Monitorea el progreso en tiempo real (porcentaje, velocidad, tiempo restante)
Al terminar, haz clic en "Abrir Carpeta" para ver el archivo descargado
Descarga de Listas de Reproducción
Pega el enlace de una playlist de YouTube
Ejemplo: https://www.youtube.com/playlist?list=PLxxxxxxxx
Haz clic en "Analizar" — se cargarán todos los videos de la lista
Se mostrarán los videos con sus miniaturas, títulos y duración
Selecciona/deselecciona los videos que quieras descargar:
Haz clic en cada video para seleccionarlo/deseleccionarlo
Usa "Seleccionar todos" o "Deseleccionar todos" para control rápido
Elige una calidad que se aplicará a todos los videos seleccionados
Haz clic en "Descargar seleccionados"
Monitorea el progreso individual de cada video y el progreso general
Dónde se guardan los archivos
Todos los archivos descargados se guardan automáticamente en la carpeta de Descargas de tu usuario:

C:\Users\TuUsuario\Downloads\
Puedes abrir esta carpeta en cualquier momento usando el botón "Abrir carpeta de descargas" en el pie de la aplicación.

🏗️ Estructura del Proyecto
Descargador-de-videos-YT-F32/
├── app.py               # Backend FastAPI + lógica de descarga con yt-dlp
├── start.bat            # Launcher automático (instala todo y ejecuta)
├── settings.txt         # Modo de inicio guardado (ask/browser/app)
├── Downloader YT F32.ico  # Icono de la aplicación
├── templates/
│   └── index.html       # Interfaz web (HTML principal)
├── static/
│   ├── style.css        # Estilos premium (glassmorphism, animaciones)
│   └── main.js          # Lógica del frontend (fetch, polling, UI)
├── bin/                 # FFmpeg y FFprobe (descargados automáticamente)
│   ├── ffmpeg.exe
│   └── ffprobe.exe
├── .gitignore
└── README.md
🛠️ Stack Tecnológico
Componente	Tecnología
Backend	FastAPI + Uvicorn
Motor de descargas	yt-dlp
Procesamiento multimedia	FFmpeg + FFprobe
Modo App (ventana nativa)	pywebview
Frontend	HTML5 + CSS3 (Glassmorphism) + JavaScript Vanilla
Tipografía	Outfit (Google Fonts)
Iconos	Font Awesome 6
⚙️ Modos de Inicio
Modo	Descripción	Argumento
Navegador	Abre la interfaz en tu navegador predeterminado (Chrome, Edge, Firefox, etc.)	--mode browser
App	Abre en una ventana nativa independiente usando pywebview	--mode app
Preguntar	Te pregunta qué modo quieres usar cada vez que ejecutas start.bat	(por defecto)
Puedes cambiar el modo predeterminado desde el botón de ⚙️ Ajustes dentro de la aplicación. El ajuste se guarda en settings.txt.

🔌 API Endpoints
El backend expone una API REST local en http://localhost:8000:

Método	Endpoint	Descripción
GET	/	Sirve la interfaz web
POST	/api/info	Obtiene información de un video o playlist
POST	/api/download	Inicia la descarga de un video individual
POST	/api/download/batch	Inicia la descarga de múltiples videos
GET	/api/download/status/{id}	Consulta el estado de una descarga
GET	/api/settings	Obtiene la configuración actual
POST	/api/settings	Guarda la configuración
POST	/api/open-folder	Abre la carpeta de descargas en el explorador
🔧 Solución de Problemas
Problema	Solución
python no se reconoce como comando	Instala Python desde python.org y marca "Add Python to PATH" durante la instalación
Error al crear el entorno virtual	Asegúrate de tener Python 3.7+ y que venv esté disponible. Ejecuta python -m ensurepip
Las descargas fallan o se interrumpen	Actualiza yt-dlp: .venv\Scripts\pip install --upgrade yt-dlp
No descarga en 1080p o superior	Verifica que FFmpeg esté en la carpeta bin/. Si no, vuelve a ejecutar start.bat y acepta la descarga
El audio solo se descarga en m4a/webm	FFmpeg no está instalado. Descárgalo automáticamente o manualmente (ver instrucciones arriba)
Error "puerto 8000 en uso"	Otra aplicación está usando el puerto. Ciérrala o espera unos segundos y vuelve a intentar
El entorno virtual no funciona tras mover la carpeta	Elimina la carpeta .venv y vuelve a ejecutar start.bat — se recreará automáticamente
📝 Notas
Esta herramienta es para uso personal y educativo.
Los archivos se descargan a la carpeta Descargas del usuario por defecto.
El servidor corre localmente en 127.0.0.1:8000 — no es accesible desde otros dispositivos en la red.
Si cambias la carpeta del proyecto, el entorno virtual se recreará automáticamente al ejecutar start.bat.
🤝 Contribuciones
¡Las contribuciones son bienvenidas! Si quieres mejorar algo:

Haz un Fork del repositorio
Crea una rama nueva (git checkout -b feature/mi-mejora)
Realiza tus cambios y haz commit (git commit -m 'Añadir mi mejora')
Haz push a tu rama (git push origin feature/mi-mejora)
Abre un Pull Request
Hecho con ❤️ por Fer32

© 2026 Downloader YT Fer32
