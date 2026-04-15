/**
 * Cookie Consent Banner for AnimalFaceTest
 * Required for Google AdSense policy compliance and GDPR
 */
(function () {
    var KEY = 'aft_consent';

    // Inject styles
    var css = document.createElement('style');
    css.textContent = [
        '#aft-cookie-banner{position:fixed;bottom:0;left:0;right:0;z-index:999999;',
        'background:#1e1e1e;color:#f0f0f0;padding:16px 24px;display:flex;',
        'align-items:center;justify-content:space-between;gap:16px;flex-wrap:wrap;',
        'box-shadow:0 -4px 20px rgba(0,0,0,0.35);font-family:sans-serif;font-size:14px;line-height:1.5;}',
        '#aft-cookie-banner p{margin:0;flex:1;min-width:220px;}',
        '#aft-cookie-banner a{color:#fdb1a5;text-decoration:underline;}',
        '.aft-cb-btns{display:flex;gap:10px;flex-shrink:0;flex-wrap:wrap;}',
        '#aft-cb-manage{background:transparent;color:#ccc;border:1px solid #555;',
        'padding:8px 14px;border-radius:6px;cursor:pointer;font-size:13px;}',
        '#aft-cb-decline{background:transparent;color:#f0f0f0;border:1px solid #888;',
        'padding:8px 16px;border-radius:6px;cursor:pointer;font-size:14px;}',
        '#aft-cb-accept{background:#854c43;color:#fff;border:none;',
        'padding:8px 20px;border-radius:6px;cursor:pointer;font-size:14px;font-weight:600;}',
        '#aft-cb-accept:hover{background:#6d3830;}',
        '#aft-cb-decline:hover{background:rgba(255,255,255,0.06);}',
        '#aft-cb-manage:hover{background:rgba(255,255,255,0.06);}',
        '@media(max-width:600px){#aft-cookie-banner{flex-direction:column;align-items:flex-start;}',
        '.aft-cb-btns{width:100%;}}'
    ].join('');
    document.head.appendChild(css);

    function getConsent() {
        try { return localStorage.getItem(KEY); } catch (e) { return null; }
    }

    function setConsent(v) {
        try { localStorage.setItem(KEY, v); } catch (e) {}
    }

    function updateGtag(granted) {
        if (typeof gtag !== 'function') return;
        var s = granted ? 'granted' : 'denied';
        gtag('consent', 'update', {
            analytics_storage: s,
            ad_storage: s,
            ad_user_data: s,
            ad_personalization: s
        });
    }

    function removeBanner() {
        var b = document.getElementById('aft-cookie-banner');
        if (b) b.parentNode.removeChild(b);
    }

    function accept() {
        setConsent('accepted');
        updateGtag(true);
        removeBanner();
    }

    function decline() {
        setConsent('declined');
        updateGtag(false);
        removeBanner();
    }

    function showBanner() {
        var lang = document.documentElement.lang || 'en';
        var isKo = lang === 'ko';
        var ppUrl = isKo ? '/privacy-policy-ko.html' : '/privacy-policy.html';

        var text = isKo
            ? '본 사이트는 서비스 분석(Google Analytics, Microsoft Clarity) 및 맞춤형 광고(Google AdSense) 제공을 위해 쿠키를 사용합니다. "모두 수락"을 클릭하면 모든 쿠키 사용에 동의하게 됩니다. <a href="' + ppUrl + '">개인정보처리방침</a>'
            : 'We use cookies for analytics (Google Analytics, Microsoft Clarity) and personalized advertising (Google AdSense). By clicking "Accept All" you consent to all cookies. <a href="' + ppUrl + '">Privacy Policy</a>';

        var acceptTxt = isKo ? '모두 수락' : 'Accept All';
        var declineTxt = isKo ? '거부' : 'Decline';

        var banner = document.createElement('div');
        banner.id = 'aft-cookie-banner';
        banner.setAttribute('role', 'dialog');
        banner.setAttribute('aria-label', isKo ? '쿠키 동의' : 'Cookie Consent');
        banner.innerHTML = '<p>' + text + '</p>' +
            '<div class="aft-cb-btns">' +
            '<button id="aft-cb-decline">' + declineTxt + '</button>' +
            '<button id="aft-cb-accept">' + acceptTxt + '</button>' +
            '</div>';
        document.body.appendChild(banner);

        document.getElementById('aft-cb-accept').addEventListener('click', accept);
        document.getElementById('aft-cb-decline').addEventListener('click', decline);
    }

    // Set gtag consent defaults BEFORE tags load (best effort)
    if (typeof gtag === 'function' && !getConsent()) {
        gtag('consent', 'default', {
            analytics_storage: 'denied',
            ad_storage: 'denied',
            ad_user_data: 'denied',
            ad_personalization: 'denied',
            wait_for_update: 500
        });
    }

    // On DOM ready
    function init() {
        var consent = getConsent();
        if (!consent) {
            showBanner();
        } else {
            updateGtag(consent === 'accepted');
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
