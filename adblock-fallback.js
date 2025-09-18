// adblock-fallback.js
(function () {
  const TIMEOUT = 600; // ms
  const AD_SELECTOR = '[data-ad="true"], .ad-container, .adsbox';

  function createBait() {
    const bait = document.createElement('div');
    bait.id = 'ad-bait';
    bait.className = 'adsbox ad-unit ad-banner';
    // hide off-screen but present in DOM so blockers detect it
    bait.style.width = '1px';
    bait.style.height = '1px';
    bait.style.position = 'absolute';
    bait.style.left = '-9999px';
    document.body.appendChild(bait);
    return bait;
  }

  function removeBait(bait) {
    if (bait && bait.parentNode) bait.parentNode.removeChild(bait);
  }

  function detectAdblock() {
    return new Promise((resolve) => {
      function run() {
        const bait = createBait();
        setTimeout(() => {
          const found = document.getElementById('ad-bait');
          // If missing or hidden by CSS / offsetHeight 0 -> likely blocked
          const blocked =
            !found ||
            found.offsetParent === null ||
            found.offsetHeight === 0 ||
            found.clientHeight === 0;
          removeBait(bait);
          resolve(Boolean(blocked));
        }, TIMEOUT);
      }

      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', run);
      } else {
        run();
      }
    });
  }

  function replaceAdContainers() {
    const nodes = document.querySelectorAll(AD_SELECTOR);
    nodes.forEach((node) => {
      try {
        // If node removed/blocked or empty, inject fallback.
        const isHidden = !node || node.offsetParent === null;
        const isEmpty = node && node.innerHTML.trim().length === 0;
        if (!node || isHidden || isEmpty) {
          // create placeholder
          const placeholder = document.createElement('div');
          placeholder.className = 'ad-placeholder';
          placeholder.style.minHeight = '60px';
          placeholder.style.display = 'flex';
          placeholder.style.justifyContent = 'center';
          placeholder.style.alignItems = 'center';
          placeholder.style.padding = '12px';
          placeholder.style.border = '1px dashed #ddd';
          placeholder.style.borderRadius = '6px';
          placeholder.innerHTML = `
            <div style="text-align:center;">
              <div style="font-weight:600">Support this site</div>
              <div style="font-size:13px; margin-top:6px">Consider whitelisting us or check our <a href="/donate">support</a> page.</div>
            </div>
          `;
          if (node && node.parentNode) {
            node.parentNode.replaceChild(placeholder, node);
          } else {
            // if node missing completely, try to append to a sensible container
            const app = document.querySelector('.app') || document.body;
            app.insertBefore(placeholder, app.firstChild);
          }
        }
      } catch (e) {
        // safe fail
        console.warn('adblock-fallback replace error', e);
      }
    });
  }

  function showConsentAndLoadOptionalScripts() {
    // show a small non-intrusive banner with option to load optional scripts (e.g., analytics or miner)
    if (document.getElementById('optional-consent')) return;
    const bar = document.createElement('div');
    bar.id = 'optional-consent';
    bar.style.position = 'fixed';
    bar.style.bottom = '12px';
    bar.style.left = '12px';
    bar.style.right = '12px';
    bar.style.maxWidth = '900px';
    bar.style.margin = '0 auto';
    bar.style.padding = '10px 12px';
    bar.style.borderRadius = '8px';
    bar.style.boxShadow = '0 2px 8px rgba(0,0,0,0.12)';
    bar.style.background = '#fff';
    bar.style.zIndex = 99999;
    bar.style.display = 'flex';
    bar.style.justifyContent = 'space-between';
    bar.style.alignItems = 'center';
    bar.innerHTML = `
      <div style="font-size:14px;">
        May mga third-party features na hindi gumana dahil naka-on ang ad blocker. Maaari mong i-load ang mga ito nang kusang-loob.
      </div>
      <div style="display:flex; gap:8px; margin-left:12px">
        <button id="load-optional" style="padding:6px 10px; border-radius:6px; cursor:pointer">Load Features</button>
        <button id="dismiss-optional" style="padding:6px 10px; border-radius:6px; background:#f3f3f3; cursor:pointer">Dismiss</button>
      </div>
    `;
    document.body.appendChild(bar);

    document.getElementById('load-optional').addEventListener('click', () => {
      // Example: load analytics (local copy) and other scripts safely
      loadScript('/static/js/site-critical-fallback.js');
      // IMPORTANT: don't auto-load miner.js. If you must load optional heavy script, do so only if user truly consents.
      // If you have a "miner" that needs explicit consent (and is legal/acceptable), load it like:
      // loadScript('/static/js/mine.js');
      bar.parentNode.removeChild(bar);
    });

    document.getElementById('dismiss-optional').addEventListener('click', () => {
      try { bar.parentNode.removeChild(bar); } catch (e) {}
    });
  }

  function loadScript(src, onload, onerror) {
    try {
      const s = document.createElement('script');
      s.src = src;
      s.async = true;
      if (onload) s.onload = onload;
      if (onerror) s.onerror = onerror;
      document.head.appendChild(s);
    } catch (e) {
      console.warn('Failed to load script', src, e);
    }
  }

  // main
  detectAdblock().then((blocked) => {
    if (blocked) {
      console.info('[adblock-fallback] Adblock detected — applying fallbacks.');
      replaceAdContainers();
      // Offer the user the option to load optional features (consent)
      showConsentAndLoadOptionalScripts();
    } else {
      console.info('[adblock-fallback] No adblock detected.');
      // safe to load site-critical fallback scripts (if any)
      // e.g. loadScript('/static/js/site-critical-fallback.js');
      // But DO NOT auto-load any mining script unless you have clear consent.
    }
  }).catch((e) => {
    console.error('[adblock-fallback] detection error', e);
    // keep site functional: replace ad nodes to avoid collapse
    replaceAdContainers();
  });
})();
