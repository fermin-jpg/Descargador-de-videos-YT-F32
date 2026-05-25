import os
import sys
import uuid
import argparse
import zipfile
import threading
import urllib.request
import webbrowser
from pathlib import Path
from fastapi import FastAPI, HTTPException
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from typing import List
import uvicorn
import yt_dlp
import webview

# Base Directories
BASE_DIR = Path(__file__).resolve().parent
BIN_DIR = BASE_DIR / "bin"
FFMPEG_EXE = BIN_DIR / "ffmpeg.exe"
FFPROBE_EXE = BIN_DIR / "ffprobe.exe"
SETTINGS_FILE = BASE_DIR / "settings.txt"

DOWNLOAD_DIR = Path.home() / "Downloads"

downloads_db = {}
downloads_lock = threading.Lock()

app = FastAPI(title="Downloader YT Fer32 API")

templates_dir = BASE_DIR / "templates"
static_dir = BASE_DIR / "static"
templates_dir.mkdir(parents=True, exist_ok=True)
static_dir.mkdir(parents=True, exist_ok=True)

app.mount("/static", StaticFiles(directory=str(static_dir)), name="static")

parser = argparse.ArgumentParser(description="Downloader YT Fer32 Backend")
parser.add_argument('--mode', choices=['browser', 'app'], default='app')
args = parser.parse_args()

# ─── FFmpeg helpers ────────────────────────────────────────────────────────────
def download_ffmpeg():
    BIN_DIR.mkdir(parents=True, exist_ok=True)
    print("\n[INFO] Descargando FFmpeg automáticamente...")
    urls = {
        "ffmpeg": "https://github.com/ffbinaries/ffbinaries-prebuilt/releases/download/v6.1/ffmpeg-6.1-win-64.zip",
        "ffprobe": "https://github.com/ffbinaries/ffbinaries-prebuilt/releases/download/v6.1/ffprobe-6.1-win-64.zip",
    }
    try:
        for name, url in urls.items():
            zip_path = BIN_DIR / f"{name}.zip"
            print(f"Descargando {name}.exe...")
            urllib.request.urlretrieve(url, zip_path)
            with zipfile.ZipFile(zip_path, 'r') as z:
                z.extractall(BIN_DIR)
            zip_path.unlink()
        print("[SUCCESS] FFmpeg y FFprobe listos.\n")
        return True
    except Exception as e:
        print(f"[ERROR] Fallo al descargar FFmpeg: {e}", file=sys.stderr)
        return False

def check_requirements():
    if FFMPEG_EXE.exists() and FFPROBE_EXE.exists():
        return True
    print("\n========================================================")
    print("  REQUISITO RECOMENDADO: FFmpeg & FFprobe")
    print("========================================================")
    print("Para descargar en 1080p+, 2K, 4K y convertir a MP3 320k")
    print("se necesitan FFmpeg y FFprobe.")
    print("--------------------------------------------------------")
    ans = input("¿Descargar e instalar automáticamente? (S/N) [S]: ").strip().lower()
    if ans in ['', 's', 'si', 'y', 'yes']:
        return download_ffmpeg()
    print("\n[AVISO] Sin FFmpeg: máximo 720p, sin conversión a MP3.")
    input("Presione ENTER para continuar...")
    return False

# ─── Pydantic schemas ─────────────────────────────────────────────────────────
class URLRequest(BaseModel):
    url: str

class DownloadRequest(BaseModel):
    url: str
    quality_id: str

class BatchDownloadItem(BaseModel):
    url: str
    quality_id: str
    title: str

class BatchDownloadRequest(BaseModel):
    items: List[BatchDownloadItem]

class SettingsRequest(BaseModel):
    default_mode: str

# ─── Quality helpers ──────────────────────────────────────────────────────────
def build_qualities(formats):
    heights = {f.get('height') for f in formats if f.get('height')}
    qualities = []
    for h, label in [(2160, "4K (2160p)"), (1440, "2K (1440p)"), (1080, "Full HD (1080p)"),
                     (720, "HD (720p)"), (480, "SD (480p)"), (360, "SD (360p)")]:
        if any(x >= h for x in heights):
            qualities.append({"id": f"{h}p", "label": label, "height": h})
    if FFMPEG_EXE.exists():
        qualities.append({"id": "mp3_320k", "label": "Audio MP3 (320kbps)", "height": 0, "is_audio": True})
    else:
        qualities.append({"id": "best_audio_no_ffmpeg", "label": "Audio original (m4a/webm)", "height": 0, "is_audio": True})
    return qualities

