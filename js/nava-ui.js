/*
 * nava-ui — optional behaviour. The CSS works without this file.
 *
 *   1. Theme toggle   any element with [data-nv-theme-toggle]
 *   2. Card spotlight any container with [data-nv-spotlight]
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

  window.navaUI = { setTheme: setTheme, theme: current };
})();
