(function () {
  'use strict';

  const GA_MEASUREMENT_ID = 'G-TYL01HQXE0';
  const STORAGE_KEY = 'dosel_analytics_consent_v1';
  const IS_GA_CONFIGURED = Boolean(GA_MEASUREMENT_ID) && GA_MEASUREMENT_ID !== 'G-XXXXXXXXXX';
  const CONSENT_ACCEPTED = 'accepted';
  const CONSENT_REJECTED = 'rejected';
  const COOKIE_MAX_AGE = 60 * 60 * 24 * 180;

  const lang = (document.documentElement.lang || 'en').toLowerCase();
  const isPt = lang.startsWith('pt');
  const isZh = lang.startsWith('zh');

  const copy = isPt ? {
    message: 'Usamos cookies essenciais e analytics opcionais para entender como visitantes usam este site. Você pode aceitar ou recusar o analytics.',
    accept: 'Aceitar analytics',
    reject: 'Recusar',
    privacy: 'Privacidade',
    settings: 'Configurar cookies',
    saved: 'Preferência de analytics atualizada.'
  } : isZh ? {
    message: 'We use essential cookies and optional analytics to understand how visitors use this site. You can accept or reject analytics.',
    accept: 'Accept analytics',
    reject: 'Reject',
    privacy: 'Privacy',
    settings: 'Cookie settings',
    saved: 'Analytics preference updated.'
  } : {
    message: 'We use essential cookies and optional analytics to understand how visitors use this site. You can accept or reject analytics.',
    accept: 'Accept analytics',
    reject: 'Reject',
    privacy: 'Privacy',
    settings: 'Cookie settings',
    saved: 'Analytics preference updated.'
  };

  const privacyHref = isPt ? 'privacy_pt.html' : 'privacy.html';

  function getConsent() {
    try {
      if (window.localStorage) {
        const stored = window.localStorage.getItem(STORAGE_KEY);
        if (stored) return stored;
      }
    } catch (_) {
      // Fall through to the technical cookie fallback.
    }
    const match = document.cookie.match(new RegExp('(?:^|; )' + STORAGE_KEY + '=([^;]*)'));
    return match ? decodeURIComponent(match[1]) : null;
  }

  function setConsent(value) {
    try {
      if (window.localStorage) window.localStorage.setItem(STORAGE_KEY, value);
    } catch (_) {
      // localStorage can be unavailable in strict privacy modes.
    }
    try {
      const secure = window.location.protocol === 'https:' ? '; Secure' : '';
      document.cookie = STORAGE_KEY + '=' + encodeURIComponent(value) + '; Max-Age=' + COOKIE_MAX_AGE + '; Path=/; SameSite=Lax' + secure;
    } catch (_) {
      // Some embedded browser contexts expose cookies as read-only.
    }
  }

  function clearConsent() {
    try {
      if (window.localStorage) window.localStorage.removeItem(STORAGE_KEY);
    } catch (_) {}
    try {
      document.cookie = STORAGE_KEY + '=; Max-Age=0; Path=/; SameSite=Lax';
    } catch (_) {}
  }

  function loadGa4() {
    if (!IS_GA_CONFIGURED || window.__doselGa4Loaded) return;
    window.__doselGa4Loaded = true;
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () {
      window.dataLayer.push(arguments);
    };
    window.gtag('js', new Date());
    window.gtag('config', GA_MEASUREMENT_ID, {
      send_page_view: true,
      allow_google_signals: false,
      allow_ad_personalization_signals: false
    });

    const script = document.createElement('script');
    script.async = true;
    script.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(GA_MEASUREMENT_ID);
    document.head.appendChild(script);
  }

  function track(eventName, params) {
    if (!IS_GA_CONFIGURED || getConsent() !== CONSENT_ACCEPTED || typeof window.gtag !== 'function') return;
    window.gtag('event', eventName, params || {});
  }

  function normalizePath(href) {
    try {
      return new URL(href, window.location.href).pathname.split('/').pop() || 'index.html';
    } catch (_) {
      return href;
    }
  }

  function socialPlatform(url) {
    if (/instagram\\.com/i.test(url)) return 'instagram';
    if (/linkedin\\.com/i.test(url)) return 'linkedin';
    if (/youtube\\.com|youtu\\.be/i.test(url)) return 'youtube';
    if (/tiktok\\.com/i.test(url)) return 'tiktok';
    if (/(^|\\.)x\\.com|twitter\\.com/i.test(url)) return 'x';
    if (/facebook\\.com/i.test(url)) return 'facebook';
    return null;
  }

  function ctaLocation(link) {
    if (link.closest('#hero')) return 'hero';
    if (link.closest('#contact')) return 'contact';
    if (link.closest('footer')) return 'footer';
    return 'page';
  }

  function bindEventTracking() {
    document.addEventListener('click', function (event) {
      const settingsButton = event.target.closest('[data-analytics-action="cookie-settings"]');
      if (settingsButton) {
        event.preventDefault();
        showBanner(true);
        track('cookie_settings_open', { location: 'footer' });
        return;
      }

      const link = event.target.closest('a[href]');
      if (!link) return;

      const href = link.getAttribute('href') || '';
      const label = (link.textContent || '').trim();
      const url = link.href || href;

      if (href.startsWith('mailto:') && href.includes('hello@dosel.co')) {
        track('email_click', { link_text: label || 'hello@dosel.co', link_url: href });
        return;
      }

      const platform = socialPlatform(url);
      if (platform) {
        track('social_click', { social_platform: platform, link_text: label, link_url: url });
        return;
      }

      if (link.closest('.lang-switcher')) {
        track('language_switch', { language: label, destination: normalizePath(href) });
        return;
      }

      if (/^(about|terms|privacy|ai-transparency)(_pt)?\\.html$/.test(normalizePath(href))) {
        track('company_link_click', { page: normalizePath(href), link_text: label });
        return;
      }

      if (link.classList.contains('hero-cta') || link.classList.contains('btn')) {
        track('cta_click', { cta_label: label, cta_location: ctaLocation(link), link_url: href });
      }
    }, true);
  }

  function injectStyles() {
    if (document.getElementById('dosel-analytics-style')) return;
    const style = document.createElement('style');
    style.id = 'dosel-analytics-style';
    style.textContent = `
      .analytics-consent {
        position: fixed;
        left: 24px;
        right: 24px;
        bottom: 22px;
        z-index: 10000;
        display: grid;
        grid-template-columns: 1fr auto;
        gap: 18px;
        align-items: center;
        max-width: 980px;
        margin: 0 auto;
        padding: 18px 20px;
        border: 1px solid rgba(26,23,20,0.18);
        background: rgba(242,236,224,0.96);
        box-shadow: 0 18px 46px rgba(26,23,20,0.16);
        color: var(--ink, #1a1714);
        backdrop-filter: blur(14px);
      }
      .analytics-consent p {
        margin: 0;
        font-size: 13px;
        line-height: 1.55;
        color: var(--ink-soft, rgba(26,23,20,0.82));
      }
      .analytics-consent-actions {
        display: flex;
        flex-wrap: wrap;
        justify-content: flex-end;
        gap: 10px;
      }
      .analytics-consent button,
      .analytics-consent a,
      .footer-cookie-settings {
        font-family: var(--font-mono, monospace);
        font-size: 11px;
        letter-spacing: 0.07em;
        text-transform: uppercase;
      }
      .analytics-consent button,
      .footer-cookie-settings {
        appearance: none;
        border: 1px solid rgba(26,23,20,0.22);
        background: transparent;
        color: var(--ink, #1a1714);
        cursor: pointer;
        padding: 10px 12px;
      }
      .analytics-consent button[data-consent-choice="accept"] {
        background: var(--accent, #684a2f);
        border-color: var(--accent, #684a2f);
        color: var(--cream, #f2ece0);
      }
      .analytics-consent a {
        display: inline-flex;
        align-items: center;
        color: var(--ink-muted, rgba(26,23,20,0.70));
        text-decoration: none;
        padding: 10px 0;
      }
      .footer-cookie-settings {
        margin-top: 14px;
        padding: 0;
        border: 0;
        color: var(--ink-muted, rgba(26,23,20,0.70));
        text-align: left;
        text-transform: none;
      }
      .footer-cookie-settings:hover,
      .analytics-consent a:hover {
        color: var(--accent, #684a2f);
      }
      @media (max-width: 720px) {
        .analytics-consent {
          left: 14px;
          right: 14px;
          bottom: 14px;
          grid-template-columns: 1fr;
        }
        .analytics-consent-actions {
          justify-content: flex-start;
        }
      }
    `;
    document.head.appendChild(style);
  }

  function removeBanner() {
    const existing = document.querySelector('.analytics-consent');
    if (existing) existing.remove();
  }

  function showBanner(force) {
    if (!IS_GA_CONFIGURED) return;
    if (!force && getConsent()) return;
    injectStyles();
    removeBanner();

    const banner = document.createElement('section');
    banner.className = 'analytics-consent';
    banner.setAttribute('aria-label', 'Analytics consent');
    banner.innerHTML = `
      <p>${copy.message}</p>
      <div class="analytics-consent-actions">
        <button type="button" data-consent-choice="accept">${copy.accept}</button>
        <button type="button" data-consent-choice="reject">${copy.reject}</button>
        <a href="${privacyHref}">${copy.privacy}</a>
      </div>
    `;
    banner.addEventListener('click', function (event) {
      const choice = event.target.closest('[data-consent-choice]');
      if (!choice) return;
      const value = choice.getAttribute('data-consent-choice') === 'accept' ? CONSENT_ACCEPTED : CONSENT_REJECTED;
      setConsent(value);
      if (value === CONSENT_ACCEPTED) {
        loadGa4();
        track('analytics_consent_accept', { source: 'banner' });
      }
      removeBanner();
    });
    document.body.appendChild(banner);
  }

  function revealSettingsButtons() {
    if (!IS_GA_CONFIGURED) return;
    document.querySelectorAll('[data-analytics-action="cookie-settings"]').forEach(function (button) {
      button.hidden = false;
      if (!button.textContent.trim()) button.textContent = copy.settings;
    });
    injectStyles();
  }

  bindEventTracking();
  revealSettingsButtons();

  if (IS_GA_CONFIGURED && getConsent() === CONSENT_ACCEPTED) {
    loadGa4();
  } else {
    showBanner(false);
  }

  window.DoselAnalytics = {
    measurementId: GA_MEASUREMENT_ID,
    enabled: IS_GA_CONFIGURED,
    getConsent: getConsent,
    setConsent: function (value) {
      if (value !== CONSENT_ACCEPTED && value !== CONSENT_REJECTED) return;
      setConsent(value);
      if (value === CONSENT_ACCEPTED) loadGa4();
    },
    resetConsent: function () {
      clearConsent();
      showBanner(true);
    }
  };
})();