# ─── yt-dlp progress hooks ────────────────────────────────────────────────────
def make_progress_hook(download_id):
    def hook(d):
        status = d.get('status')
        with downloads_lock:
            if download_id not in downloads_db:
                downloads_db[download_id] = {}
            if status == 'downloading':
                downloaded = d.get('downloaded_bytes', 0)
                total = d.get('total_bytes') or d.get('total_bytes_estimate') or 0
                percent = round((downloaded / total) * 100, 1) if total > 0 else 0.0
                speed = d.get('speed') or 0
                if speed > 1024 * 1024:
                    speed_str = f"{speed/(1024*1024):.1f} MB/s"
                elif speed > 1024:
                    speed_str = f"{speed/1024:.1f} KB/s"
                else:
                    speed_str = f"{int(speed)} B/s"
                eta = d.get('eta')
                eta_str = f"{eta//60}m {eta%60}s" if eta and eta > 60 else (f"{eta}s" if eta else "--:--")
                downloads_db[download_id].update({"status": "downloading", "percent": percent, "speed": speed_str, "eta": eta_str})
            elif status == 'finished':
                downloads_db[download_id].update({"status": "processing", "percent": 100.0, "speed": "--", "eta": "Procesando..."})
    return hook

def make_postprocessor_hook(download_id):
    def hook(d):
        if d.get('status') == 'started':
            pp = d.get('postprocessor', '')
            action = {"ExtractAudio": "Convirtiendo a MP3...", "FFmpegMerger": "Fusionando video y audio...",
                      "FFmpegVideoConvertor": "Convirtiendo video..."}.get(pp, "Procesando...")
            with downloads_lock:
                if download_id not in downloads_db:
                    downloads_db[download_id] = {}
                downloads_db[download_id].update({"status": "processing", "eta": action})
    return hook

# ─── Download thread ──────────────────────────────────────────────────────────
def run_download_thread(download_id, url, quality_id, output_dir):
    try:
        ydl_opts = {
            'ffmpeg_location': str(BIN_DIR) if FFMPEG_EXE.exists() else None,
            'progress_hooks': [make_progress_hook(download_id)],
            'postprocessor_hooks': [make_postprocessor_hook(download_id)],
            'restrictfilenames': True,
            'quiet': True,
            'no_warnings': True,
        }
        if quality_id == 'mp3_320k':
            ydl_opts.update({'format': 'bestaudio/best',
                             'outtmpl': os.path.join(output_dir, '%(title)s.%(ext)s'),
                             'postprocessors': [{'key': 'FFmpegExtractAudio', 'preferredcodec': 'mp3', 'preferredquality': '320'}]})
        elif quality_id == 'best_audio_no_ffmpeg':
            ydl_opts.update({'format': 'bestaudio/best', 'outtmpl': os.path.join(output_dir, '%(title)s.%(ext)s')})
        else:
            height = int(quality_id.replace('p', ''))
            if FFMPEG_EXE.exists():
                ydl_opts.update({'format': f'bestvideo[height<={height}]+bestaudio/best[height<={height}]/best',
                                 'merge_output_format': 'mp4', 'outtmpl': os.path.join(output_dir, '%(title)s.%(ext)s')})
            else:
                ydl_opts.update({'format': f'best[height<={height}][ext=mp4]/best[height<={height}]',
                                 'outtmpl': os.path.join(output_dir, '%(title)s.%(ext)s')})

        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(url, download=True)
            filename = ydl.prepare_filename(info)
            if quality_id == 'mp3_320k':
                filename = os.path.splitext(filename)[0] + '.mp3'
            elif FFMPEG_EXE.exists() and quality_id not in ('best_audio_no_ffmpeg',):
                filename = os.path.splitext(filename)[0] + '.mp4'
            with downloads_lock:
                downloads_db[download_id].update({"status": "completed", "percent": 100.0,
                                                  "filename": os.path.basename(filename), "filepath": filename})
    except Exception as e:
        import traceback; traceback.print_exc()
        with downloads_lock:
            downloads_db[download_id].update({"status": "failed", "error": str(e)})

# ─── Routes ───────────────────────────────────────────────────────────────────
@app.get("/")
def index():
    return FileResponse(str(templates_dir / "index.html"))

@app.get("/api/settings")
def get_settings():
    mode = "app"
    if SETTINGS_FILE.exists():
        try:
            v = SETTINGS_FILE.read_text().strip()
            if v in ("browser", "app"):
                mode = v
        except Exception:
            pass
    return {"default_mode": mode}

@app.post("/api/settings")
def save_settings(req: SettingsRequest):
    if req.default_mode not in ("browser", "app"):
        raise HTTPException(400, "Modo no válido")
    SETTINGS_FILE.write_text(req.default_mode)
    return {"success": True}

