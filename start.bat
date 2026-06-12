@echo off
title Downloader Pro Fer32 Launcher
echo ========================================================
echo              DOWNLOADER PRO Fer32 LAUNCHER
echo ========================================================
echo.

:: Navigate to script directory
cd /d "%~dp0"

:: ──────────────────────────────────────────────────────────
:: Buscar Python de multiples formas
:: ──────────────────────────────────────────────────────────
set "PYTHON_CMD="

:: Intento 1: comando "python"
python --version >nul 2>&1
if %errorlevel% equ 0 (
    set "PYTHON_CMD=python"
    goto python_found
)

:: Intento 2: comando "python3"
python3 --version >nul 2>&1
if %errorlevel% equ 0 (
    set "PYTHON_CMD=python3"
    goto python_found
)

:: Intento 3: Python Launcher "py" (se instala con Python en Windows)
py --version >nul 2>&1
if %errorlevel% equ 0 (
    set "PYTHON_CMD=py"
    goto python_found
)

:: Intento 4: Buscar en rutas comunes de instalacion
for %%P in (
    "%LocalAppData%\Programs\Python\Python314\python.exe"
    "%LocalAppData%\Programs\Python\Python313\python.exe"
    "%LocalAppData%\Programs\Python\Python312\python.exe"
    "%LocalAppData%\Programs\Python\Python311\python.exe"
    "%LocalAppData%\Programs\Python\Python310\python.exe"
    "%LocalAppData%\Programs\Python\Python39\python.exe"
    "%ProgramFiles%\Python314\python.exe"
    "%ProgramFiles%\Python313\python.exe"
    "%ProgramFiles%\Python312\python.exe"
    "%ProgramFiles%\Python311\python.exe"
    "%ProgramFiles%\Python310\python.exe"
    "%ProgramFiles%\Python39\python.exe"
) do (
    if exist %%P (
        set "PYTHON_CMD=%%~P"
        goto python_found
    )
)

:: No se encontro Python
echo [ALERTA] Python no esta instalado o no se encuentra en el PATH.
echo Se requiere Python 3.7 o superior para ejecutar Downloader Pro Fer32.
echo.
echo Consejo: Si ya tienes Python instalado, asegurate de marcar la casilla
echo "Add Python to PATH" durante la instalacion, o reinstala Python con esa opcion.
echo.
set "install_py="
set /p "install_py=Desea abrir la pagina oficial de descargas de Python en su navegador? (S/N): "

if /i "%install_py%"=="s" start "" "https://www.python.org/downloads/"
if /i "%install_py%"=="si" start "" "https://www.python.org/downloads/"
if /i "%install_py%"=="y" start "" "https://www.python.org/downloads/"
if /i "%install_py%"=="yes" start "" "https://www.python.org/downloads/"

echo.
echo Por favor, instala Python y vuelve a ejecutar este archivo.
pause
exit /b 1

:python_found
echo [OK] Python encontrado: %PYTHON_CMD%
%PYTHON_CMD% --version
echo.

:: ──────────────────────────────────────────────────────────
:: Verificar entorno virtual
:: ──────────────────────────────────────────────────────────
if not exist ".venv" goto make_venv
.venv\Scripts\python -c "import sys" >nul 2>&1
if %errorlevel% equ 0 goto venv_ok
echo [AVISO] El entorno virtual existente (.venv) no es compatible o fue movido de carpeta.
echo Recreando entorno virtual para asegurar el correcto funcionamiento...
rmdir /s /q .venv

:make_venv
echo [INFO] Creando entorno virtual Python en .venv...
%PYTHON_CMD% -m venv .venv
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

:: ──────────────────────────────────────────────────────────
:: Seleccionar modo de inicio
:: ──────────────────────────────────────────────────────────
set "LAUNCH_MODE=app"
if exist "settings.txt" (
    set /p LAUNCH_MODE=<settings.txt
)

:: Normalizar y validar LAUNCH_MODE
if not "%LAUNCH_MODE%"=="app" if not "%LAUNCH_MODE%"=="browser" (
    set "LAUNCH_MODE=app"
)

:run
echo.
echo [INFO] Iniciando backend de Downloader Pro Fer32 en modo %LAUNCH_MODE%...
.venv\Scripts\python app.py --mode %LAUNCH_MODE%

pause
