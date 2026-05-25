@echo off
title Downloader YT Fer32 Launcher
echo ========================================================
echo               DOWNLOADER YT Fer32 LAUNCHER
echo ========================================================
echo.

:: Navigate to script directory
cd /d "%~dp0"

:: Requirement Check: Check if Python is installed
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ALERTA] Python no esta instalado o no se encuentra en el PATH.
    echo Se requiere Python 3.7 o superior para ejecutar Downloader YT Fer32.
    echo.
    set /p "install_py=¿Desea abrir la pagina oficial de descargas de Python en su navegador? (S/N): "
    
    :: Open URL if user accepts
    if /i "%install_py%"=="s" start https://www.python.org/downloads/
    if /i "%install_py%"=="si" start https://www.python.org/downloads/
    
    echo.
    echo Por favor, instala Python y vuelve a ejecutar este archivo.
    pause
    exit /b 1
)

:: Check if Virtual Environment exists and is working
if not exist ".venv" goto make_venv
.venv\Scripts\python -c "import sys" >nul 2>&1
if %errorlevel% equ 0 goto venv_ok
echo [AVISO] El entorno virtual existente (.venv) no es compatible o fue movido de carpeta.
echo Recreando entorno virtual para asegurar el correcto funcionamiento...
rmdir /s /q .venv

:make_venv
echo [INFO] Creando entorno virtual Python en .venv...
python -m venv .venv
if %errorlevel% neq 0 (
    echo [ERROR] Error al crear el entorno virtual.
    pause
    exit /b 1
)
echo [SUCCESS] Entorno virtual creado con exito.
echo.

:venv_ok

:: Install / Update dependencies
echo [INFO] Verificando e instalando dependencias de Python (fastapi, uvicorn, yt-dlp, requests, pywebview)...
.venv\Scripts\python -m pip install --upgrade pip
.venv\Scripts\python -m pip install fastapi uvicorn yt-dlp requests pywebview
if %errorlevel% neq 0 (
    echo [ERROR] Fallo al instalar las dependencias necesarias.
    pause
    exit /b 1
)
echo [SUCCESS] Dependencias listas.
echo.

:: Check default launch mode in settings.txt
set "LAUNCH_MODE=ask"
if exist "settings.txt" (
    set /p LAUNCH_MODE=<settings.txt
)

if "%LAUNCH_MODE%"=="app" (
    echo [INFO] Modo de inicio predeterminado detectado: APP ^(Ventana nativa^)
    goto run
)
if "%LAUNCH_MODE%"=="browser" (
    echo [INFO] Modo de inicio predeterminado detectado: Navegador
    goto run
)

:: Select Launch Mode if not configured or set to ask
echo ========================================================
echo             SELECCIONA EL MODO DE INICIO
echo ========================================================
echo 1 - Abrir en el navegador (Chrome, Edge, Firefox, etc.)
echo 2 - Abrir en ventana de APP (Modo Aplicacion Independiente)
echo ========================================================
echo.
set "mode_choice=1"
set /p "mode_choice=Selecciona una opcion (1 o 2) [Por defecto 1]: "

if "%mode_choice%"=="2" (
    set "LAUNCH_MODE=app"
) else (
    set "LAUNCH_MODE=browser"
)

:run
echo.
echo [INFO] Iniciando backend de Downloader YT Fer32 en modo %LAUNCH_MODE%...
.venv\Scripts\python app.py --mode %LAUNCH_MODE%

pause
