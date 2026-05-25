# ☁️ Downloader YT F32

Descarga videos y audio de YouTube en máxima calidad desde una interfaz moderna, elegante y fácil de usar. Todo en local, sin servicios de terceros.

## 🪄Instrucciones 

1 - Descargar Pyhton : https://www.python.org/downloads/

2 - Descargar ZIP : Descarga todas las carpetas en ZIP desde la flecha de arriba del botón verde.

3 - inicia el `Start.bat`.

4 - instala las dependecias que te pide (tarda 3 min aprox en total)

5 - Pega la URL de vídeo que quieras.

6 - Una vez finalizado, se guarda en la carpeta de descargas.

**Tecnologías:** `Python` `FastAPI` `yt-dlp` | **Licencia:** `MIT`

---

## 🌟 Características

| Característica | Descripción |
| :--- | :--- |
| **🎬 Video hasta 4K** | Descarga en 4K (2160p), 2K (1440p), 1080p, 720p, 480p y 360p. |
| **🎵 Audio MP3 320kbps** | Extrae el audio y conviértelo automáticamente a MP3 de alta calidad. |
| **📋 Listas de reproducción** | Soporte completo para playlists: selecciona los videos que quieras y descárgalos en lote. |
| **📊 Progreso en tiempo real** | Barra de progreso, velocidad de descarga y tiempo estimado restante. |
| **🖥️ Modo App o Navegador** | Ejecútalo como ventana independiente (`pywebview`) o en tu navegador favorito. |
| **⚙️ Ajustes persistentes** | Configura tu modo de inicio preferido y se recuerda automáticamente. |
| **📦 FFmpeg automático** | Descarga e instala FFmpeg y FFprobe automáticamente si no están presentes. |
| **🎨 Interfaz Premium** | Diseño glassmorphism con tema oscuro, animaciones suaves y tipografía Outfit. |

## 📋 Requisitos del Sistema

### Requisitos Obligatorios

| Requisito | Versión mínima | Detalles |
| :--- | :--- | :--- |
| **Sistema Operativo** | Windows 10+ | El launcher `start.bat` y funciones como abrir carpeta están diseñados para Windows. |
| **Python** | 3.7 o superior | Debe estar instalado y disponible en el PATH del sistema. |
| **Conexión a Internet** | — | Necesaria para descargar videos y para la primera instalación de dependencias. |

### Dependencias de Python (se instalan automáticamente)
Las siguientes librerías se instalan automáticamente al ejecutar `start.bat`:

| Paquete | Función |
| :--- | :--- |
| **fastapi** | Framework web para el servidor backend (API REST). |
| **uvicorn** | Servidor ASGI de alto rendimiento para ejecutar FastAPI. |
| **yt-dlp** | Motor de descarga de videos de YouTube (fork mejorado de youtube-dl). |
| **requests** | Librería HTTP para peticiones auxiliares. |
| **pywebview** | Permite ejecutar la interfaz en una ventana nativa independiente (modo App). |

### Requisitos Opcionales (Recomendados)

| Requisito | Función | ¿Auto-instalable? |
| :--- | :--- | :--- |
| **FFmpeg** | Fusionar video + audio en calidades superiores a 720p (1080p, 2K, 4K). | ✅ Sí, la app lo descarga automáticamente. |
| **FFprobe** | Analizar información de streams multimedia. | ✅ Sí, se descarga junto con FFmpeg. |

> ⚠️ **Sin FFmpeg:** las descargas de video se limitan a un máximo de 720p y el audio se descargará en su formato original (`m4a`/`webm`) en lugar de MP3.

---
