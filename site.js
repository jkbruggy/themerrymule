/* ===== The Merry Mule: easy-to-edit settings ===== */
var MM_CONFIG = {
  // Google Apps Script web app URL that saves form requests to the Google Sheet
  formEndpoint: 'https://script.google.com/macros/s/AKfycbyzwssvNi2FhKbehbcLOIPVpn_CrfeaIeHcEiWuyPx0MTBF3xP8xthqlI5eTt3E6wCaSg/exec',
  muleStatus: 'Right now The Merry Mule is delivering on Johns Island!',
  muleUpdated: '11/11/2026 at 2:14 PM',
  milestones: [
    { value: '0', label: 'Trees delivered' },
    { value: '0', label: 'Wreaths delivered' },
    { value: '0', label: 'Homes made merry' }
  ]
};
/* ================================================== */

(function () {
  'use strict';
  var dl = window.dataLayer = window.dataLayer || [];
  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }

  /* Decorative strips */
  var TREE = '<svg width="22" height="30" viewBox="0 0 22 30"><path d="M11 1 L20 15 H15 L21 25 H1 L7 15 H2 Z" fill="#FFFFFF"/><rect x="9" y="25" width="4" height="4" fill="#FFFFFF"/></svg>';
  $$('.mm-strip').forEach(function (el) {
    var dot = '<svg width="10" height="10" viewBox="0 0 10 10"><circle cx="5" cy="5" r="5" fill="' + el.getAttribute('data-dot') + '"/></svg>';
    var h = '';
    for (var i = 0; i < 61; i++) h += (i % 2 === 0 ? TREE : dot);
    el.innerHTML = h;
  });

  /* Snow */
  var FLAKE = '<g stroke="#FFFFFF" stroke-width="1.2" stroke-linecap="round"><line x1="10" y1="1" x2="10" y2="19"/><line x1="2.2" y1="5.5" x2="17.8" y2="14.5"/><line x1="2.2" y1="14.5" x2="17.8" y2="5.5"/></g>';
  $$('.mm-snow').forEach(function (el) {
    var count = +el.getAttribute('data-count'), fall = +el.getAttribute('data-fall'), seed = +el.getAttribute('data-seed');
    var k = fall / 1200, h = '';
    el.style.setProperty('--fall', fall + 'px');
    for (var i = 0; i < count; i++) {
      var r = function (n) { return (((i + seed) * n * 9301 + 49297) % 233280) / 233280; };
      var near = r(7) > 0.7, flake = r(11) > 0.72;
      var size = flake ? (near ? 12 + r(3) * 6 : 7 + r(3) * 4) : (near ? 3 + r(5) * 1.5 : 1.5 + r(5) * 1.5);
      var dur = (near ? 9 + r(13) * 5 : 15 + r(13) * 10) * Math.max(k, 0.3);
      var st = 'left:' + (r(17) * 100).toFixed(1) + '%;width:' + size.toFixed(1) + 'px;height:' + size.toFixed(1) + 'px;opacity:' + (near ? 0.55 + r(19) * 0.3 : 0.2 + r(19) * 0.3).toFixed(2) + ';animation:mmSnowFall ' + dur.toFixed(1) + 's linear -' + (r(23) * dur).toFixed(1) + 's infinite';
      h += flake ? '<svg viewBox="0 0 20 20" style="' + st + '">' + FLAKE + '</svg>' : '<div style="' + st + ';border-radius:50%;background:#FFFFFF"></div>';
    }
    el.innerHTML = h;
  });

  /* Mule status + milestones */
  var ms = $('#mm-mule-status'); if (ms) ms.textContent = MM_CONFIG.muleStatus;
  var mu = $('#mm-mule-updated'); if (mu) mu.textContent = MM_CONFIG.muleUpdated;
  var mw = $('#mm-milestones');
  if (mw) mw.innerHTML = MM_CONFIG.milestones.map(function (m) {
    return '<div class="mm-card" style="align-items:center;gap:6px"><p style="margin:0;font-family:var(--head);font-weight:700;font-size:64px;line-height:1;color:var(--red)">' + m.value + '</p><p style="margin:0;font-size:20px;font-weight:700;color:var(--green)">' + m.label + '</p></div>';
  }).join('');

  /* Menu + jump links */
  var burger = $('#mm-burger'), menu = $('#mm-menu');
  function setMenu(open) {
    if (!burger) return;
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    menu.classList.toggle('open', open);
  }
  if (burger) burger.addEventListener('click', function () { setMenu(burger.getAttribute('aria-expanded') !== 'true'); });
  $$('[data-jump]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var el = document.getElementById(a.getAttribute('data-jump'));
      if (!el) return;
      e.preventDefault();
      setMenu(false);
      setTimeout(function () { el.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 60);
    });
  });

  /* Call / text click tracking for GTM */
  $$('a[href^="tel:"],a[href^="sms:"]').forEach(function (a) {
    a.addEventListener('click', function () {
      dl.push({ event: a.getAttribute('href').indexOf('sms:') === 0 ? 'text_click' : 'call_click', link_location: a.getAttribute('data-call') || 'other' });
    });
  });

  /* ===== Request form ===== */
  var form = $('#mm-form');
  if (!form) return;
  var pages = $$('.mm-page', form), N = pages.length, pg = 1, started = false;
  var nudge = $('#mm-nudge'), thanks = $('#mm-thanks'), submitBtn = $('#mm-submit');
  var MSGS = [[0, "Let's get The Merry Mule moving!"], [1, 'Hitching up the mule...'], [15, 'Loading the wagon...'], [30, 'Checking the route...'], [45, 'Packing the hot cocoa...'], [60, 'Saddling up...'], [75, 'Almost ready to roll!'], [90, 'One more stop!'], [100, "All set! We'll be on our way soon."]];
  var NEXT = '<svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="#FFFFFF" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="13 6 19 12 13 18"/></svg>';
  var BACK = '<svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="#FFFFFF" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="11 6 5 12 11 18"/></svg>';
  $$('.mm-circ.next', form).forEach(function (b) { b.innerHTML = NEXT; b.addEventListener('click', goNext); });
  $$('.mm-circ.back', form).forEach(function (b) { b.innerHTML = BACK; b.addEventListener('click', goBack); });

  var dateIn = form.elements.date;
  if (dateIn) { var t = new Date(); dateIn.min = t.getFullYear() + '-' + ('0' + (t.getMonth() + 1)).slice(-2) + '-' + ('0' + t.getDate()).slice(-2); }

  function val(name) { var el = form.elements[name]; if (!el) return ''; if (el.type === 'checkbox') return el.checked ? 'yes' : ''; return String(el.value || '').trim(); }
  function treeVal() { var c = $('input[name=tree]:checked', form); return c ? c.value : ''; }
  function isDone(k) {
    if (k === 'tree') return treeVal() !== '';
    if (k === 'consent') return form.elements.consent_service.checked;
    if (k === 'lot' && treeVal() === 'no') return true;
    if (k === 'email') return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val('email'));
    if (k === 'phone') return val('phone').replace(/\D/g, '').length >= 10;
    return val(k) !== '';
  }
  function reqs(p) { var r = pages[p - 1].getAttribute('data-req'); return r ? r.split(',') : []; }
  function pageDone(p) { return reqs(p).every(isDone); }
  function update() {
    var r = reqs(pg), frac = r.length ? r.filter(isDone).length / r.length : 0;
    var pct = Math.min(100, Math.round(((pg - 1 + frac) / N) * 100)), msg = MSGS[0][1];
    MSGS.forEach(function (m) { if (pct >= m[0]) msg = m[1]; });
    $('#mm-pct').textContent = pct + '%';
    $('#mm-tripmsg').textContent = msg;
    $('#mm-wagon').style.left = (12 + 45 * (pct / 100)).toFixed(1) + '%';
    $('#mm-lotlabel').textContent = treeVal() === 'no' ? 'Tree lot (optional)' : 'Which tree lot?';
  }
  function showNudge(text) { nudge.textContent = text; nudge.hidden = false; }
  function hideNudge() { nudge.hidden = true; }
  function scrollToForm() { setTimeout(function () { if (form.getBoundingClientRect().top < 0) form.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 30); }
  function focusField() {
    setTimeout(function () {
      var el = $('input[type=text],input[type=tel],input[type=email],input[type=date],select,textarea', pages[pg - 1]);
      if (el && window.matchMedia('(hover: hover)').matches) el.focus({ preventScroll: true });
    }, 40);
  }
  function show(p) {
    pg = p;
    pages.forEach(function (el, i) { el.hidden = i !== pg - 1; });
    hideNudge(); update(); scrollToForm(); focusField();
  }
  function goNext() {
    if (!pageDone(pg)) {
      var msg = 'Hold your reindeer! Fill this in to keep the wagon rolling.';
      if (pg === 2 && val('phone')) msg = 'Hold your reindeer! Please enter a full 10-digit phone number.';
      if (pg === 3 && val('email')) msg = 'Hold your reindeer! That email address looks a little off.';
      showNudge(msg); return;
    }
    if (!started) { started = true; dl.push({ event: 'form_start', form_name: 'delivery_request' }); }
    if (pg < N) show(pg + 1);
  }
  function goBack() { if (pg > 1) show(pg - 1); }

  form.addEventListener('input', function () { hideNudge(); update(); });
  form.addEventListener('change', function () { hideNudge(); update(); });
  form.addEventListener('keydown', function (e) {
    if (e.key !== 'Enter') return;
    var t = e.target;
    if (t.tagName === 'TEXTAREA' && t.name === 'notes') return;
    if (t.tagName === 'BUTTON') return;
    e.preventDefault();
    if (pg < N) goNext(); else form.requestSubmit ? form.requestSubmit() : submit();
  });
  form.addEventListener('submit', function (e) { e.preventDefault(); submit(); });

  function submit() {
    if (!pageDone(N)) { showNudge("The Merry Mule isn't home yet! Check the required box to finish the trip."); return; }
    if (val('company')) { done(); return; } // spam bot
    var data = {
      first: val('first'), last: val('last'), phone: val('phone'), email: val('email'),
      address: val('address'), has_tree: treeVal() === 'yes' ? 'Yes' : 'No, needs shopping help',
      lot: val('lot'), height: val('height'), wreaths: val('wreaths'), date: val('date'), notes: val('notes'),
      consent_service: form.elements.consent_service.checked ? 'Yes' : 'No',
      consent_marketing: form.elements.consent_marketing.checked ? 'Yes' : 'No',
      page: location.href
    };
    submitBtn.disabled = true; submitBtn.textContent = 'Hitching up...';
    var body = new URLSearchParams(data);
    var ok = function () { done(data); };
    var fail = function () {
      submitBtn.disabled = false; submitBtn.textContent = 'Bring My Tree Home!';
      showNudge('Oh no, the mule tripped! Please try again, or call or text (843) 564-3104.');
    };
    if (!/^https:\/\//.test(MM_CONFIG.formEndpoint)) { fail(); return; }
    fetch(MM_CONFIG.formEndpoint, { method: 'POST', mode: 'no-cors', body: body }).then(ok, fail);
  }
  function done(data) {
    if (data) dl.push({ event: 'generate_lead', form_name: 'delivery_request', has_tree: data.has_tree, wreaths: data.wreaths, marketing_opt_in: data.consent_marketing });
    form.hidden = true; thanks.hidden = false;
    setTimeout(function () { if (thanks.getBoundingClientRect().top < 0) thanks.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 30);
  }
  $('#mm-again').addEventListener('click', function () {
    form.reset(); started = false;
    submitBtn.disabled = false; submitBtn.textContent = 'Bring My Tree Home!';
    thanks.hidden = true; form.hidden = false; show(1);
  });
  update();
})();
