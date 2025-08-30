"use strict";

(function () {
  // ---------- Utils
  var $ = function (sel, parent) { return (parent || document).querySelector(sel); };
  var $$ = function (sel, parent) { return Array.prototype.slice.call((parent || document).querySelectorAll(sel)); };

  // ---------- DOM refs
  var header     = $('[data-header]');
  var navbar     = $('[data-navbar]');
  var overlay    = $('[data-overlay]');
  var btnOpen    = $('[data-nav-open-btn]');
  var btnClose   = $('[data-nav-close-btn]');
  var navLinks   = $$('[data-nav-link]');
  var ctaBtn     = $('.cta-btn');

  // ---------- State
  var lastFocused = null;
  var bodyOverflowBefore = "";

  // ---------- Focus trap helpers
  function focusables(container) {
    if (!container) return [];
    var nodes = container.querySelectorAll(
      'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    return Array.prototype.filter.call(nodes, function (el) {
      return el.tabIndex !== -1 && !el.hasAttribute('inert') && (el.offsetParent !== null || el.getClientRects().length);
    });
  }

  function trapFocus(e) {
    if (!navbar || !navbar.classList.contains('active')) return;
    if (e.key !== 'Tab') return;

    var f = focusables(navbar);
    if (!f.length) return;

    var first = f[0];
    var last  = f[f.length - 1];

    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }

  // ---------- NAV open/close
  function openNav() {
    if (!navbar) return;
    lastFocused = document.activeElement;

    navbar.classList.add('active');
    if (overlay) overlay.classList.add('active');
    if (btnOpen)  btnOpen.setAttribute('aria-expanded', 'true');
    navbar.setAttribute('aria-hidden', 'false');

    // freeze scroll
    bodyOverflowBefore = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    // focus first focusable
    var f = focusables(navbar);
    if (f.length) f[0].focus();
  }

  function closeNav() {
    if (!navbar) return;

    navbar.classList.remove('active');
    if (overlay) overlay.classList.remove('active');
    if (btnOpen)  btnOpen.setAttribute('aria-expanded', 'false');
    navbar.setAttribute('aria-hidden', 'true');

    // restore scroll
    document.body.style.overflow = bodyOverflowBefore || '';

    // restore focus
    if (lastFocused && typeof lastFocused.focus === 'function') {
      lastFocused.focus();
    }
  }

  // Buttons & overlay
  if (btnOpen)  btnOpen.addEventListener('click', openNav);
  if (btnClose) btnClose.addEventListener('click', closeNav);
  if (overlay)  overlay.addEventListener('click', closeNav);

  // Fermer le menu quand on clique un lien
  navLinks.forEach(function (link) {
    link.addEventListener('click', closeNav);
  });

  // ESC pour fermer
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && navbar && navbar.classList.contains('active')) {
      closeNav();
    }
  });

  // Trap focus dans le menu
  document.addEventListener('keydown', trapFocus);

  // Sécurité: si on repasse en desktop, on ferme le menu mobile
  window.addEventListener('resize', function () {
    if (window.innerWidth >= 1200) closeNav();
  });

  // ---------- Header "active" au scroll (comme avant, mais throttlé)
  var ticking = false;
  function onScroll() {
    if (!header) return;
    if (window.scrollY >= 400) header.classList.add('active');
    else header.classList.remove('active');
  }
  window.addEventListener('scroll', function () {
    if (!ticking) {
      window.requestAnimationFrame(function () {
        onScroll();
        ticking = false;
      });
      ticking = true;
    }
  });
  onScroll();

  // ---------- Smooth scroll pour tous les liens d’ancre (#...)
  function smoothScrollTo(targetId) {
    if (!targetId || targetId === '#') return;
    var el = document.getElementById(targetId.replace('#', ''));
    if (!el) return;

    // offset pour header sticky
    var headerH = header ? header.offsetHeight : 0;
    var y = el.getBoundingClientRect().top + window.pageYOffset - headerH;

    window.scrollTo({ top: y, behavior: 'smooth' });
  }

  document.addEventListener('click', function (e) {
    var a = e.target.closest('a[href^="#"]');
    if (!a) return;
    var href = a.getAttribute('href');
    if (!href || href.length < 2) return;

    var id = href;
    if (document.getElementById(id.slice(1))) {
      e.preventDefault();
      closeNav();
      smoothScrollTo(id);
    }
  });

  // ---------- Bouton CTA => #home
  if (ctaBtn) {
    ctaBtn.addEventListener('click', function (e) {
      e.preventDefault();
      closeNav();
      smoothScrollTo('#home');
    });
  }
})();
