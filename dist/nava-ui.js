/*! nava-ui v0.2.0 | Apache-2.0 | https://github.com/Allan-Nava/nava-ui */
/*
 * nava-ui — optional behaviour. The CSS works without this file.
 *
 *   1. Theme toggle   any element with [data-nv-theme-toggle]
 *   2. Card spotlight any container with [data-nv-spotlight]
 *   3. Dismiss        a button with [data-nv-dismiss] inside an alert or a toast
 *   4. Toasts         navaUI.toast(message, { tone, title, timeout })
 *
 * Load it with `defer`. To avoid a flash of the wrong theme, also put the
 * three-line snippet from the README in <head>: it must run before first paint.
 */
(function () {
  'use strict';

  var root = document.documentElement;
  var KEY = 'nv-theme';

  function current() {
    var chosen = root.getAttribute('data-theme');
    if (chosen === 'light' || chosen === 'dark') return chosen;
    return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  }

  function label(button) {
    var next = current() === 'dark' ? 'light' : 'dark';
    button.setAttribute('aria-label', 'Switch to ' + next + ' theme');
  }

  function setTheme(theme) {
    root.setAttribute('data-theme', theme);
    try {
      localStorage.setItem(KEY, theme);
    } catch (e) {
      /* storage denied (private mode, blocked cookies): the choice lasts for this page */
    }
    document.dispatchEvent(new CustomEvent('nv:theme', { detail: { theme: theme } }));
  }

  var toggles = document.querySelectorAll('[data-nv-theme-toggle]');
  Array.prototype.forEach.call(toggles, function (button) {
    label(button);
    button.addEventListener('click', function () {
      setTheme(current() === 'dark' ? 'light' : 'dark');
      Array.prototype.forEach.call(toggles, label);
    });
  });

  var fine = window.matchMedia('(hover: hover) and (prefers-reduced-motion: no-preference)');
  var areas = document.querySelectorAll('[data-nv-spotlight]');
  Array.prototype.forEach.call(areas, function (area) {
    area.addEventListener('pointermove', function (event) {
      if (!fine.matches) return;
      var card = event.target.closest('.nv-card');
      if (!card) return;
      var box = card.getBoundingClientRect();
      card.style.setProperty('--nv-mx', event.clientX - box.left + 'px');
      card.style.setProperty('--nv-my', event.clientY - box.top + 'px');
    });
  });

  /* Dismiss: a button with [data-nv-dismiss] removes the alert or toast it is in. */
  function leave(el) {
    if (!el || el.classList.contains('is-leaving')) return;
    el.classList.add('is-leaving');
    var gone = function () {
      if (el.parentNode) el.parentNode.removeChild(el);
    };
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) gone();
    else setTimeout(gone, 220);
  }

  document.addEventListener('click', function (event) {
    var button = event.target.closest && event.target.closest('[data-nv-dismiss]');
    if (button) leave(button.closest('.nv-toast, .nv-alert'));
  });

  /* Toasts. The region is the live region: a region added together with its
     first message is often not announced, so it is created when this script
     loads and kept, empty, until a toast needs it. Text goes in with
     textContent, never as HTML. */
  var MARKS = { info: 'i', success: '\u2713', warning: '!', danger: '\u00d7' };

  function region() {
    var el = document.querySelector('.nv-toasts');
    if (el) return el;
    el = document.createElement('div');
    el.className = 'nv-toasts';
    el.setAttribute('role', 'status');
    el.setAttribute('aria-live', 'polite');
    document.body.appendChild(el);
    return el;
  }

  region();

  function toast(message, options) {
    options = options || {};
    var tone = MARKS[options.tone] ? options.tone : 'info';
    var timeout = options.timeout === undefined ? 5000 : options.timeout;

    var el = document.createElement('div');
    el.className = 'nv-toast nv-toast--' + tone;
    /* An error interrupts; everything else waits its turn in the polite region. */
    if (tone === 'danger') el.setAttribute('role', 'alert');

    var icon = document.createElement('span');
    icon.className = 'nv-alert__icon';
    icon.setAttribute('aria-hidden', 'true');
    icon.textContent = MARKS[tone];

    var body = document.createElement('div');
    body.className = 'nv-alert__body';
    if (options.title) {
      var title = document.createElement('p');
      title.className = 'nv-alert__title';
      title.textContent = options.title;
      body.appendChild(title);
    }
    var text = document.createElement('p');
    text.className = 'nv-alert__text';
    text.textContent = message;
    body.appendChild(text);

    var close = document.createElement('button');
    close.type = 'button';
    close.className = 'nv-alert__close';
    close.setAttribute('data-nv-dismiss', '');
    close.setAttribute('aria-label', options.dismissLabel || 'Dismiss');
    close.textContent = '\u00d7';

    el.appendChild(icon);
    el.appendChild(body);
    el.appendChild(close);
    region().appendChild(el);

    /* The timer stops while the pointer or the focus is on the toast, so
       nobody loses a message they are reading. timeout 0 keeps it until dismissed. */
    var timer = null;
    function start() {
      if (timeout > 0) timer = setTimeout(function () { leave(el); }, timeout);
    }
    function stop() {
      clearTimeout(timer);
    }
    el.addEventListener('pointerenter', stop);
    el.addEventListener('pointerleave', start);
    el.addEventListener('focusin', stop);
    el.addEventListener('focusout', start);
    start();

    return el;
  }

  window.navaUI = { setTheme: setTheme, theme: current, toast: toast, dismiss: leave };
})();