@app.post("/api/info")
def fetch_info(req: URLRequest):
    if not req.url:
        raise HTTPException(400, "URL requerida")
    ydl_opts = {'ffmpeg_location': str(BIN_DIR) if FFMPEG_EXE.exists() else None,
                'quiet': True, 'no_warnings': True,
                'extract_flat': 'in_playlist',   # fast flat extraction for playlists
                'skip_download': True}
    try:
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(req.url, download=False)

        # ── Playlist? ──────────────────────────────────────────────────────
        if info.get('_type') == 'playlist' or info.get('entries'):
            entries = info.get('entries') or []
            videos = []
            for e in entries:
                if not e:
                    continue
                vid_url = e.get('url') or e.get('webpage_url') or f"https://www.youtube.com/watch?v={e.get('id','')}"
                videos.append({
                    "id": e.get('id', ''),
                    "url": vid_url,
                    "title": e.get('title', 'Sin título'),
                    "duration": _fmt_duration(e.get('duration')),
                    "thumbnail": e.get('thumbnail') or e.get('thumbnails', [{}])[-1].get('url', ''),
                    "uploader": e.get('uploader') or e.get('channel') or info.get('uploader', ''),
                })

            # Get available qualities from a quality-aware re-fetch of first entry
            qualities = _get_playlist_qualities(videos[0]['url'] if videos else req.url)

            return {
                "type": "playlist",
                "playlist_title": info.get('title', 'Lista de reproducción'),
                "playlist_uploader": info.get('uploader') or info.get('channel', ''),
                "count": len(videos),
                "videos": videos,
                "qualities": qualities,
            }

        # ── Single video ───────────────────────────────────────────────────
        else:
            return {
                "type": "video",
                "title": info.get('title', 'Sin título'),
                "duration": _fmt_duration(info.get('duration')),
                "uploader": info.get('uploader', 'Canal desconocido'),
                "thumbnail": info.get('thumbnail', ''),
                "qualities": build_qualities(info.get('formats', [])),
                "url": req.url,
            }
    except Exception as e:
        raise HTTPException(400, f"No se pudo obtener información: {str(e)}")

def _fmt_duration(sec):
    if not sec:
        return "?:??"
    sec = int(sec)
    h, rem = divmod(sec, 3600)
    m, s = divmod(rem, 60)
    return f"{h}:{m:02d}:{s:02d}" if h else f"{m}:{s:02d}"

def _get_playlist_qualities(first_url):
    """Do a full (non-flat) extract of a single entry to get format list."""
    try:
        opts = {'ffmpeg_location': str(BIN_DIR) if FFMPEG_EXE.exists() else None,
                'quiet': True, 'no_warnings': True, 'skip_download': True}
        with yt_dlp.YoutubeDL(opts) as ydl:
            info = ydl.extract_info(first_url, download=False)
        return build_qualities(info.get('formats', []))
    except Exception:
        # Return a sensible default if fetch fails
        return [{"id": "1080p", "label": "Full HD (1080p)", "height": 1080},
                {"id": "720p",  "label": "HD (720p)",       "height": 720},
                {"id": "mp3_320k" if FFMPEG_EXE.exists() else "best_audio_no_ffmpeg",
                 "label": "Audio MP3 (320kbps)" if FFMPEG_EXE.exists() else "Audio original",
                 "height": 0, "is_audio": True}]

@app.post("/api/download")
def start_download(req: DownloadRequest):
    download_id = uuid.uuid4().hex
    with downloads_lock:
        downloads_db[download_id] = {"status": "starting", "percent": 0.0, "speed": "0 B/s", "eta": "Conectando..."}
    threading.Thread(target=run_download_thread, args=(download_id, req.url, req.quality_id, str(DOWNLOAD_DIR)), daemon=True).start()
    return {"download_id": download_id}

@app.post("/api/download/batch")
def start_batch_download(req: BatchDownloadRequest):
    """Start multiple downloads; returns list of {title, download_id}."""
    results = []
    for item in req.items:
        download_id = uuid.uuid4().hex
        with downloads_lock:
            downloads_db[download_id] = {"status": "starting", "percent": 0.0, "speed": "0 B/s", "eta": "Conectando...", "title": item.title}
        threading.Thread(target=run_download_thread, args=(download_id, item.url, item.quality_id, str(DOWNLOAD_DIR)), daemon=True).start()
        results.append({"title": item.title, "download_id": download_id})
    return {"downloads": results}

@app.get("/api/download/status/{download_id}")
def check_status(download_id: str):
    with downloads_lock:
        status = downloads_db.get(download_id)
    if not status:
        raise HTTPException(404, "ID no encontrado")
    return status

@app.post("/api/open-folder")
def open_downloads_folder():
    try:
        if os.name == 'nt':
            os.startfile(str(DOWNLOAD_DIR))
            return {"success": True}
    except Exception as e:
        return {"success": False, "error": str(e)}
    return {"success": False, "error": "Solo disponible en Windows"}

# ─── Launch helpers ───────────────────────────────────────────────────────────
def launch_browser():
    print("[INFO] Abriendo en el navegador predeterminado...")
    webbrowser.open("http://localhost:8000")

def start_server():
    print("Iniciando servidor local de Downloader YT Fer32...")
    uvicorn.run("app:app", host="127.0.0.1", port=8000, log_level="warning")

if __name__ == "__main__":
    check_requirements()

    if args.mode == 'app':
        print("[INFO] Iniciando en modo APP (Ventana nativa)...")
        threading.Thread(target=start_server, daemon=True).start()
        webview.create_window("Downloader YT Fer32", "http://localhost:8000", width=740, height=900, resizable=True)
        webview.start()
    else:
        threading.Timer(1.5, launch_browser).start()
        start_server()
