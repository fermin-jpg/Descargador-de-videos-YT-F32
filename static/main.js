document.addEventListener('DOMContentLoaded', () => {
    // ── Core UI elements ─────────────────────────────────────────────────────
    const urlInput        = document.getElementById('url-input');
    const fetchBtn        = document.getElementById('fetch-btn');
    const clearBtn        = document.getElementById('clear-btn');
    const urlError        = document.getElementById('url-error');
    const errorMessage    = document.getElementById('error-message');

    const loadingSection  = document.getElementById('loading-section');
    const infoSection     = document.getElementById('info-section');
    const progressSection = document.getElementById('progress-section');

    // Single video
    const videoThumbnail        = document.getElementById('video-thumbnail');
    const videoDuration         = document.getElementById('video-duration');
    const videoTitle            = document.getElementById('video-title');
    const videoUploader         = document.getElementById('video-uploader');
    const qualitySelect         = document.getElementById('quality-select');
    const downloadBtn           = document.getElementById('download-btn');
    const progressStatusTitle   = document.getElementById('progress-status-title');
    const progressPercentText   = document.getElementById('progress-percentage-text');
    const progressBarFill       = document.getElementById('progress-bar-fill');
    const statSpeed             = document.getElementById('stat-speed');
    const statEta               = document.getElementById('stat-eta');
    const progressSpinner       = document.getElementById('progress-spinner');
    const progressSuccessIcon   = document.getElementById('progress-success-icon');
    const progressFailedIcon    = document.getElementById('progress-failed-icon');
    const successActionContainer = document.getElementById('success-action-container');
    const successFilename       = document.getElementById('success-filename');
    const openFolderBtnSuccess  = document.getElementById('open-folder-btn-success');
    const failedActionContainer = document.getElementById('failed-action-container');
    const failedErrorMsg        = document.getElementById('failed-error-msg');

    // Playlist
    const playlistSection       = document.getElementById('playlist-section');
    const playlistTitleEl       = document.getElementById('playlist-title');
    const playlistUploaderEl    = document.getElementById('playlist-uploader');
    const playlistCountEl       = document.getElementById('playlist-count');
    const playlistQualitySelect = document.getElementById('playlist-quality-select');
    const playlistVideoList     = document.getElementById('playlist-video-list');
    const selectAllBtn          = document.getElementById('select-all-btn');
    const selectNoneBtn         = document.getElementById('select-none-btn');
    const selectedCountLabel    = document.getElementById('selected-count-label');
    const playlistDlBtn         = document.getElementById('playlist-download-btn');
    const playlistDlBtnLabel    = document.getElementById('playlist-dl-btn-label');

    // Batch progress
    const batchProgressSection  = document.getElementById('batch-progress-section');
    const batchOverallLabel     = document.getElementById('batch-overall-label');
    const batchOverallBar       = document.getElementById('batch-overall-bar');
    const batchItemsList        = document.getElementById('batch-items-list');
    const batchDoneActions      = document.getElementById('batch-done-actions');
    const batchOpenFolderBtn    = document.getElementById('batch-open-folder-btn');

    // Settings
    const settingsBtn       = document.getElementById('settings-btn');
    const settingsModal     = document.getElementById('settings-modal');
    const closeSettingsBtn  = document.getElementById('close-settings-btn');
    const defaultModeSelect = document.getElementById('default-mode-select');
    const settingsStatus    = document.getElementById('settings-status');

    // Footer
    const globalOpenFolderBtn = document.getElementById('global-open-folder-btn');

    // ── State ────────────────────────────────────────────────────────────────
    let currentVideoUrl      = '';
    let playlistVideos       = [];
    let pollingInterval      = null;
    let batchPollingInterval = null;
    let statusTimeout        = null;

    // ── Helper: reset all result panels ──────────────────────────────────────
    function resetUI() {
        loadingSection.style.display     = 'none';
        infoSection.style.display        = 'none';
        progressSection.style.display    = 'none';
        playlistSection.style.display    = 'none';
        batchProgressSection.style.display = 'none';
        urlError.style.display           = 'none';
        if (pollingInterval)      { clearInterval(pollingInterval);      pollingInterval = null; }
        if (batchPollingInterval) { clearInterval(batchPollingInterval); batchPollingInterval = null; }
    }

    function showError(msg) {
        errorMessage.textContent = msg;
        urlError.style.display = 'flex';
    }

    // ── URL input handlers ───────────────────────────────────────────────────
    urlInput.addEventListener('input', () => {
        clearBtn.style.display = urlInput.value.trim() ? 'block' : 'none';
    });

    clearBtn.addEventListener('click', () => {
        urlInput.value = '';
        clearBtn.style.display = 'none';
        resetUI();
        urlInput.focus();
    });

    urlInput.addEventListener('keydown', e => { if (e.key === 'Enter') fetchBtn.click(); });

    // ── Fetch info (video OR playlist) ───────────────────────────────────────
    fetchBtn.addEventListener('click', async () => {
        const url = urlInput.value.trim();
        if (!url) { showError('Por favor, introduce una URL de YouTube'); return; }
        if (!url.includes('youtube.com') && !url.includes('youtu.be')) {
            showError('Por favor, introduce una URL de YouTube válida'); return;
        }

        resetUI();
        loadingSection.style.display = 'block';
        fetchBtn.disabled = true;

        try {
            const res  = await fetch('/api/info', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.detail || 'Error al analizar');

            loadingSection.style.display = 'none';

            if (data.type === 'playlist') {
                renderPlaylist(data);
            } else {
                renderSingleVideo(data);
            }
        } catch (err) {
            loadingSection.style.display = 'none';
            showError(err.message);
        } finally {
            fetchBtn.disabled = false;
        }
    });

    // ── Render: single video ─────────────────────────────────────────────────
    function renderSingleVideo(data) {
        currentVideoUrl = data.url;
        videoTitle.textContent = data.title;
        videoUploader.innerHTML = `<i class="fa-solid fa-circle-user"></i> ${data.uploader}`;
        videoDuration.textContent = data.duration;
        videoThumbnail.src = data.thumbnail;

        qualitySelect.innerHTML = '';
        data.qualities.forEach(q => {
            const opt = document.createElement('option');
            opt.value = q.id;
            opt.textContent = q.label;
            qualitySelect.appendChild(opt);
        });

        infoSection.style.display = 'block';
    }

    // ── Render: playlist ─────────────────────────────────────────────────────
    function renderPlaylist(data) {
        playlistVideos = data.videos;

        playlistTitleEl.textContent    = data.playlist_title;
        playlistUploaderEl.textContent = data.playlist_uploader || '';
        playlistCountEl.textContent    = `${data.count} videos`;

        // Populate quality selector
        playlistQualitySelect.innerHTML = '';
        data.qualities.forEach(q => {
            const opt = document.createElement('option');
            opt.value = q.id;
            opt.textContent = q.label;
            playlistQualitySelect.appendChild(opt);
        });

        // Build video items
        playlistVideoList.innerHTML = '';
        data.videos.forEach((v, i) => {
            const item = document.createElement('div');
            item.className = 'playlist-item selected';
            item.dataset.index = i;

            const thumb = v.thumbnail
                ? `<img class="playlist-item-thumb" src="${v.thumbnail}" alt="" loading="lazy">`
                : `<div class="playlist-item-thumb"></div>`;

            item.innerHTML = `
                <input type="checkbox" id="pl-chk-${i}" checked>
                ${thumb}
                <div class="playlist-item-info">
                    <div class="playlist-item-title" title="${escHtml(v.title)}">${escHtml(v.title)}</div>
                    <div class="playlist-item-uploader">${escHtml(v.uploader || '')}</div>
                </div>
                <span class="playlist-item-duration">${v.duration}</span>
            `;

            // Clicking the row toggles the checkbox
            item.addEventListener('click', e => {
                if (e.target.tagName === 'INPUT') return; // let native event run
                const chk = item.querySelector('input[type="checkbox"]');
                chk.checked = !chk.checked;
                updateItemSelection(item, chk.checked);
                updateSelectionCount();
            });

            // Checkbox change
            item.querySelector('input').addEventListener('change', e => {
                updateItemSelection(item, e.target.checked);
                updateSelectionCount();
            });

            playlistVideoList.appendChild(item);
        });

        updateSelectionCount();
        playlistSection.style.display = 'block';
    }

    function updateItemSelection(item, selected) {
        if (selected) {
            item.classList.add('selected');
        } else {
            item.classList.remove('selected');
        }
    }

    function updateSelectionCount() {
        const total    = playlistVideoList.querySelectorAll('.playlist-item').length;
        const checked  = playlistVideoList.querySelectorAll('input[type="checkbox"]:checked').length;
        selectedCountLabel.textContent = `${checked} seleccionado${checked !== 1 ? 's' : ''}`;
        playlistDlBtnLabel.textContent = `Descargar seleccionados (${checked})`;
        playlistDlBtn.disabled = checked === 0;
    }

    function escHtml(str) {
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    // ── Select all / none ────────────────────────────────────────────────────
    selectAllBtn.addEventListener('click', () => {
        playlistVideoList.querySelectorAll('.playlist-item').forEach(item => {
            item.querySelector('input').checked = true;
            updateItemSelection(item, true);
        });
        updateSelectionCount();
    });

    selectNoneBtn.addEventListener('click', () => {
        playlistVideoList.querySelectorAll('.playlist-item').forEach(item => {
            item.querySelector('input').checked = false;
            updateItemSelection(item, false);
        });
        updateSelectionCount();
    });

    // ── Single video download ────────────────────────────────────────────────
    downloadBtn.addEventListener('click', async () => {
        const qualityId = qualitySelect.value;
        if (!currentVideoUrl || !qualityId) return;

        progressSection.style.display = 'block';
        successActionContainer.style.display = 'none';
        failedActionContainer.style.display = 'none';
        progressSpinner.style.display = 'inline-block';
        progressSuccessIcon.style.display = 'none';
        progressFailedIcon.style.display = 'none';
        progressBarFill.style.width = '0%';
        progressPercentText.textContent = '0%';
        progressStatusTitle.textContent = 'Iniciando descarga...';
        statSpeed.textContent = '--';
        statEta.textContent = 'Conectando...';
        progressSection.scrollIntoView({ behavior: 'smooth' });

        downloadBtn.disabled = true;
        qualitySelect.disabled = true;
        fetchBtn.disabled = true;

        try {
            const res  = await fetch('/api/download', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url: currentVideoUrl, quality_id: qualityId })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.detail || 'No se pudo iniciar la descarga');
            pollSingleDownload(data.download_id);
        } catch (err) {
            showSingleError(err.message);
            reenableSingle();
        }
    });

    function pollSingleDownload(id) {
        if (pollingInterval) clearInterval(pollingInterval);
        pollingInterval = setInterval(async () => {
            try {
                const res  = await fetch(`/api/download/status/${id}`);
                const data = await res.json();
                applySingleStatus(data, id);
            } catch (_) {}
        }, 1000);
    }

    function applySingleStatus(data, id) {
        if (data.status === 'starting') {
            progressStatusTitle.textContent = 'Iniciando...';
        } else if (data.status === 'downloading') {
            progressStatusTitle.textContent = 'Descargando de YouTube...';
            progressPercentText.textContent = `${data.percent}%`;
            progressBarFill.style.width = `${data.percent}%`;
            statSpeed.textContent = data.speed;
            statEta.textContent = data.eta;
        } else if (data.status === 'processing') {
            progressStatusTitle.textContent = 'Procesando...';
            progressPercentText.textContent = '100%';
            progressBarFill.style.width = '100%';
            statEta.textContent = data.eta;
        } else if (data.status === 'completed') {
            clearInterval(pollingInterval); pollingInterval = null;
            progressStatusTitle.textContent = 'Descarga Completa';
            progressPercentText.textContent = '100%';
            progressBarFill.style.width = '100%';
            statSpeed.textContent = '--';
            statEta.textContent = 'Completado';
            progressSpinner.style.display = 'none';
            progressSuccessIcon.style.display = 'inline-block';
            successFilename.textContent = data.filename;
            successActionContainer.style.display = 'block';
            reenableSingle();
        } else if (data.status === 'failed') {
            clearInterval(pollingInterval); pollingInterval = null;
            showSingleError(data.error || 'Error inesperado');
            reenableSingle();
        }
    }

    function showSingleError(msg) {
        progressSpinner.style.display = 'none';
        progressFailedIcon.style.display = 'inline-block';
        progressStatusTitle.textContent = 'Error en la descarga';
        statSpeed.textContent = '--'; statEta.textContent = 'Error';
        failedErrorMsg.textContent = msg;
        failedActionContainer.style.display = 'block';
    }

    function reenableSingle() {
        downloadBtn.disabled  = false;
        qualitySelect.disabled = false;
        fetchBtn.disabled     = false;
    }

    // ── Batch (playlist) download ────────────────────────────────────────────
    playlistDlBtn.addEventListener('click', async () => {
        const qualityId  = playlistQualitySelect.value;
        const checkedItems = [...playlistVideoList.querySelectorAll('.playlist-item')]
            .filter(item => item.querySelector('input').checked);

        if (!checkedItems.length || !qualityId) return;

        // Build request payload
        const items = checkedItems.map(item => {
            const idx = parseInt(item.dataset.index, 10);
            const v   = playlistVideos[idx];
            return { url: v.url, quality_id: qualityId, title: v.title };
        });

        // Disable controls
        playlistDlBtn.disabled = true;
        selectAllBtn.disabled  = true;
        selectNoneBtn.disabled = true;
        fetchBtn.disabled      = true;

        try {
            const res  = await fetch('/api/download/batch', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ items })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.detail || 'No se pudo iniciar la descarga');

            renderBatchProgress(data.downloads);
            pollBatchDownloads(data.downloads);
        } catch (err) {
            alert('Error al iniciar la descarga: ' + err.message);
            playlistDlBtn.disabled = false;
            selectAllBtn.disabled  = false;
            selectNoneBtn.disabled = false;
            fetchBtn.disabled      = false;
        }
    });

    function renderBatchProgress(downloads) {
        batchProgressSection.style.display = 'block';
        batchDoneActions.style.display     = 'none';
        batchOverallBar.style.width = '0%';
        batchOverallLabel.textContent = `0 / ${downloads.length} completados`;
        batchItemsList.innerHTML = '';

        downloads.forEach(dl => {
            const el = document.createElement('div');
            el.className  = 'batch-item';
            el.id         = `bi-${dl.download_id}`;
            el.innerHTML  = `
                <div class="batch-item-header">
                    <span class="batch-item-title" title="${escHtml(dl.title)}">${escHtml(dl.title)}</span>
                    <span class="batch-item-pct" id="bi-pct-${dl.download_id}">0%</span>
                </div>
                <div class="batch-item-bar-wrap">
                    <div class="batch-item-bar" id="bi-bar-${dl.download_id}"></div>
                </div>
                <div class="batch-item-status" id="bi-status-${dl.download_id}">Esperando...</div>
            `;
            batchItemsList.appendChild(el);
        });

        batchProgressSection.scrollIntoView({ behavior: 'smooth' });
    }

    function pollBatchDownloads(downloads) {
        if (batchPollingInterval) clearInterval(batchPollingInterval);

        batchPollingInterval = setInterval(async () => {
            let completed = 0;
            let allDone   = true;

            await Promise.all(downloads.map(async dl => {
                const el = document.getElementById(`bi-${dl.download_id}`);
                if (!el || el.dataset.done) { completed++; return; }

                try {
                    const res  = await fetch(`/api/download/status/${dl.download_id}`);
                    const data = await res.json();

                    const pctEl    = document.getElementById(`bi-pct-${dl.download_id}`);
                    const barEl    = document.getElementById(`bi-bar-${dl.download_id}`);
                    const statusEl = document.getElementById(`bi-status-${dl.download_id}`);

                    if (data.status === 'downloading') {
                        pctEl.textContent    = `${data.percent}%`;
                        barEl.style.width    = `${data.percent}%`;
                        statusEl.textContent = `${data.speed} · ${data.eta}`;
                        statusEl.className   = 'batch-item-status';
                        allDone = false;
                    } else if (data.status === 'processing') {
                        pctEl.textContent    = '100%';
                        barEl.style.width    = '100%';
                        statusEl.textContent = data.eta || 'Procesando...';
                        statusEl.className   = 'batch-item-status';
                        allDone = false;
                    } else if (data.status === 'completed') {
                        pctEl.textContent    = '100%';
                        barEl.style.width    = '100%';
                        statusEl.textContent = `✓ Completado · ${data.filename || ''}`;
                        statusEl.className   = 'batch-item-status done';
                        el.dataset.done      = '1';
                        completed++;
                    } else if (data.status === 'failed') {
                        pctEl.textContent    = 'Error';
                        statusEl.textContent = `✗ ${data.error || 'Fallo desconocido'}`;
                        statusEl.className   = 'batch-item-status error';
                        el.dataset.done      = '1';
                        completed++;
                    } else {
                        allDone = false; // starting
                    }
                } catch (_) { allDone = false; }
            }));

            // Overall bar
            const pct = Math.round((completed / downloads.length) * 100);
            batchOverallBar.style.width    = `${pct}%`;
            batchOverallLabel.textContent  = `${completed} / ${downloads.length} completados`;

            if (completed >= downloads.length) {
                clearInterval(batchPollingInterval);
                batchPollingInterval = null;
                batchDoneActions.style.display = 'block';
                // Re-enable controls
                fetchBtn.disabled      = false;
                playlistDlBtn.disabled = false;
                selectAllBtn.disabled  = false;
                selectNoneBtn.disabled = false;
                updateSelectionCount();
            }
        }, 1000);
    }

    // ── Open folder ──────────────────────────────────────────────────────────
    async function openFolder() {
        try {
            const res  = await fetch('/api/open-folder', { method: 'POST' });
            const data = await res.json();
            if (!data.success) alert('No se pudo abrir la carpeta: ' + (data.error || ''));
        } catch (_) { alert('Error de conexión al abrir la carpeta.'); }
    }

    globalOpenFolderBtn.addEventListener('click',   openFolder);
    openFolderBtnSuccess.addEventListener('click',  openFolder);
    batchOpenFolderBtn.addEventListener('click',    openFolder);

    // ── Settings modal ───────────────────────────────────────────────────────
    async function loadSettings() {
        try {
            const res  = await fetch('/api/settings');
            if (res.ok) {
                const data = await res.json();
                defaultModeSelect.value = data.default_mode;
            }
        } catch (_) {}
    }

    defaultModeSelect.addEventListener('change', async () => {
        try {
            const res = await fetch('/api/settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ default_mode: defaultModeSelect.value })
            });
            if (res.ok) {
                settingsStatus.style.display = 'flex';
                if (statusTimeout) clearTimeout(statusTimeout);
                statusTimeout = setTimeout(() => { settingsStatus.style.display = 'none'; }, 3000);
            }
        } catch (_) {}
    });

    settingsBtn.addEventListener('click', () => {
        settingsModal.classList.add('show');
        settingsModal.setAttribute('aria-hidden', 'false');
    });

    function closeSettings() {
        settingsModal.classList.remove('show');
        settingsModal.setAttribute('aria-hidden', 'true');
        settingsStatus.style.display = 'none';
    }

    closeSettingsBtn.addEventListener('click', closeSettings);
    window.addEventListener('click', e => { if (e.target === settingsModal) closeSettings(); });

    // Init
    loadSettings();
});
