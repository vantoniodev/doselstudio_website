    /* ---------------------------------------------------------------------
       Metadata JSON schema for ?meta=example.json
       {
         "title": "The Craftsmanship Essay",
         "author": "Virginia Woolf",
         "description": "EN -> PT-BR localization demo",
         "lang_from": "EN",
         "lang_to": "PT-BR",
         "duration": "4:32",
         "cover": "https://example.com/cover.jpg",
         "track_en": "https://example.com/original.wav",
         "track_pt": "https://example.com/dubbed.mp3",
         "subtitles_en": [{ "start": 0, "end": 4.2, "text": "Words belong to each other." }],
         "subtitles_pt": [{ "start": 0, "end": 4.2, "text": "As palavras pertencem umas as outras." }]
       }
    --------------------------------------------------------------------- */

    /* ---------------------------------------------------------------------
       Preload Constants
       Fill these URLs to auto-load files and skip the drop zones.
    --------------------------------------------------------------------- */
    const TARGET_LUFS = -21;
    const TARGET_VOL_DEFAULT = 1.0;
    const TARGET_VOL_MAX = 1.5;
    const KNOB_TICK_COUNT = 31;
    const KNOB_ARC_START = 135;
    const KNOB_ARC_TOTAL = 270;
    const KNOB_ARC_R = 38;
    const KNOB_TICK_RADIUS = 42;
    const KNOB_CX = 48;
    const KNOB_CY = 48;
    const APP_MODE = 'developer';

    /* ---------------------------------------------------------------------
       Subtitle Data
    --------------------------------------------------------------------- */
    let SUBTITLES = {
      en: [
        { start: 0.0, end: 3.6, text: 'We built the voice to feel close, calm, and human.' },
        { start: 3.7, end: 7.4, text: 'Every pause carries timing from the original performance.' },
        { start: 7.5, end: 11.2, text: 'The pipeline preserves intent while changing language.' },
        { start: 11.3, end: 15.5, text: 'Listen for rhythm, texture, and emotional continuity.' }
      ],
      pt: [
        { start: 0.0, end: 3.6, text: 'Criamos a voz para soar proxima, calma e humana.' },
        { start: 3.7, end: 7.4, text: 'Cada pausa mantem o tempo da interpretacao original.' },
        { start: 7.5, end: 11.2, text: 'O pipeline preserva a intencao ao mudar de idioma.' },
        { start: 11.3, end: 15.5, text: 'Perceba o ritmo, a textura e a continuidade emocional.' }
      ]
    };

    /* ---------------------------------------------------------------------
       Media Support
       HTML5 media support still depends on browser codecs. MKV, AVI, TS,
       WMA, and some MOV files may be accepted by extension but fail decode.
    --------------------------------------------------------------------- */
    const AUDIO_EXTENSIONS = new Set(['mp3', 'wav', 'ogg', 'flac', 'aac', 'm4a', 'opus', 'webm', 'aiff', 'wma']);
    const VIDEO_EXTENSIONS = new Set(['mp4', 'webm', 'mov', 'mkv', 'avi', 'ogv', 'm4v', '3gp', 'ts', 'mts']);
    const EXTENSION_MIME = {
      mp3: 'audio/mpeg',
      wav: 'audio/wav',
      ogg: 'audio/ogg',
      flac: 'audio/flac',
      aac: 'audio/aac',
      m4a: 'audio/mp4',
      opus: 'audio/opus',
      webm: 'video/webm',
      aiff: 'audio/aiff',
      wma: 'audio/x-ms-wma',
      mp4: 'video/mp4',
      mov: 'video/quicktime',
      mkv: 'video/x-matroska',
      avi: 'video/x-msvideo',
      ogv: 'video/ogg',
      m4v: 'video/x-m4v',
      '3gp': 'video/3gpp',
      ts: 'video/mp2t',
      mts: 'video/mp2t'
    };

    /* ---------------------------------------------------------------------
       DOM and State
    --------------------------------------------------------------------- */
    const stage = document.querySelector('#stage');
    const sharedVideo = document.querySelector('#sharedVideo');
    const sharedCanvas = document.querySelector('#sharedCanvas');
    const sharedWave = document.querySelector('#sharedWave');
    const sharedPlay = document.querySelector('#sharedPlay');
    const sharedScrubber = document.querySelector('#sharedScrubber');
    const sharedTimecode = document.querySelector('#sharedTimecode');
    const sharedDurationLabel = document.querySelector('#sharedDuration');
    const sharedCaption = document.querySelector('#sharedCaption');
    const fader = document.querySelector('[data-crossfader]');
    const faderShell = document.querySelector('[data-crossfader-shell]');
    const faderKnob = document.querySelector('[data-fader-knob]');
    const faderLabelEn = document.querySelector('.fader-labels span:first-child');
    const faderLabelPt = document.querySelector('.fader-labels span:nth-child(2)');
    let faderHint = document.querySelector('#faderHint');
    const stageFader = document.querySelector('[data-stage-crossfader]');
    const stageFaderKnob = document.querySelector('[data-stage-crossfader-knob]');
    const developerMode = isDeveloperMode();
    document.body.classList.toggle('is-developer-mode', developerMode);
    document.body.classList.toggle('is-public-mode', !developerMode);
    const volumeKnobSvg = document.querySelector('#volumeKnobSvg');
    const knobTicks = document.querySelector('#knobTicks');
    const knobArcTrack = document.querySelector('#knobArcTrack');
    const knobArcFill = document.querySelector('#knobArcFill');
    const knobIndicator = document.querySelector('#knobIndicator');
    const volumeKnobDb = document.querySelector('#volumeKnobDb');
    const volumeKnobWrap = document.querySelector('#volumeKnobWrap');
    const volumePopup = document.querySelector('#volumePopup');
    const volumePopupTrack = document.querySelector('#volumePopupTrack');
    const volumePopupFill = document.querySelector('#volumePopupFill');
    const volumePopupThumb = document.querySelector('#volumePopupThumb');
    const volumePopupDb = document.querySelector('#volumePopupDb');
    const waveLabelEn = document.querySelector('.wave-label--en');
    const waveLabelPt = document.querySelector('.wave-label--ptbr');
    const syncInput = document.querySelector('[data-sync]');
    const ccButton = document.querySelector('[data-cc]');
    const contentCard = document.querySelector('#contentCard');
    const contentCardTab = document.querySelector('#contentCardTab');
    const contentCardImg = document.querySelector('#contentCardImg');
    const contentCardTitle = document.querySelector('#contentCardTitle');
    const contentCardAuthor = document.querySelector('#contentCardAuthor');
    const contentCardSource = document.querySelector('#contentCardSource');
    const contentCardDesc = document.querySelector('#contentCardDesc');
    const contentCardLang = document.querySelector('#contentCardLang');
    const contentCardDuration = document.querySelector('#contentCardDuration');
    const contentCardFileInput = document.querySelector('#contentCardFileInput');
    const coverLoadLabel = document.querySelector('#coverLoadLabel');
    const metaFileInput = document.querySelector('#metaFileInput');
    const catalogGrid = document.querySelector('#catalogGrid');
    const catalogCount = document.querySelector('#catalogCount');
    const canvasCtx = sharedCanvas.getContext('2d');
    const hiddenMedia = {
      audioA: new Audio(),
      audioB: new Audio(),
      videoB: document.createElement('video')
    };

    Object.values(hiddenMedia).forEach((media) => {
      media.preload = 'metadata';
      media.playsInline = true;
      media.style.display = 'none';
      document.body.appendChild(media);
    });

    const audioRuntime = {
      ctx: null,
      masterGain: null,
      ensure() {
        if (!this.ctx) {
          this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (this.ctx.state === 'suspended') {
          this.ctx.resume();
        }
        return this.ctx;
      },
      master() {
        const ctx = this.ensure();
        if (!this.masterGain) {
          this.masterGain = ctx.createGain();
          this.masterGain.gain.value = state.volumeValue;
          this.masterGain.connect(ctx.destination);
        }
        return this.masterGain;
      },
      setMaster(value) {
        const ctx = this.ensure();
        const node = this.master();
        node.gain.cancelScheduledValues(ctx.currentTime);
        node.gain.setTargetAtTime(value, ctx.currentTime, 0.018);
      },
      async resume() {
        const ctx = this.ensure();
        if (ctx.state === 'suspended') {
          await ctx.resume();
        }
        return ctx;
      }
    };

    const state = {
      tracks: {},
      isPlaying: false,
      captions: false,
      sync: true,
      fader: 50,
      faderDragging: false,
      stageFaderDragging: false,
      stageFaderInteracted: false,
      volumeValue: TARGET_VOL_DEFAULT,
      volumeDragging: false,
      volumePopupOpen: false,
      volumePopupDragging: false,
      volumePopupCloseTimer: null,
      volumeStartY: 0,
      volumeStartValue: TARGET_VOL_DEFAULT,
      lastDraw: 0,
      raf: null,
      inviteReady: { en: false, pt: false },
      inviteAnim: null,
      inviteStarted: false,
      inviteCancelled: false,
      inviteTimer: null,
      contentCardObjectUrl: null,
      coverStatusTimer: null,
      catalog: null,
      activeDemoId: '',
      trackLabels: {
        en: 'ORIGINAL · EN',
        pt: 'LOCALIZED · PT-BR'
      },
      audioProcessing: null,
      meta: {
        title: '—',
        author: '',
        description: '',
        langFrom: 'EN',
        langTo: 'PT-BR',
        duration: '',
        year: '',
        source: ''
      }
    };

    class Track {
      constructor(key, loader) {
        this.key = key;
        this.loader = loader;
        this.dropZone = loader.querySelector('[data-drop-zone]');
        this.input = loader.querySelector('[data-input]');
        this.browse = loader.querySelector('[data-browse]');
        this.replace = loader.querySelector('[data-replace]');
        this.formatBadge = loader.querySelector('[data-format]');
        this.badgeText = loader.querySelector('[data-badge-text]');
        this.warning = loader.querySelector('[data-warning]');
        this.audio = key === 'en' ? hiddenMedia.audioA : hiddenMedia.audioB;
        this.video = key === 'en' ? sharedVideo : hiddenMedia.videoB;
        this.media = this.audio;
        this.sources = new Map();
        this.connectedSource = null;
        this.analyser = null;
        this.gain = null;
        this.data = null;
        this.objectUrl = null;
        this.loadTimer = null;
        this.displayTitle = '—';
        this.formatLabel = 'EMPTY';
        this.isVideo = false;
        this.isLoaded = false;
        this.isLoading = false;
        this.loadId = 0;
        this.normGain = 1;
        this.measuredLUFS = null;
        this.offlineMastered = false;
        this.masteredLabel = '';
        this.normalizationState = 'idle';
        this.normalizationPromise = Promise.resolve();
        this.realtimeNormalizationStarted = false;
        this.idleShape = makeSpeechShape(160, key === 'en' ? 11 : 29);
        this.lastFrame = this.idleShape.slice();
        this.energy = 0;
        this.bindEvents();
      }

      bindEvents() {
        this.browse.addEventListener('click', () => this.input.click());
        this.replace?.addEventListener('click', (event) => {
          event.stopPropagation();
          this.input.value = '';
          this.input.click();
        });
        this.input.addEventListener('change', () => {
          const [file] = this.input.files;
          if (file) this.loadFile(file);
        });

        [this.dropZone, this.loader].forEach((target) => {
          ['dragenter', 'dragover'].forEach((eventName) => {
            target.addEventListener(eventName, (event) => {
              event.preventDefault();
              event.stopPropagation();
              this.dropZone.classList.add('dragover');
              this.loader.classList.add('is-dragover');
            });
          });

          ['dragleave', 'drop'].forEach((eventName) => {
            target.addEventListener(eventName, (event) => {
              event.preventDefault();
              event.stopPropagation();
              this.dropZone.classList.remove('dragover');
              this.loader.classList.remove('is-dragover');
            });
          });

          target.addEventListener('drop', (event) => {
            event.preventDefault();
            event.stopPropagation();
            this.dropZone.classList.remove('dragover');
            this.loader.classList.remove('is-dragover');
            const [file] = event.dataTransfer.files;
            if (file) this.loadFile(file);
          });
        });

        [this.audio, this.video].forEach((media) => {
          media.addEventListener('loadedmetadata', () => this.onMetadata());
          media.addEventListener('durationchange', () => this.onMetadata());
          media.addEventListener('error', () => this.handleMediaError(media));
          ['loadedmetadata', 'canplay', 'playing'].forEach((eventName) => {
            media.addEventListener(eventName, () => this.checkPlayableAudio());
          });
          ['loadedmetadata', 'canplay', 'canplaythrough', 'loadeddata', 'error'].forEach((eventName) => {
            media.addEventListener(eventName, () => this.clearLoadTimer());
          });
          media.addEventListener('canplaythrough', () => onInviteTrackReady(this.key));
          ['waiting', 'stalled', 'seeking'].forEach((eventName) => media.addEventListener(eventName, () => setStageLoading(true)));
          ['canplay', 'canplaythrough', 'playing', 'seeked', 'loadeddata'].forEach((eventName) => media.addEventListener(eventName, () => setStageLoading(false)));
          ['ended', 'pause', 'play'].forEach((eventName) => media.addEventListener(eventName, updatePlaybackState));
        });
      }

      loadFile(file) {
        const ext = extensionFromName(file.name);
        const mime = file.type || EXTENSION_MIME[ext] || '';
        const isVideo = file.type.startsWith('video/') || (VIDEO_EXTENSIONS.has(ext) && !(ext === 'webm' && file.type.startsWith('audio/')));
        const url = URL.createObjectURL(file);
        this.loadSource(url, {
          ext,
          mime,
          title: titleFromName(file.name),
          isVideo,
          objectUrl: url,
          support: supportFor(isVideo, mime)
        });
      }

      loadUrl(url, options = {}) {
        const ext = extensionFromName(url.split('?')[0]);
        const mime = EXTENSION_MIME[ext] || '';
        const isVideo = VIDEO_EXTENSIONS.has(ext) && !(AUDIO_EXTENSIONS.has(ext) && ext !== 'webm');
        this.loadSource(url, {
          ext,
          mime,
          title: titleFromName(url),
          isVideo,
          objectUrl: null,
          support: supportFor(isVideo, mime),
          offlineMastered: Boolean(options.offlineMastered),
          masteredLabel: options.masteredLabel || ''
        });
      }

      loadSource(url, meta) {
        const loadId = this.loadId + 1;
        this.loadId = loadId;
        this.pause();
        this.clearWarning();
        setStageLoading(true);
        if (this.objectUrl) URL.revokeObjectURL(this.objectUrl);
        this.objectUrl = meta.objectUrl;
        this.displayTitle = meta.title || '—';
        this.isVideo = meta.isVideo;
        this.media = this.isVideo ? this.video : this.audio;
        this.media.muted = false;
        this.media.volume = 1;
        this.isLoaded = true;
        this.loader.classList.add('is-loaded');
        this.formatLabel = `${(meta.ext || mediaKind(meta.mime) || 'media').toUpperCase()} · loading`;
        this.normGain = 1;
        this.measuredLUFS = null;
        this.offlineMastered = Boolean(meta.offlineMastered);
        this.masteredLabel = meta.masteredLabel || '';
        this.normalizationState = this.offlineMastered ? 'mastered' : 'normalizing';
        this.normalizationPromise = this.offlineMastered ? Promise.resolve() : this.normalizeFromUrl(url, loadId);
        this.realtimeNormalizationStarted = false;
        this.formatBadge.textContent = this.formatLabel;
        this.updateBadge();

        if (!meta.support && meta.mime) {
          this.showWarning('browser support looks limited for this media. for video, convert to web mp4: h.264 video + aac audio. for audio, use wav, mp3, aac, opus, or m4a.');
        }

        const inactive = this.isVideo ? this.audio : this.video;
        inactive.removeAttribute('src');
        inactive.load();
        configureMediaCors(this.media, shouldUseCors(url, meta.objectUrl) ? 'anonymous' : '');
        this.media.src = url;
        this.media.load();
        this.startLoadTimer(meta.title || url);

        if (this.key === 'en') {
          stage.classList.toggle('has-video', this.isVideo);
          if (!this.isVideo) {
            sharedVideo.removeAttribute('src');
            sharedVideo.load();
          }
        }

        this.attachAudioGraph();
        updateStageReady();
        applyMetaToCard({ title: state.meta.title === '—' ? this.displayTitle : state.meta.title });
      }

      resetSource() {
        this.loadId += 1;
        this.pause();
        this.clearLoadTimer();
        this.clearWarning();
        if (this.objectUrl) URL.revokeObjectURL(this.objectUrl);
        this.objectUrl = null;
        this.displayTitle = '—';
        this.formatLabel = 'EMPTY';
        this.isVideo = false;
        this.isLoaded = false;
        this.isLoading = false;
        this.normGain = 1;
        this.measuredLUFS = null;
        this.offlineMastered = false;
        this.masteredLabel = '';
        this.normalizationState = 'idle';
        this.normalizationPromise = Promise.resolve();
        this.realtimeNormalizationStarted = false;
        this.energy = 0;
        this.lastFrame = this.idleShape.slice();
        [this.audio, this.video].forEach((media) => {
          media.pause();
          media.removeAttribute('src');
          media.load();
        });
        if (this.connectedSource) {
          try {
            this.connectedSource.disconnect();
          } catch (error) {
            console.warn('track source disconnect failed', error);
          }
        }
        this.connectedSource = null;
        if (this.gain) this.gain.gain.value = 0;
        this.loader.classList.remove('is-loaded', 'is-dragover');
        this.dropZone.classList.remove('dragover');
        this.formatBadge.textContent = '';
        this.updateBadge();
      }

      startLoadTimer(label) {
        this.clearLoadTimer();
        this.loadTimer = window.setTimeout(() => {
          if (!this.isLoaded || this.media.readyState > 0) return;
          this.showWarning(`still trying to load ${label}. If this came from the project folder, confirm the file path or convert it to web mp4: h.264 video + aac audio.`);
          setStageLoading(false);
        }, 4500);
      }

      clearLoadTimer() {
        if (!this.loadTimer) return;
        window.clearTimeout(this.loadTimer);
        this.loadTimer = null;
      }

      attachAudioGraph() {
        const ctx = audioRuntime.ensure();
        if (!this.analyser) {
          this.analyser = ctx.createAnalyser();
          this.analyser.fftSize = 512;
          this.analyser.smoothingTimeConstant = 0.78;
          this.gain = ctx.createGain();
          this.gain.gain.value = 0;
          this.data = new Uint8Array(this.analyser.frequencyBinCount);
          this.analyser.connect(this.gain);
          this.gain.connect(audioRuntime.master());
        }

        const media = this.media;
        if (!this.sources.has(media)) {
          this.sources.set(media, ctx.createMediaElementSource(media));
        }

        const nextSource = this.sources.get(media);
        if (this.connectedSource !== nextSource) {
          if (this.connectedSource) this.connectedSource.disconnect();
          nextSource.connect(this.analyser);
          this.connectedSource = nextSource;
        }
      }

      async normalizeFromUrl(url, loadId) {
        this.normalizationState = 'normalizing';
        this.updateBadge();

        try {
          const buffer = await tryDecodeForLUFS(url);
          if (loadId !== this.loadId) return;

          if (!buffer) {
            this.normGain = 1;
            this.measuredLUFS = null;
            this.normalizationState = 'realtime-pending';
            this.updateBadge();
            updateStageReady();
            applyCrossfade();
            return;
          }

          const result = await measureAndNormalize(buffer);
          if (loadId !== this.loadId) return;

          this.normGain = result.gain;
          this.measuredLUFS = result.measuredLUFS;
          this.normalizationState = result.skipped ? 'manual' : 'done';
        } catch (error) {
          if (loadId !== this.loadId) return;
          console.warn('normalization failed', error);
          this.normGain = 1;
          this.measuredLUFS = null;
          this.normalizationState = 'realtime-pending';
        }

        this.updateBadge();
        updateStageReady();
        applyCrossfade();
      }

      startRealtimeNormalizationIfNeeded() {
        if (this.realtimeNormalizationStarted || this.normalizationState !== 'realtime-pending') return;
        const source = this.sources.get(this.media);
        if (!source || !this.gain) {
          this.normalizationState = 'manual';
          this.updateBadge();
          return;
        }

        const loadId = this.loadId;
        this.realtimeNormalizationStarted = true;
        this.normalizationState = 'realtime-measuring';
        this.updateBadge();

        measureLUFSRealtime(audioRuntime.ensure(), source, (normGain, measuredLUFS) => {
          if (loadId !== this.loadId) return;

          if (!Number.isFinite(normGain) || !Number.isFinite(measuredLUFS)) {
            this.normGain = 1;
            this.measuredLUFS = null;
            this.normalizationState = 'manual';
            this.updateBadge();
            applyCrossfade();
            return;
          }

          this.normGain = normGain;
          this.measuredLUFS = measuredLUFS;
          this.normalizationState = 'done';
          this.updateBadge();
          this.rampGainToCurrentTarget(0.5);
        });
      }

      rampGainToCurrentTarget(duration) {
        if (!this.gain) return;
        const baseGain = this.key === 'en' ? effectiveGainForEn() : effectiveGainForPt();
        const target = baseGain * this.normGain;
        const ctx = audioRuntime.ensure();
        this.gain.gain.cancelScheduledValues(ctx.currentTime);
        this.gain.gain.setValueAtTime(this.gain.gain.value, ctx.currentTime);
        this.gain.gain.linearRampToValueAtTime(target, ctx.currentTime + duration);
      }

      setGain(value) {
        if (!this.gain) return;
        const ctx = audioRuntime.ensure();
        const next = value * this.normGain;
        this.gain.gain.cancelScheduledValues(ctx.currentTime);
        this.gain.gain.setTargetAtTime(next, ctx.currentTime, 0.018);
      }

      async play() {
        if (!this.isLoaded) return Promise.resolve();
        this.normalizationPromise.catch(() => {});
        this.attachAudioGraph();
        this.media.muted = false;
        this.media.volume = 1;
        await this.media.play();
        this.startRealtimeNormalizationIfNeeded();
      }

      pause() {
        if (this.isLoaded) this.media.pause();
      }

      seek(time) {
        if (!this.isLoaded || !Number.isFinite(time)) return;
        const duration = Number.isFinite(this.media.duration) ? this.media.duration : time;
        this.media.currentTime = Math.max(0, Math.min(time, duration));
      }

      onMetadata() {
        if (!this.isLoaded) return;
        const duration = this.media.duration;
        const ext = extensionFromSrc(this.media.currentSrc || this.media.src);
        if (this.isVideo) {
          const width = this.video.videoWidth;
          const height = this.video.videoHeight;
          this.formatLabel = width && height ? `${ext.toUpperCase()} · ${width}x${height}` : `${ext.toUpperCase()} · video`;
        } else {
          this.formatLabel = `${ext.toUpperCase()} · ${Number.isFinite(duration) ? formatDurationShort(duration) : 'audio'}`;
        }
        this.formatBadge.textContent = this.formatLabel;
        this.updateBadge();
        this.checkPlayableAudio();
        updateTransportUi();
      }

      updateBadge() {
        const label = this.key === 'en' ? state.trackLabels.en : state.trackLabels.pt;
        if (!developerMode) {
          this.badgeText.textContent = label;
          return;
        }
        this.badgeText.innerHTML = `${escapeHtml(label)} · <span class="badge-format">${escapeHtml(this.formatLabel)}</span>${this.normalizationBadgeHtml()}`;
      }

      normalizationBadgeHtml() {
        if (this.normalizationState === 'normalizing') {
          return ' · <span class="badge-lufs"><span class="badge-lufs-spinner" aria-hidden="true"></span><span class="badge-lufs-text">normalizing...</span></span>';
        }

        if (this.normalizationState === 'realtime-pending' || this.normalizationState === 'realtime-measuring') {
          return ' · <span class="badge-lufs"><span class="badge-lufs-spinner" aria-hidden="true"></span><span class="badge-lufs-text">medindo ao vivo...</span></span>';
        }

        if (this.normalizationState === 'done' && Number.isFinite(this.measuredLUFS)) {
          return ` · <span class="badge-lufs"><span class="badge-lufs-text">${formatLUFS(this.measuredLUFS)} → ${formatLUFS(TARGET_LUFS)} LUFS</span><span class="badge-lufs-done">✓</span></span>`;
        }

        if (this.normalizationState === 'manual') {
          return ' · <span class="badge-lufs"><span class="badge-lufs-text">LUFS: ref manual</span></span>';
        }

        if (this.normalizationState === 'mastered') {
          const label = this.masteredLabel || 'MASTERED · -10 LUFS / -1.0 dBTP';
          return ` · <span class="badge-lufs"><span class="badge-lufs-done">✓</span><span class="badge-lufs-text">${escapeHtml(label)}</span></span>`;
        }

        return '';
      }

      showWarning(message) {
        this.warning.textContent = message;
        this.warning.classList.add('visible');
      }

      clearWarning() {
        this.warning.textContent = '';
        this.warning.classList.remove('visible');
      }

      handleMediaError(media) {
        if (media !== this.media) return;

        const code = media.error?.code;
        const detail = code ? ` media error ${code}.` : '';
        if (this.isVideo) {
          this.showWarning(`this video container or codec is not browser-safe.${detail} convert it to web mp4: h.264 video + aac audio, then replace this track.`);
          return;
        }

        this.showWarning(`this audio could not be decoded by the browser.${detail} try another codec or container.`);
      }

      checkPlayableAudio() {
        if (!this.isLoaded || !this.isVideo) return;
        const status = playableAudioStatus(this.media);
        if (status === false) {
          this.showWarning('video loaded, but the audio codec is not browser-playable. vlc may support ac3/dts/pcm, but browsers need aac/mp3/opus. convert to small web mp4: h.264 + aac, then replace this track.');
        }
      }
    }

    document.querySelectorAll('.track-loader').forEach((loader) => {
      state.tracks[loader.dataset.track] = new Track(loader.dataset.track, loader);
    });

    fader.addEventListener('pointerdown', startFaderDrag);
    fader.addEventListener('pointermove', dragFader);
    fader.addEventListener('pointerup', endFaderDrag);
    fader.addEventListener('pointercancel', endFaderDrag);
    fader.addEventListener('keydown', handleFaderKey);
    fader.addEventListener('dblclick', () => animateFader(50, 320));
    initStageCrossfader();
    volumeKnobSvg.addEventListener('pointerdown', startVolumeDrag);
    window.addEventListener('pointermove', dragVolume);
    window.addEventListener('pointerup', endVolumeDrag);
    window.addEventListener('pointercancel', endVolumeDrag);
    volumeKnobSvg.addEventListener('dblclick', () => animateVolume(TARGET_VOL_DEFAULT, 220));
    volumeKnobSvg.addEventListener('wheel', handleVolumeWheel, { passive: false });
    sharedPlay.addEventListener('click', togglePlayback);
    sharedScrubber.addEventListener('input', scrubShared);
    syncInput.addEventListener('change', () => {
      state.sync = syncInput.checked;
    });
    ccButton.addEventListener('click', () => setCaptions(!state.captions));
    contentCardFileInput?.addEventListener('change', async () => {
      const [file] = contentCardFileInput.files;
      if (!file) return;
      if (state.contentCardObjectUrl) URL.revokeObjectURL(state.contentCardObjectUrl);
      state.contentCardObjectUrl = URL.createObjectURL(file);
      contentCardImg.onload = () => contentCard.classList.add('has-image');
      contentCardImg.src = state.contentCardObjectUrl;

      if (!isDeveloperMode() || !state.activeDemoId) return;

      setCoverSaveStatus('saving cover...', 'saving');
      try {
        const result = await persistDeveloperCover(file);
        const bustedCover = `${result.cover}?v=${Date.now()}`;
        loadCoverFromUrl(bustedCover);
        updateCatalogCover(state.activeDemoId, bustedCover);
        setCoverSaveStatus('cover saved', 'success');
      } catch (error) {
        console.warn('cover save failed', error);
        setCoverSaveStatus('not saved', 'error', error.message || 'cover was not persisted');
      }
    });

    metaFileInput?.addEventListener('change', () => {
      const [file] = metaFileInput.files;
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          loadDemo(JSON.parse(event.target.result));
        } catch (error) {
          console.warn('invalid json metadata', error);
        }
      };
      reader.readAsText(file);
    });

    document.addEventListener('keydown', (event) => {
      const target = event.target;
      const isTyping = (target instanceof HTMLInputElement && target.type !== 'range' && target.type !== 'checkbox') || target instanceof HTMLTextAreaElement;
      const hasInputFocus = target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement || target instanceof HTMLSelectElement || target instanceof HTMLButtonElement || target?.isContentEditable;
      if (isTyping) return;

      if (event.code === 'Space') {
        event.preventDefault();
        togglePlayback();
      }

      if (event.key === 'Tab') {
        event.preventDefault();
        animateFader(state.fader < 50 ? 100 : 0, 300);
      }

      if (event.key.toLowerCase() === 'c') {
        setCaptions(!state.captions);
      }

      if (!hasInputFocus && event.key === 'ArrowUp') {
        event.preventDefault();
        setVolume(state.volumeValue + 0.05);
      }

      if (!hasInputFocus && event.key === 'ArrowDown') {
        event.preventDefault();
        setVolume(state.volumeValue - 0.05);
      }
    });

    window.addEventListener('resize', () => drawSharedWave());
    sharedVideo.addEventListener('loadedmetadata', updateContentCardDurationFromVideo);

    splitHeroTitle();
    rotateTagline();
    applyMetaToCard({});
    setFader(50, false);
    setupVolumeKnob();
    setVolume(TARGET_VOL_DEFAULT, false);
    initMobileVolumePopup();
    initCardDrawer();
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initializeFromConfig);
    } else {
      initializeFromConfig();
    }
    loop();

    /* ---------------------------------------------------------------------
       Mobile Content Drawer
    --------------------------------------------------------------------- */
    function initCardDrawer() {
      if (!contentCard || !contentCardTab) return;

      const overlay = document.createElement('div');
      overlay.className = 'card-overlay';
      overlay.setAttribute('aria-hidden', 'true');
      document.body.appendChild(overlay);

      let touchStartX = 0;
      let touchStartY = 0;
      let trackingSwipe = false;
      const isMobile = () => window.matchMedia('(max-width: 768px)').matches;

      const closeDrawer = () => {
        contentCard.classList.remove('drawer-open');
        overlay.classList.remove('visible');
        overlay.setAttribute('aria-hidden', 'true');
        contentCardTab.setAttribute('aria-expanded', 'false');
      };

      const openDrawer = () => {
        if (!isMobile()) return;
        contentCard.classList.add('drawer-open', 'was-opened');
        overlay.classList.add('visible');
        overlay.setAttribute('aria-hidden', 'false');
        contentCardTab.setAttribute('aria-expanded', 'true');
      };

      const toggleDrawer = (event) => {
        event?.preventDefault();
        if (contentCard.classList.contains('drawer-open')) {
          closeDrawer();
        } else {
          openDrawer();
        }
      };

      contentCardTab.addEventListener('click', toggleDrawer);
      overlay.addEventListener('click', closeDrawer);

      document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && isMobile()) closeDrawer();
      });

      contentCard.addEventListener('touchstart', (event) => {
        if (!isMobile() || !contentCard.classList.contains('drawer-open')) return;
        const [touch] = event.touches;
        touchStartX = touch.clientX;
        touchStartY = touch.clientY;
        trackingSwipe = true;
      }, { passive: true });

      contentCard.addEventListener('touchend', (event) => {
        if (!trackingSwipe) return;
        const [touch] = event.changedTouches;
        const deltaX = touch.clientX - touchStartX;
        const deltaY = Math.abs(touch.clientY - touchStartY);
        if (deltaX > 48 && deltaY < 40) closeDrawer();
        trackingSwipe = false;
      }, { passive: true });

      window.addEventListener('resize', () => {
        if (!isMobile()) closeDrawer();
      });
    }

    /* ---------------------------------------------------------------------
       Metadata
    --------------------------------------------------------------------- */
    async function initializeFromConfig() {
      const metaUrl = new URLSearchParams(location.search).get('meta');

      if (metaUrl) {
        loadMeta(metaUrl);
        return;
      }

      await loadCatalogDemo();
    }

    async function loadCatalogDemo(nextDemoId) {
      if (!window.DoselCatalog) {
        console.warn('catalog helpers are not available');
        return;
      }

      try {
        const catalog = state.catalog || await window.DoselCatalog.fetchJson(window.DoselCatalog.CATALOG_URL);
        state.catalog = catalog;
        const requestedId = nextDemoId || window.DoselCatalog.selectedDemoId(catalog);
        const item = window.DoselCatalog.itemById(catalog, requestedId) || window.DoselCatalog.itemById(catalog, catalog.featured);

        if (!item?.metadata) {
          throw new Error(`demo not found in catalog: ${requestedId}`);
        }

        state.activeDemoId = item.id;
        const demo = await window.DoselCatalog.fetchJson(item.metadata);
        loadDemo(window.DoselCatalog.toLegacyMeta(demo));
        renderCatalog(catalog, item.id);
        updateDemoUrl(item.id);
      } catch (error) {
        console.warn('catalog demo load failed', error);
        setStageLoading(false);
      }
    }

    function renderCatalog(catalog, activeId) {
      if (!catalogGrid) return;
      const items = catalog.items || [];
      if (catalogCount) {
        catalogCount.textContent = `${items.length} ${items.length === 1 ? 'demo' : 'demos'}`;
      }
      catalogGrid.innerHTML = items.map((item) => catalogCardHtml(item, item.id === activeId)).join('');
      catalogGrid.querySelectorAll('[data-demo-id]').forEach((button) => {
        button.addEventListener('click', () => loadCatalogDemo(button.dataset.demoId));
      });
    }

    function catalogCardHtml(item, active) {
      const detail = [item.languages, item.duration].filter(Boolean).join(' · ');
      return `
        <button class="catalog-card${active ? ' is-active' : ''}" type="button" data-demo-id="${escapeHtml(item.id)}" aria-pressed="${active ? 'true' : 'false'}">
          <span class="catalog-thumb">${item.cover ? `<img src="${escapeHtml(item.cover)}" alt="">` : ''}</span>
          <span class="catalog-meta">
            <span class="catalog-title">${escapeHtml(item.title || 'Untitled')}</span>
            <span class="catalog-author">${escapeHtml(item.author || '')}</span>
            <span class="catalog-detail">${escapeHtml(detail || 'available')}</span>
          </span>
        </button>
      `;
    }

    function updateDemoUrl(id) {
      const url = new URL(window.location.href);
      if (url.searchParams.get('demo') === id) return;
      url.searchParams.set('demo', id);
      window.history.replaceState({}, '', url);
    }

    function isDeveloperMode() {
      return new URLSearchParams(window.location.search).get('mode') === 'developer';
    }

    function initStageCrossfader() {
      if (!stageFader) return;

      if (developerMode) {
        stageFader.tabIndex = -1;
        stageFader.setAttribute('aria-hidden', 'true');
        return;
      }

      stageFader.addEventListener('pointerdown', startStageFaderDrag);
      stageFader.addEventListener('pointermove', dragStageFader);
      stageFader.addEventListener('pointerup', endStageFaderDrag);
      stageFader.addEventListener('pointercancel', endStageFaderDrag);
      stageFader.addEventListener('keydown', handleFaderKey);
      stageFader.addEventListener('dblclick', () => {
        markStageFaderInteracted();
        animateFader(50, 320);
      });
    }

    async function persistDeveloperCover(file) {
      const form = new FormData();
      form.append('demo_id', state.activeDemoId);
      form.append('file', file, file.name || 'cover');

      const response = await fetch('/api/demo-cover', {
        method: 'POST',
        body: form
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(payload.error || `cover save failed (${response.status})`);
      }
      return payload;
    }

    function updateCatalogCover(demoId, coverUrl) {
      const item = state.catalog?.items?.find((entry) => entry.id === demoId);
      if (item) item.cover = coverUrl;
      catalogGrid?.querySelectorAll('[data-demo-id]').forEach((button) => {
        if (button.dataset.demoId !== demoId) return;
        const img = button.querySelector('.catalog-thumb img');
        if (img) img.src = coverUrl;
      });
    }

    function setCoverSaveStatus(message, tone = 'idle', title = '') {
      if (!coverLoadLabel) return;
      const textNode = Array.from(coverLoadLabel.childNodes).find((node) => node.nodeType === Node.TEXT_NODE && node.textContent.trim());
      if (!coverLoadLabel.dataset.defaultText) {
        coverLoadLabel.dataset.defaultText = textNode?.textContent.trim() || '⊕ set cover';
      }
      if (state.coverStatusTimer) window.clearTimeout(state.coverStatusTimer);
      if (textNode) textNode.textContent = ` ${message} `;
      coverLoadLabel.dataset.coverStatus = tone;
      coverLoadLabel.title = title || message;
      if (tone === 'saving') return;
      state.coverStatusTimer = window.setTimeout(() => {
        if (textNode) textNode.textContent = ` ${coverLoadLabel.dataset.defaultText} `;
        delete coverLoadLabel.dataset.coverStatus;
        coverLoadLabel.title = 'Set cover image';
      }, 2400);
    }

    function loadTrackFromUrl(key, url) {
      if (!url || !state.tracks[key]) return;
      state.tracks[key].loadUrl(url);
    }

    function loadCoverFromUrl(url) {
      if (!url) return;
      contentCardImg.onload = () => contentCard.classList.add('has-image');
      contentCardImg.onerror = () => console.warn('Cover not found:', url);
      contentCardImg.src = url;
    }

    async function loadMeta(url) {
      try {
        const res = await fetch(url);
        const data = await res.json();
        loadDemo(data);
      } catch (error) {
        console.warn('meta load failed', error);
      }
    }

    function loadDemo(data) {
      resetDemoState();
      applyMeta(data);
    }

    function resetDemoState() {
      pauseAll();
      cancelInviteAnimation();
      Object.values(state.tracks).forEach((track) => track.resetSource());
      state.inviteReady = { en: false, pt: false };
      state.inviteStarted = false;
      state.inviteCancelled = false;
      state.stageFaderInteracted = false;
      updateStageFaderState();
      state.audioProcessing = null;
      state.trackLabels = {
        en: 'ORIGINAL · EN',
        pt: 'LOCALIZED · PT-BR'
      };
      state.meta = {
        title: '—',
        author: '',
        description: '',
        langFrom: 'EN',
        langTo: 'PT-BR',
        duration: '',
        year: '',
        source: ''
      };
      SUBTITLES = { en: [], pt: [] };
      setCaptions(false);
      setFader(50, false);
      setStageLoading(false);
      stage.classList.remove('has-video', 'has-media', 'loaded', 'normalizing');
      sharedVideo.removeAttribute('src');
      sharedVideo.load();
      sharedScrubber.value = '0';
      sharedScrubber.style.setProperty('--progress', '0%');
      sharedTimecode.textContent = '0:00';
      sharedDurationLabel.textContent = '—:——';
      if (state.contentCardObjectUrl) URL.revokeObjectURL(state.contentCardObjectUrl);
      state.contentCardObjectUrl = null;
      contentCardImg.onload = null;
      contentCardImg.onerror = null;
      contentCardImg.removeAttribute('src');
      contentCard.classList.remove('has-image', 'meta-loaded');
      applyMetaToCard({});
      updateStageReady();
      drawSharedWave();
    }

    function applyMeta(data) {
      if (Object.prototype.hasOwnProperty.call(data, 'subtitles_en')) {
        SUBTITLES.en = Array.isArray(data.subtitles_en) ? data.subtitles_en : [];
      }
      if (Object.prototype.hasOwnProperty.call(data, 'subtitles_pt')) {
        SUBTITLES.pt = Array.isArray(data.subtitles_pt) ? data.subtitles_pt : [];
      }
      if (data.track_labels) {
        state.trackLabels.en = data.track_labels.en || state.trackLabels.en;
        state.trackLabels.pt = data.track_labels.pt || state.trackLabels.pt;
        updateTrackLabels();
      }
      state.audioProcessing = data.audio_processing || null;
      applyMetaToCard(data);
      contentCard.classList.add('meta-loaded');
      const offlineMastered = state.audioProcessing?.normalized_offline === true;
      const masteredLabel = masteredBadgeLabel(state.audioProcessing);
      if (data.track_en) state.tracks.en.loadUrl(data.track_en, { offlineMastered, masteredLabel });
      if (data.track_pt) state.tracks.pt.loadUrl(data.track_pt, { offlineMastered, masteredLabel });
    }

    function applyMetaToCard(data) {
      state.meta = {
        ...state.meta,
        title: valueOrCurrent(data, 'title', state.meta.title),
        author: valueOrCurrent(data, 'author', state.meta.author),
        description: valueOrCurrent(data, 'description', state.meta.description),
        langFrom: valueOrCurrent(data, 'lang_from', state.meta.langFrom),
        langTo: valueOrCurrent(data, 'lang_to', state.meta.langTo),
        duration: valueOrCurrent(data, 'duration', state.meta.duration),
        year: valueOrCurrent(data, 'year', state.meta.year),
        source: valueOrCurrent(data, 'source', state.meta.source)
      };

      contentCardTitle.textContent = truncateTitle(state.meta.title || '—', 28);
      contentCardAuthor.textContent = state.meta.author || '';
      contentCardSource.textContent = [state.meta.year, state.meta.source].filter(Boolean).join(' · ');
      contentCardDesc.textContent = state.meta.description || '';
      contentCardLang.textContent = `${state.meta.langFrom} → ${state.meta.langTo}`;
      contentCardDuration.textContent = contentCardDurationLabel();
      updateTrackLabels();

      if (data.cover) {
        loadCoverFromUrl(data.cover);
      }
    }

    function updateTrackLabels() {
      const enLabel = state.trackLabels.en || 'ORIGINAL · EN';
      const ptLabel = state.trackLabels.pt || 'LOCALIZED · PT-BR';
      document.querySelectorAll('.track-loader[data-track="en"] .track-loader-label').forEach((node) => {
        node.textContent = enLabel;
      });
      document.querySelectorAll('.track-loader[data-track="pt"] .track-loader-label').forEach((node) => {
        node.textContent = ptLabel;
      });
      if (waveLabelEn) waveLabelEn.textContent = enLabel;
      if (waveLabelPt) waveLabelPt.textContent = ptLabel;
      if (faderLabelEn) faderLabelEn.textContent = state.meta.langFrom || 'EN';
      if (faderLabelPt) faderLabelPt.textContent = (state.meta.langTo || 'PT-BR').replace('-', '·');
      Object.values(state.tracks).forEach((track) => track.updateBadge());
    }

    function masteredBadgeLabel(audioProcessing) {
      if (audioProcessing?.normalized_offline !== true) return '';
      const lufs = audioProcessing.target_integrated_lufs;
      const peak = audioProcessing.target_true_peak_dbtp;
      if (Number.isFinite(lufs) && Number.isFinite(peak)) {
        return `MASTERED · ${lufs} LUFS / ${peak} dBTP`;
      }
      return 'MASTERED · offline';
    }

    function valueOrCurrent(data, key, current) {
      return Object.prototype.hasOwnProperty.call(data, key) ? data[key] : current;
    }

    function contentCardDurationLabel() {
      return state.meta.duration && state.meta.duration !== '—' ? state.meta.duration : inferDurationLabel() || '—:——';
    }

    function updateContentCardDurationFromVideo() {
      if (!Number.isFinite(sharedVideo.duration)) return;
      contentCardDuration.textContent = formatDurationShort(sharedVideo.duration);
    }

    /* ---------------------------------------------------------------------
       Global Actions
    --------------------------------------------------------------------- */
    function togglePlayback() {
      state.isPlaying ? pauseAll() : playAll();
    }

    async function playAll() {
      const tracks = loadedTracks();
      if (!tracks.length) return;
      markStageFaderInteracted();
      const resumePromise = resumeAudioRuntimeForPlayback();

      const base = primaryTrack()?.media.currentTime || tracks[0].media.currentTime || 0;
      if (state.sync) tracks.forEach((track) => track.seek(base));
      applyCrossfade();

      const results = await Promise.allSettled(tracks.map((track) => track.play()));
      const ctx = await resumePromise;
      if (ctx.state === 'suspended') {
        const track = primaryTrack() || tracks[0];
        track?.showWarning('audio output is waiting for a browser gesture. click play once more after the LUFS badge finishes normalizing.');
      }
      const failure = results.find((result) => result.status === 'rejected');
      if (failure) {
        const track = primaryTrack() || tracks[0];
        track?.showWarning(playbackFailureMessage(failure.reason));
      }
      updatePlaybackState();
    }

    function pauseAll() {
      loadedTracks().forEach((track) => track.pause());
      state.isPlaying = false;
      updatePlaybackState();
    }

    function updatePlaybackState() {
      state.isPlaying = loadedTracks().some((track) => !track.media.paused && !track.media.ended);
      sharedPlay.classList.toggle('is-playing', state.isPlaying);
      updateStageFaderIntro();
    }

    function scrubShared() {
      const duration = sharedDuration();
      if (!Number.isFinite(duration) || duration <= 0) return;
      const next = Number(sharedScrubber.value) / 1000 * duration;
      loadedTracks().forEach((track) => track.seek(next));
    }

    function setFader(value, shouldScan = true) {
      const wasActive = activeSubtitleKey();
      state.fader = Math.max(0, Math.min(100, value));
      faderShell.style.setProperty('--fader', `${state.fader}%`);
      stage.style.setProperty('--stage-fader', `${state.fader}%`);
      fader.setAttribute('aria-valuenow', state.fader.toFixed(1));
      stageFader?.setAttribute('aria-valuenow', state.fader.toFixed(1));
      faderKnob.classList.toggle('is-magnetic', state.fader >= 46 && state.fader <= 54 && !state.faderDragging && !state.stageFaderDragging);
      stageFaderKnob?.classList.toggle('is-magnetic', state.fader >= 46 && state.fader <= 54 && !state.stageFaderDragging);
      applyCrossfade();
      updateWaveVisualMix(effectiveGainForEn(), effectiveGainForPt());
      if (shouldScan && wasActive !== activeSubtitleKey()) createScanLine(stage);
    }

    function markStageFaderInteracted() {
      if (state.stageFaderInteracted) return;
      state.stageFaderInteracted = true;
      updateStageFaderState();
      updateWaveVisualMix(effectiveGainForEn(), effectiveGainForPt());
    }

    function updateStageFaderIntro() {
      updateStageFaderState();
    }

    function updateStageFaderState() {
      stage.classList.toggle('stage-crossfader-interacted', state.stageFaderInteracted);
    }

    function onInviteTrackReady(key) {
      state.inviteReady[key] = true;
      if (state.inviteCancelled || state.inviteStarted || state.inviteTimer) return;
      if (!state.inviteReady.en || !state.inviteReady.pt) return;

      state.inviteTimer = window.setTimeout(() => {
        state.inviteTimer = null;
        if (state.inviteCancelled || state.faderDragging || state.stageFaderDragging || state.inviteStarted) return;
        state.inviteAnim = runInviteAnimation();
      }, 2800);
    }

    function updateFaderVisual(pos) {
      const pct = Math.max(0, Math.min(1, pos)) * 100;
      faderKnob.style.left = `clamp(16px, ${pct.toFixed(3)}%, calc(100% - 16px))`;
    }

    function resetInviteVisuals({ removeHint = true, resetKnob = true } = {}) {
      if (resetKnob) faderKnob.style.left = '';
      fader.style.boxShadow = '';
      fader.style.transition = 'box-shadow 400ms var(--ease)';
      faderLabelEn.style.opacity = '';
      faderLabelPt.style.opacity = '';
      faderShell.classList.remove('invite-active');
      faderShell.classList.add('invite-done');
      if (removeHint && faderHint) {
        faderHint.remove();
        faderHint = null;
      }
    }

    function cancelInviteAnimation() {
      if (state.inviteTimer) {
        window.clearTimeout(state.inviteTimer);
        state.inviteTimer = null;
      }
      if (state.inviteAnim) {
        state.inviteAnim.cancel();
        state.inviteAnim = null;
      } else if (state.inviteStarted) {
        resetInviteVisuals();
      }
      state.inviteCancelled = true;
    }

    function runInviteAnimation() {
      state.inviteStarted = true;
      faderShell.classList.add('invite-active');
      fader.style.transition = 'none';
      faderHint?.classList.add('visible');

      let startTime = null;
      let cancelled = false;
      const cycles = 3;
      const cycleMs = 2400;
      const keyframes = [
        { t: 0, pos: 0.5 },
        { t: 0.375, pos: 0.62 },
        { t: 0.5, pos: 0.62 },
        { t: 0.875, pos: 0.48 },
        { t: 1, pos: 0.5 }
      ];

      const easeInOut = (value) => (
        value < 0.5 ? 2 * value * value : -1 + (4 - 2 * value) * value
      );

      const interpolatePos = (progress) => {
        for (let i = 0; i < keyframes.length - 1; i += 1) {
          const a = keyframes[i];
          const b = keyframes[i + 1];
          if (progress >= a.t && progress <= b.t) {
            const local = (progress - a.t) / (b.t - a.t);
            return a.pos + (b.pos - a.pos) * easeInOut(local);
          }
        }
        return 0.5;
      };

      const finish = () => {
        updateFaderVisual(0.5);
        faderLabelEn.style.opacity = '';
        faderLabelPt.style.opacity = '';
        fader.style.boxShadow = '';
        fader.style.transition = 'box-shadow 400ms var(--ease)';
        faderShell.classList.remove('invite-active');
        faderShell.classList.add('invite-done');
        state.inviteAnim = null;
        if (faderHint) {
          faderHint.style.opacity = '0';
          window.setTimeout(() => {
            faderHint?.remove();
            faderHint = null;
          }, 700);
        }
      };

      const tick = (timestamp) => {
        if (cancelled) return;
        if (!startTime) startTime = timestamp;
        const elapsed = timestamp - startTime;
        const currentCycle = Math.floor(elapsed / cycleMs);
        const cyclePos = (elapsed % cycleMs) / cycleMs;

        if (currentCycle >= cycles) {
          finish();
          return;
        }

        const pos = interpolatePos(cyclePos);
        const goingRight = cyclePos < 0.5;
        const labelProgress = goingRight ? cyclePos * 2 : (cyclePos - 0.5) * 2;
        const haloProgress = goingRight ? cyclePos * 2 : (1 - cyclePos) * 2;

        updateFaderVisual(pos);
        faderLabelEn.style.opacity = goingRight
          ? 0.25 + (1 - labelProgress) * 0.55
          : 0.25 + labelProgress * 0.55;
        faderLabelPt.style.opacity = goingRight
          ? 0.25 + labelProgress * 0.55
          : 0.25 + (1 - labelProgress) * 0.55;
        fader.style.boxShadow = `0 0 ${8 + haloProgress * 16}px rgba(184, 92, 48, ${haloProgress * 0.22})`;

        requestAnimationFrame(tick);
      };

      requestAnimationFrame(tick);

      return {
        cancel() {
          cancelled = true;
          resetInviteVisuals();
        }
      };
    }

    function startFaderDrag(event) {
      if (sharedPlay && !sharedPlay.disabled && !state.isPlaying) {
        void playAll();
      }
      markStageFaderInteracted();
      cancelInviteAnimation();
      state.faderDragging = true;
      faderShell.classList.add('is-dragging');
      faderKnob.classList.add('is-dragging');
      fader.setPointerCapture?.(event.pointerId);
      setFaderFromPointer(event);
    }

    function dragFader(event) {
      if (!state.faderDragging) return;
      setFaderFromPointer(event);
    }

    function endFaderDrag(event) {
      if (!state.faderDragging) return;
      state.faderDragging = false;
      faderShell.classList.remove('is-dragging');
      faderKnob.classList.remove('is-dragging');
      fader.releasePointerCapture?.(event.pointerId);
      setFader(state.fader);
    }

    function setFaderFromPointer(event) {
      const rect = fader.getBoundingClientRect();
      const next = (event.clientX - rect.left) / rect.width * 100;
      setFader(next);
    }

    function handleFaderKey(event) {
      const keys = ['ArrowLeft', 'ArrowRight', 'Home', 'End'];
      if (!keys.includes(event.key)) return;
      event.preventDefault();
      markStageFaderInteracted();
      cancelInviteAnimation();
      if (event.key === 'Home') setFader(0);
      if (event.key === 'End') setFader(100);
      if (event.key === 'ArrowLeft') setFader(state.fader - 2);
      if (event.key === 'ArrowRight') setFader(state.fader + 2);
    }

    function animateFader(target, duration = 300) {
      markStageFaderInteracted();
      const start = state.fader;
      const startTime = performance.now();
      const step = (now) => {
        const progress = Math.min(1, (now - startTime) / duration);
        const eased = easeInOutCubic(progress);
        setFader(start + (target - start) * eased);
        if (progress < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    }

    function startStageFaderDrag(event) {
      if (developerMode || event.button > 0) return;
      if (sharedPlay && !sharedPlay.disabled && !state.isPlaying) {
        void playAll();
      }
      event.preventDefault();
      markStageFaderInteracted();
      cancelInviteAnimation();
      state.stageFaderDragging = true;
      stageFader.classList.add('is-dragging');
      stageFader.setPointerCapture?.(event.pointerId);
      setFaderFromStagePointer(event);
    }

    function dragStageFader(event) {
      if (!state.stageFaderDragging) return;
      event.preventDefault();
      setFaderFromStagePointer(event);
    }

    function endStageFaderDrag(event) {
      if (!state.stageFaderDragging) return;
      state.stageFaderDragging = false;
      stageFader.classList.remove('is-dragging');
      stageFader.releasePointerCapture?.(event.pointerId);
      setFader(state.fader);
    }

    function setFaderFromStagePointer(event) {
      const rect = stageFader.getBoundingClientRect();
      const next = (event.clientX - rect.left) / rect.width * 100;
      setFader(next);
    }

    function isMobileViewport() {
      return window.innerWidth <= 768;
    }

    function initMobileVolumePopup() {
      if (!volumePopup || !volumePopupTrack || !volumeKnobWrap) return;

      volumeKnobWrap.addEventListener('pointerdown', (event) => {
        if (!isMobileViewport() || volumePopup.contains(event.target)) return;
        event.stopPropagation();
        if (state.volumePopupOpen) {
          scheduleVolumePopupClose();
        } else {
          openVolumePopup();
          scheduleVolumePopupClose();
        }
      });

      volumePopupTrack.addEventListener('pointerdown', (event) => {
        if (!isMobileViewport()) return;
        event.preventDefault();
        event.stopPropagation();
        state.volumePopupDragging = true;
        volumePopupTrack.setPointerCapture?.(event.pointerId);
        clearVolumePopupClose();
        setVolumeFromPopupPointer(event);
      });

      window.addEventListener('pointermove', (event) => {
        if (!state.volumePopupDragging) return;
        setVolumeFromPopupPointer(event);
      });

      window.addEventListener('pointerup', () => {
        if (!state.volumePopupDragging) return;
        state.volumePopupDragging = false;
        scheduleVolumePopupClose();
      });

      window.addEventListener('pointercancel', () => {
        if (!state.volumePopupDragging) return;
        state.volumePopupDragging = false;
        scheduleVolumePopupClose();
      });

      document.addEventListener('pointerdown', (event) => {
        if (!state.volumePopupOpen) return;
        if (volumeKnobWrap.contains(event.target) || volumePopup.contains(event.target)) return;
        closeVolumePopup();
      });

      window.addEventListener('resize', () => {
        if (!isMobileViewport()) closeVolumePopup();
      });
    }

    function clearVolumePopupClose() {
      window.clearTimeout(state.volumePopupCloseTimer);
      state.volumePopupCloseTimer = null;
    }

    function openVolumePopup() {
      if (!isMobileViewport() || !volumePopup) return;
      clearVolumePopupClose();
      state.volumePopupOpen = true;
      volumePopup.classList.add('open');
      volumePopup.setAttribute('aria-hidden', 'false');
      syncPopupVisual();
    }

    function closeVolumePopup() {
      clearVolumePopupClose();
      state.volumePopupOpen = false;
      state.volumePopupDragging = false;
      volumePopup?.classList.remove('open');
      volumePopup?.setAttribute('aria-hidden', 'true');
    }

    function scheduleVolumePopupClose() {
      clearVolumePopupClose();
      state.volumePopupCloseTimer = window.setTimeout(closeVolumePopup, 2200);
    }

    function volumePopupPctFromPointer(event) {
      const rect = volumePopupTrack.getBoundingClientRect();
      const pct = 1 - Math.max(0, Math.min(1, (event.clientY - rect.top) / rect.height));
      return pct;
    }

    function setVolumeFromPopupPointer(event) {
      setVolume(volumePopupPctFromPointer(event) * TARGET_VOL_MAX);
      syncPopupVisual();
    }

    function syncPopupVisual() {
      if (!volumePopupFill || !volumePopupThumb || !volumePopupDb) return;
      const pct = Math.max(0, Math.min(100, state.volumeValue / TARGET_VOL_MAX * 100));
      volumePopupFill.style.height = `${pct}%`;
      volumePopupThumb.style.bottom = `${pct}%`;
      volumePopupDb.textContent = formatDb(state.volumeValue);
    }

    function setVolume(value, commit = true) {
      const next = Math.max(0, Math.min(TARGET_VOL_MAX, value));
      const pct = next / TARGET_VOL_MAX;
      const angle = KNOB_ARC_START + pct * KNOB_ARC_TOTAL;
      const rad = knobAngleToRad(angle);
      const ix = KNOB_CX + 24 * Math.cos(rad);
      const iy = KNOB_CY + 24 * Math.sin(rad);
      state.volumeValue = next;
      knobIndicator.setAttribute('x2', ix.toFixed(2));
      knobIndicator.setAttribute('y2', iy.toFixed(2));
      knobArcFill.setAttribute('d', pct <= 0 ? '' : describeArc(KNOB_CX, KNOB_CY, KNOB_ARC_R, KNOB_ARC_START, angle));
      knobArcFill.setAttribute('stroke', volumeColorFor(next, pct));
      volumeKnobDb.textContent = formatDb(next);
      volumeKnobSvg.setAttribute('aria-valuenow', Math.round(next * 100));

      if (commit) {
        audioRuntime.setMaster(next);
      } else if (audioRuntime.masterGain) {
        audioRuntime.masterGain.gain.value = next;
      }

      if (volumePopup?.classList.contains('open')) syncPopupVisual();
    }

    function startVolumeDrag(event) {
      if (isMobileViewport() && volumePopup) {
        event.preventDefault();
        return;
      }
      event.preventDefault();
      state.volumeDragging = true;
      state.volumeStartY = event.clientY;
      state.volumeStartValue = state.volumeValue;
      volumeKnobSvg.setPointerCapture?.(event.pointerId);
      volumeKnobSvg.classList.add('is-dragging');
    }

    function dragVolume(event) {
      if (!state.volumeDragging) return;
      const delta = (state.volumeStartY - event.clientY) / 200 * TARGET_VOL_MAX;
      setVolume(state.volumeStartValue + delta);
    }

    function endVolumeDrag(event) {
      if (!state.volumeDragging) return;
      state.volumeDragging = false;
      volumeKnobSvg.releasePointerCapture?.(event.pointerId);
      volumeKnobSvg.classList.remove('is-dragging');
      setVolume(state.volumeValue);
    }

    function handleVolumeWheel(event) {
      event.preventDefault();
      setVolume(state.volumeValue - event.deltaY * 0.001);
    }

    function animateVolume(target, duration = 220) {
      const start = state.volumeValue;
      const startTime = performance.now();
      const step = (now) => {
        const progress = Math.min(1, (now - startTime) / duration);
        const eased = easeInOutCubic(progress);
        setVolume(start + (target - start) * eased);
        if (progress < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    }

    function setupVolumeKnob() {
      buildKnobTicks();
      knobArcTrack.setAttribute('d', describeArc(KNOB_CX, KNOB_CY, KNOB_ARC_R, KNOB_ARC_START, KNOB_ARC_START + KNOB_ARC_TOTAL));
    }

    function buildKnobTicks() {
      knobTicks.innerHTML = '';
      for (let i = 0; i < KNOB_TICK_COUNT; i += 1) {
        const pct = i / (KNOB_TICK_COUNT - 1);
        const angle = KNOB_ARC_START + KNOB_ARC_TOTAL * pct;
        const rad = knobAngleToRad(angle);
        const isMajor = i % 5 === 0;
        const isUnity = Math.abs(pct - (TARGET_VOL_DEFAULT / TARGET_VOL_MAX)) < 0.02;
        const len = isMajor ? 7 : 4;
        const x1 = KNOB_CX + KNOB_TICK_RADIUS * Math.cos(rad);
        const y1 = KNOB_CY + KNOB_TICK_RADIUS * Math.sin(rad);
        const x2 = KNOB_CX + (KNOB_TICK_RADIUS - len) * Math.cos(rad);
        const y2 = KNOB_CY + (KNOB_TICK_RADIUS - len) * Math.sin(rad);
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', x1.toFixed(2));
        line.setAttribute('y1', y1.toFixed(2));
        line.setAttribute('x2', x2.toFixed(2));
        line.setAttribute('y2', y2.toFixed(2));
        line.setAttribute('stroke-width', isMajor ? '1.5' : '1');
        if (isUnity) line.classList.add('tick-unity');
        else if (isMajor) line.classList.add('tick-major');
        knobTicks.appendChild(line);
      }
    }

    function describeArc(cx, cy, radius, startAngle, endAngle) {
      const start = pointOnArc(cx, cy, radius, startAngle);
      const end = pointOnArc(cx, cy, radius, endAngle);
      const largeArc = endAngle - startAngle > 180 ? 1 : 0;
      return `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArc} 1 ${end.x} ${end.y}`;
    }

    function pointOnArc(cx, cy, radius, angle) {
      const rad = knobAngleToRad(angle);
      return {
        x: (cx + radius * Math.cos(rad)).toFixed(2),
        y: (cy + radius * Math.sin(rad)).toFixed(2)
      };
    }

    function knobAngleToRad(angle) {
      return (angle - 90) * Math.PI / 180;
    }

    function volumeColorFor(value, pct) {
      if (value <= TARGET_VOL_DEFAULT) {
        return `rgba(94, 110, 106, ${0.4 + pct * 0.4})`;
      }
      return `rgba(201, 148, 26, ${Math.min(1, 0.6 + (pct - TARGET_VOL_DEFAULT / TARGET_VOL_MAX) * 1.2)})`;
    }

    function createScanLine(target) {
      const scanLine = document.createElement('div');
      scanLine.className = 'scan-line';
      target.appendChild(scanLine);
      scanLine.addEventListener('animationend', () => scanLine.remove(), { once: true });
    }

    function applyCrossfade() {
      if (state.tracks.en) state.tracks.en.setGain(effectiveGainForEn());
      if (state.tracks.pt) state.tracks.pt.setGain(effectiveGainForPt());
    }

    function gainForEn() {
      return Math.cos((state.fader / 100) * Math.PI / 2);
    }

    function gainForPt() {
      return Math.sin((state.fader / 100) * Math.PI / 2);
    }

    function effectiveGainForEn() {
      const tracks = loadedTracks();
      if (tracks.length === 1 && state.tracks.en?.isLoaded) return 1;
      return gainForEn();
    }

    function effectiveGainForPt() {
      const tracks = loadedTracks();
      if (tracks.length === 1 && state.tracks.pt?.isLoaded) return 1;
      return gainForPt();
    }

    function setCaptions(enabled) {
      state.captions = enabled;
      ccButton.classList.toggle('active', enabled);
      stage.classList.toggle('captions-on', enabled);
      updateCaption();
    }

    function updateStageReady() {
      const tracks = loadedTracks();
      const hasMedia = tracks.length > 0;
      const isNormalizing = tracks.some((track) => track.normalizationState === 'normalizing');
      const readyForComparison = state.tracks.en.isLoaded && state.tracks.pt.isLoaded;
      stage.classList.toggle('has-media', hasMedia);
      stage.classList.toggle('loaded', readyForComparison);
      stage.classList.toggle('normalizing', isNormalizing);
      sharedPlay.disabled = !hasMedia || isNormalizing;
      sharedScrubber.disabled = !hasMedia;
      updateTransportUi();
    }

    function setStageLoading(value) {
      stage.classList.toggle('loading', value);
    }

    function loop(timestamp = 0) {
      const needsRealtime = state.isPlaying && loadedTracks().length;
      const frameGap = needsRealtime ? 16 : 180;

      if (timestamp - state.lastDraw >= frameGap) {
        updateTransportUi();
        updateCaption();
        drawSharedWave();
        state.lastDraw = timestamp;
      }

      state.raf = requestAnimationFrame(loop);
    }

    function loadedTracks() {
      return Object.values(state.tracks).filter((track) => track.isLoaded);
    }

    function primaryTrack() {
      const preferred = state.fader < 50 ? state.tracks.en : state.tracks.pt;
      if (preferred?.isLoaded) return preferred;
      return loadedTracks()[0] || preferred;
    }

    function sharedDuration() {
      const durations = loadedTracks()
        .map((track) => track.media.duration)
        .filter((duration) => Number.isFinite(duration) && duration > 0);
      return durations.length ? Math.max(...durations) : NaN;
    }

    function inferDurationLabel() {
      const duration = sharedDuration();
      return Number.isFinite(duration) ? formatDurationShort(duration) : '';
    }

    function activeSubtitleKey() {
      return state.fader < 50 ? 'en' : 'pt';
    }

    function updateTransportUi() {
      const track = primaryTrack() || state.tracks.en;
      const current = track?.isLoaded ? track.media.currentTime || 0 : 0;
      const duration = sharedDuration();
      sharedTimecode.textContent = formatDurationShort(current);
      sharedDurationLabel.textContent = Number.isFinite(duration) && duration > 0 ? formatDurationShort(duration) : '—:——';
      contentCardDuration.textContent = contentCardDurationLabel();

      if (Number.isFinite(duration) && duration > 0) {
        const progress = Math.max(0, Math.min(1000, current / duration * 1000));
        sharedScrubber.value = String(progress);
        sharedScrubber.style.setProperty('--progress', `${progress / 10}%`);
      }
    }

    function updateCaption() {
      if (!state.captions) {
        sharedCaption.textContent = '';
        return;
      }
      const key = activeSubtitleKey();
      const track = state.tracks[key];
      const time = track?.isLoaded ? track.media.currentTime || 0 : 0;
      const match = SUBTITLES[key].find((item) => time >= item.start && time <= item.end);
      sharedCaption.textContent = match ? match.text : '';
    }

    /* ---------------------------------------------------------------------
       Tagline
    --------------------------------------------------------------------- */
    function splitHeroTitle() {
      const title = document.querySelector('.hero h1');
      const text = title.textContent;
      title.textContent = '';
      [...text].forEach((char, index) => {
        const span = document.createElement('span');
        span.textContent = char;
        span.style.animationDelay = `${index * 40}ms`;
        title.appendChild(span);
      });
    }

    function rotateTagline() {
      const phrases = [
        'not translated. localized.',
        'your voice, their language.',
        'en → pt-br'
      ];
      const target = document.querySelector('[data-tagline]');
      let index = 0;

      typePhrase(target, phrases[index], 28);
      setInterval(() => {
        index = (index + 1) % phrases.length;
        typePhrase(target, phrases[index], 28);
      }, 3000);
    }

    function typePhrase(target, phrase, speed) {
      target.textContent = '';
      [...phrase].forEach((char, index) => {
        setTimeout(() => {
          target.textContent += char;
        }, index * speed);
      });
    }

    /* ---------------------------------------------------------------------
       Canvas Drawing
    --------------------------------------------------------------------- */
    function drawSharedWave() {
      resizeCanvas(sharedCanvas);
      const width = sharedCanvas.width;
      const height = sharedCanvas.height;
      const dpr = window.devicePixelRatio || 1;
      const barWidth = 2 * dpr;
      const gap = 2 * dpr;
      const barCount = Math.max(80, Math.floor(width / (barWidth + gap)));
      const en = state.tracks.en;
      const pt = state.tracks.pt;
      const gainEn = effectiveGainForEn();
      const gainPt = effectiveGainForPt();
      canvasCtx.clearRect(0, 0, width, height);
      drawCenterLine(canvasCtx, width, height / 2);

      const enBars = barsForTrack(en, gainEn, barCount);
      const ptBars = barsForTrack(pt, gainPt, barCount);
      drawBlended(canvasCtx, enBars, ptBars, width, height, gainEn, gainPt, barWidth, gap);
      updateWaveVisualMix(gainEn, gainPt, en?.energy || 0, pt?.energy || 0);
    }

    function barsForTrack(track, gain, count) {
      if (!track?.isLoaded) return makeSpeechShape(count, track?.key === 'pt' ? 29 : 11);
      track.energy = 0;
      if (state.isPlaying && gain > 0.02 && track.analyser && track.data) {
        track.analyser.getByteFrequencyData(track.data);
        const bars = sampleBars(track.data, count);
        track.energy = averageEnergy(track.data) * gain;
        track.lastFrame = bars;
        return bars;
      }
      return barsWithCount(track.lastFrame || track.idleShape, count);
    }

    function resizeCanvas(canvas) {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      const width = Math.max(1, Math.floor(rect.width * dpr));
      const height = Math.max(1, Math.floor(rect.height * dpr));
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }
    }

    function drawCenterLine(ctx, width, center) {
      ctx.save();
      ctx.strokeStyle = 'rgba(26, 22, 18, 0.08)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, center);
      ctx.lineTo(width, center);
      ctx.stroke();
      ctx.restore();
    }

    function drawBlended(ctx, enBars, ptBars, width, height, gainEn, gainPt, barWidth, gap) {
      drawDirectionalWaveBars(ctx, enBars, width, height, {
        direction: 'ltr',
        color: state.tracks.en?.isLoaded ? '201, 148, 26' : '26, 22, 18',
        opacity: state.tracks.en?.isLoaded ? 0.3 + gainEn * 0.7 : 0.06,
        gain: state.tracks.en?.isLoaded ? gainEn : 0.42,
        barWidth,
        gap
      });
      drawDirectionalWaveBars(ctx, ptBars, width, height, {
        direction: 'rtl',
        color: state.tracks.pt?.isLoaded ? '184, 92, 48' : '26, 22, 18',
        opacity: state.tracks.pt?.isLoaded ? 0.3 + gainPt * 0.7 : 0.06,
        gain: state.tracks.pt?.isLoaded ? gainPt : 0.42,
        barWidth,
        gap
      });
    }

    function drawDirectionalWaveBars(ctx, bars, width, height, mode) {
      const center = height / 2;
      const totalWidth = bars.length * mode.barWidth + (bars.length - 1) * mode.gap;
      const startX = Math.max(0, (width - totalWidth) / 2);
      const maxHeight = center * 0.92;
      const alpha = Math.min(0.98, Math.max(0.05, mode.opacity));
      const gradient = ctx.createLinearGradient(0, center - maxHeight, 0, center + maxHeight);
      gradient.addColorStop(0, `rgba(${mode.color}, ${alpha})`);
      gradient.addColorStop(0.5, `rgba(${mode.color}, ${alpha * 0.55})`);
      gradient.addColorStop(1, `rgba(${mode.color}, ${alpha})`);

      ctx.fillStyle = gradient;
      bars.forEach((value, index) => {
        const h = Math.max(1, Math.pow(value, 0.86) * maxHeight * mode.gain);
        const x = mode.direction === 'rtl'
          ? width - startX - mode.barWidth - index * (mode.barWidth + mode.gap)
          : startX + index * (mode.barWidth + mode.gap);
        roundedRect(ctx, x, center - h, mode.barWidth, h * 2, mode.barWidth / 2);
      });
    }

    function updateWaveVisualMix(gainEn, gainPt, energyEn = 0, energyPt = 0) {
      const labelOpacity = state.stageFaderInteracted ? null : '0.94';
      waveLabelEn.style.opacity = labelOpacity || String(0.3 + gainEn * 0.7);
      waveLabelPt.style.opacity = labelOpacity || String(0.3 + gainPt * 0.7);
      sharedWave.style.setProperty('--glow-en', Math.min(1, gainEn * energyEn * 1.2).toFixed(3));
      sharedWave.style.setProperty('--glow-pt', Math.min(1, gainPt * energyPt * 1.2).toFixed(3));
    }

    function barsWithCount(source, count) {
      if (!source || source.length === count) return source || makeSpeechShape(count, 7);
      const bars = new Float32Array(count);
      for (let i = 0; i < count; i += 1) {
        const sourceIndex = Math.floor((i / Math.max(1, count - 1)) * (source.length - 1));
        bars[i] = source[sourceIndex];
      }
      return bars;
    }

    function roundedRect(ctx, x, y, width, height, radius) {
      const r = Math.min(radius, width / 2, height / 2);
      ctx.beginPath();
      ctx.moveTo(x + r, y);
      ctx.arcTo(x + width, y, x + width, y + height, r);
      ctx.arcTo(x + width, y + height, x, y + height, r);
      ctx.arcTo(x, y + height, x, y, r);
      ctx.arcTo(x, y, x + width, y, r);
      ctx.closePath();
      ctx.fill();
    }

    function sampleBars(data, count) {
      const bars = new Float32Array(count);
      const usable = Math.min(data.length, 220);
      for (let i = 0; i < count; i += 1) {
        const start = Math.floor((i / count) * usable);
        const end = Math.max(start + 1, Math.floor(((i + 1) / count) * usable));
        let sum = 0;
        for (let j = start; j < end; j += 1) sum += data[j];
        bars[i] = Math.min(1, (sum / (end - start) / 255) * 1.45);
      }
      return bars;
    }

    function averageEnergy(data) {
      let sum = 0;
      const limit = Math.min(data.length, 96);
      for (let i = 0; i < limit; i += 1) sum += data[i];
      return sum / limit / 255;
    }

    function makeSpeechShape(count, seed) {
      const bars = new Float32Array(count);
      let value = seed;
      for (let i = 0; i < count; i += 1) {
        value = (value * 1664525 + 1013904223) % 4294967296;
        const random = value / 4294967296;
        const x = i / (count - 1);
        const envelope =
          0.18 * gaussian(x, 0.16, 0.08) +
          0.74 * gaussian(x, 0.38, 0.18) +
          0.42 * gaussian(x, 0.7, 0.13) +
          0.16 * gaussian(x, 0.9, 0.06);
        const ripple = Math.sin(i * 0.33 + seed) * 0.04 + Math.sin(i * 0.09) * 0.06;
        bars[i] = Math.max(0.035, Math.min(0.85, envelope * (0.68 + random * 0.42) + ripple));
      }
      return bars;
    }

    function gaussian(x, mean, sigma) {
      return Math.exp(-0.5 * Math.pow((x - mean) / sigma, 2));
    }

    /* ---------------------------------------------------------------------
       Utility
    --------------------------------------------------------------------- */
    async function tryDecodeForLUFS(url) {
      try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`audio fetch failed: ${response.status}`);

        const arrayBuffer = await response.arrayBuffer();
        const OfflineCtx = window.OfflineAudioContext || window.webkitOfflineAudioContext;
        if (OfflineCtx) {
          const decodeCtx = new OfflineCtx(1, 1, 44100);
          return await decodeCtx.decodeAudioData(arrayBuffer.slice(0));
        }

        const ctx = audioRuntime.ensure();
        return await ctx.decodeAudioData(arrayBuffer.slice(0));
      } catch (error) {
        console.warn('LUFS decode unavailable, falling back to realtime measurement', error);
        return null;
      }
    }

    async function measureAndNormalize(audioBuffer) {
      if (!audioBuffer || audioBuffer.duration < 0.5) {
        return { gain: 1, measuredLUFS: null, skipped: true };
      }

      const OfflineCtx = window.OfflineAudioContext || window.webkitOfflineAudioContext;
      if (!OfflineCtx) {
        return { gain: 1, measuredLUFS: null, skipped: true };
      }

      const offline = new OfflineCtx(audioBuffer.numberOfChannels, audioBuffer.length, audioBuffer.sampleRate);
      const source = offline.createBufferSource();
      const highShelf = offline.createBiquadFilter();
      const highPass = offline.createBiquadFilter();

      source.buffer = audioBuffer;
      highShelf.type = 'highshelf';
      highShelf.frequency.value = 1681.97;
      highShelf.gain.value = 4.0;
      highPass.type = 'highpass';
      highPass.frequency.value = 38.13;
      highPass.Q.value = 0.5;

      source.connect(highShelf);
      highShelf.connect(highPass);
      highPass.connect(offline.destination);
      source.start(0);

      const rendered = await offline.startRendering();
      let squareSum = 0;
      let sampleCount = 0;

      for (let channel = 0; channel < rendered.numberOfChannels; channel += 1) {
        const samples = rendered.getChannelData(channel);
        for (let i = 0; i < samples.length; i += 1) {
          squareSum += samples[i] * samples[i];
        }
        sampleCount += samples.length;
      }

      const meanSquare = sampleCount ? squareSum / sampleCount : 0;
      if (meanSquare <= 1e-12) {
        return { gain: 1, measuredLUFS: null, skipped: true };
      }

      const measuredLUFS = -0.691 + 10 * Math.log10(meanSquare);
      const gainDB = TARGET_LUFS - measuredLUFS;
      const gain = Math.min(10, Math.pow(10, gainDB / 20));
      return { gain, measuredLUFS, skipped: false };
    }

    function measureLUFSRealtime(ctx, sourceNode, onResult) {
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 2048;
      sourceNode.connect(analyser);

      const buffer = new Float32Array(analyser.fftSize);
      const startTime = ctx.currentTime;
      const measureDuration = 3.0;
      let squareSum = 0;
      let sampleCount = 0;

      const finish = () => {
        try {
          sourceNode.disconnect(analyser);
        } catch (error) {
          console.warn('temporary LUFS analyser disconnect failed', error);
        }
        analyser.disconnect();

        if (!sampleCount) {
          onResult(1, NaN);
          return;
        }

        const rms = Math.sqrt(squareSum / sampleCount);
        if (rms < 0.00001) {
          onResult(1, NaN);
          return;
        }

        const measuredLUFS = -0.691 + 10 * Math.log10(rms * rms);
        const gainDB = Math.max(-20, Math.min(20, TARGET_LUFS - measuredLUFS));
        const normGain = Math.pow(10, gainDB / 20);
        onResult(normGain, measuredLUFS);
      };

      const tick = () => {
        if (ctx.currentTime - startTime >= measureDuration) {
          finish();
          return;
        }

        analyser.getFloatTimeDomainData(buffer);
        for (let i = 0; i < buffer.length; i += 1) {
          squareSum += buffer[i] * buffer[i];
        }
        sampleCount += buffer.length;
        requestAnimationFrame(tick);
      };

      requestAnimationFrame(tick);
    }

    function formatLUFS(value) {
      if (!Number.isFinite(value)) return '—';
      return value.toFixed(1).replace('-', '−');
    }

    function formatDb(value) {
      if (value <= 0.0001) return '−∞ dB';
      const db = 20 * Math.log10(value);
      const prefix = db > 0 ? '+' : '';
      return `${prefix}${db.toFixed(1)} dB`;
    }

    function escapeHtml(value) {
      return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
    }

    async function resumeAudioRuntimeForPlayback() {
      const ctx = audioRuntime.ensure();
      if (ctx.state !== 'suspended') return ctx;

      try {
        await Promise.race([
          ctx.resume(),
          new Promise((_, reject) => {
            window.setTimeout(() => reject(new Error('audio resume timeout')), 1200);
          })
        ]);
      } catch (error) {
        console.warn('audio resume failed', error);
      }

      return ctx;
    }

    function playbackFailureMessage(error) {
      const name = error?.name || '';
      if (name === 'NotAllowedError') {
        return 'playback was blocked by the browser gesture policy. click play once more after the LUFS badge finishes normalizing.';
      }

      if (name === 'NotSupportedError') {
        return 'this media codec is not browser-playable. convert video to web mp4: h.264 video + aac audio, then replace this track.';
      }

      return 'playback could not start in this browser. if the file plays in vlc but not here, convert it to web mp4: h.264 video + aac audio.';
    }

    function formatTime(seconds) {
      const safe = Math.max(0, Number.isFinite(seconds) ? seconds : 0);
      const minutes = Math.floor(safe / 60);
      const secs = Math.floor(safe % 60);
      const millis = Math.floor((safe % 1) * 1000);
      return `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}.${String(millis).padStart(3, '0')}`;
    }

    function formatDurationShort(seconds) {
      const safe = Math.max(0, Number.isFinite(seconds) ? seconds : 0);
      const minutes = Math.floor(safe / 60);
      const secs = Math.floor(safe % 60);
      return `${minutes}:${String(secs).padStart(2, '0')}`;
    }

    function extensionFromName(name) {
      const clean = (name || '').split('#')[0].split('?')[0];
      const match = clean.match(/\.([a-z0-9]+)$/i);
      return match ? match[1].toLowerCase() : '';
    }

    function titleFromName(name) {
      const clean = decodeURIComponent((name || '').split('#')[0].split('?')[0]);
      const base = clean.split('/').pop() || clean;
      return base.replace(/\.[a-z0-9]+$/i, '') || '—';
    }

    function truncateTitle(title, maxLength) {
      return title.length > maxLength ? `${title.slice(0, maxLength - 1)}…` : title;
    }

    function extensionFromSrc(src) {
      return extensionFromName(src) || 'media';
    }

    function mediaKind(mime) {
      if (!mime) return '';
      return mime.split('/')[1] || mime.split('/')[0];
    }

    function supportFor(isVideo, mime) {
      if (!mime) return true;
      const probe = document.createElement(isVideo ? 'video' : 'audio');
      return probe.canPlayType(mime) !== '';
    }

    function configureMediaCors(media, mode) {
      if (mode) {
        media.crossOrigin = mode;
        return;
      }
      media.removeAttribute('crossorigin');
      media.crossOrigin = null;
    }

    function shouldUseCors(url, isObjectUrl) {
      if (isObjectUrl) return false;
      try {
        const parsed = new URL(url, location.href);
        return parsed.origin !== location.origin;
      } catch (error) {
        return false;
      }
    }

    function playableAudioStatus(media) {
      if ('mozHasAudio' in media) {
        return Boolean(media.mozHasAudio);
      }

      if (media.audioTracks && media.audioTracks.length) {
        return true;
      }

      if (typeof media.captureStream === 'function') {
        try {
          const stream = media.captureStream();
          return stream.getAudioTracks().length > 0;
        } catch (error) {
          return null;
        }
      }

      if ('webkitAudioDecodedByteCount' in media && media.readyState >= 3) {
        return media.webkitAudioDecodedByteCount > 0 ? true : null;
      }

      return null;
    }

    function easeInOutCubic(t) {
      return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }
