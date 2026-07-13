/* PostHog — analytics produit (région EU). Configuration sans cookie : aucune bannière requise. */
!function(t,e){var o,n,p,r;e.__SV||(window.posthog=e,e._i=[],e.init=function(i,s,a){function g(t,e){var o=e.split(".");2==o.length&&(t=t[o[0]],e=o[1]),t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}}(p=t.createElement("script")).type="text/javascript",p.crossOrigin="anonymous",p.async=!0,p.src=s.api_host.replace(".i.posthog.com","-assets.i.posthog.com")+"/static/array.js",(r=t.getElementsByTagName("script")[0]).parentNode.insertBefore(p,r);var u=e;for(void 0!==a?u=e[a]=[]:a="posthog",u.people=u.people||[],u.toString=function(t){var e="posthog";return"posthog"!==a&&(e+="."+a),t||(e+=" (stub)"),e},u.people.toString=function(){return u.toString(1)+".people (stub)"},o="init capture register register_once register_for_session unregister unregister_for_session getFeatureFlag getFeatureFlagPayload isFeatureEnabled reloadFeatureFlags updateEarlyAccessFeatureEnrollment getEarlyAccessFeatures on onFeatureFlags onSessionId getSurveys getActiveMatchingSurveys renderSurvey canRenderSurvey identify setPersonProperties group resetGroups setPersonPropertiesForFlags resetPersonPropertiesForFlags setGroupPropertiesForFlags resetGroupPropertiesForFlags reset get_distinct_id getGroups get_session_id get_session_replay_url alias set_config startSessionRecording stopSessionRecording sessionRecordingStarted captureException loadToolbar get_property getSessionProperty createPersonProfile opt_in_capturing opt_out_capturing has_opted_in_capturing has_opted_out_capturing clear_opt_in_out_capturing debug getPageViewId captureTraceFeedback captureTraceMetric".split(" "),n=0;n<o.length;n++)g(u,o[n]);e._i.push([i,s,a])},e.__SV=1)}(document,window.posthog||[]);

posthog.init('phc_voMZM9vQ5UF7AhHdv5cSHeEz6mrKFK297fFNtLMEwSHa', {
  api_host: 'https://eu.i.posthog.com',
  ui_host: 'https://eu.posthog.com',
  persistence: 'localStorage',      // sans cookie, mais identité/sessions conservées entre pages (funnels OK)
  person_profiles: 'identified_only',
  capture_pageview: true,
  autocapture: true
});

/* Événements métier, façon Amplitude */
(function () {
  function on(sel, ev, fn) {
    document.querySelectorAll(sel).forEach(function (el) { el.addEventListener(ev, fn); });
  }
  function ready(fn) {
    if (document.readyState !== 'loading') fn();
    else document.addEventListener('DOMContentLoaded', fn);
  }
  ready(function () {
    // Lecture d'article
    if (/\/articles\//.test(location.pathname)) {
      var h1 = document.querySelector('article h1');
      posthog.capture('article_viewed', {
        path: location.pathname,
        title: h1 ? h1.textContent.trim() : document.title
      });
    }
    // Envoi du formulaire de contact (AJAX, retour inline)
    var cform = document.querySelector('form.cform');
    if (cform) {
      var statusEl = cform.querySelector('.cform-status');
      var btn = cform.querySelector('button[type="submit"]');
      var honey = cform.querySelector('[name="_honey"]');
      var endpoint = 'https://formsubmit.co/ajax/sentisgregoire@gmail.com';
      function setStatus(kind, msg) {
        if (!statusEl) return;
        statusEl.className = 'cform-status is-' + kind;
        statusEl.textContent = msg;
      }
      cform.addEventListener('submit', function (e) {
        e.preventDefault();
        if (honey && honey.value) return; // bot
        posthog.capture('contact_submitted', { path: location.pathname });
        var payload = {};
        new FormData(cform).forEach(function (v, k) { payload[k] = v; });
        var label = btn ? btn.textContent : '';
        if (btn) { btn.disabled = true; btn.textContent = 'Envoi en cours…'; }
        setStatus('', '');
        fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          body: JSON.stringify(payload)
        })
          .then(function (r) { return r.json(); })
          .then(function (res) {
            var ok = res && (res.success === 'true' || res.success === true);
            if (ok) {
              setStatus('ok', '✓ Merci, votre message est bien parti. Je vous réponds rapidement.');
              cform.reset();
            } else if (res && /activation/i.test(res.message || '')) {
              setStatus('pending', 'Le formulaire finalise sa configuration. Merci de réessayer dans un instant.');
            } else {
              setStatus('error', 'Un souci est survenu. Écrivez-moi directement à sentisgregoire@gmail.com.');
            }
          })
          .catch(function () {
            setStatus('error', 'Problème réseau. Vous pouvez m’écrire à sentisgregoire@gmail.com.');
          })
          .finally(function () { if (btn) { btn.disabled = false; btn.textContent = label; } });
      });
    }
    // Clics profils externes
    on('a[href*="malt.fr"]', 'click', function () {
      posthog.capture('malt_click', { path: location.pathname });
    });
    on('a[href*="linkedin.com"]', 'click', function () {
      posthog.capture('linkedin_click', { path: location.pathname });
    });
    // Clic sur le CTA « Travailler ensemble »
    on('a.nav-cta', 'click', function () {
      posthog.capture('work_with_me_click', { path: location.pathname });
    });
  });
})();
