(function () {
  'use strict';

  var header = document.getElementById('site-header');
  var progress = document.querySelector('.scroll-progress');
  var navToggle = document.querySelector('.nav-toggle');
  var mobileMenu = document.getElementById('mobile-menu');
  var body = document.body;

  /* ---------- scroll state: header + progress bar ---------- */
  function onScroll() {
    var y = window.scrollY || document.documentElement.scrollTop;
    if (header) header.classList.toggle('scrolled', y > 12);
    if (progress) {
      var max = document.documentElement.scrollHeight - window.innerHeight;
      var p = max > 0 ? y / max : 0;
      progress.style.transform = 'scaleX(' + p + ')';
    }
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- mobile menu ---------- */
  function setMenu(open) {
    if (!navToggle || !mobileMenu) return;
    mobileMenu.hidden = !open;
    navToggle.setAttribute('aria-expanded', String(open));
    navToggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    body.classList.toggle('menu-open', open);
  }

  if (navToggle) {
    navToggle.addEventListener('click', function () {
      setMenu(navToggle.getAttribute('aria-expanded') !== 'true');
    });
  }
  if (mobileMenu) {
    mobileMenu.addEventListener('click', function (e) {
      if (e.target.closest('a')) setMenu(false);
    });
  }
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') setMenu(false);
  });
  window.addEventListener('resize', function () {
    if (window.innerWidth > 960) setMenu(false);
  });

  /* ---------- scrollspy: nav links ---------- */
  var sectionIds = ['top', 'packages', 'paint', 'transform', 'mobile', 'process', 'book'];
  var navLinks = Array.prototype.slice.call(document.querySelectorAll('.site-nav a'));

  function setCurrent(id) {
    navLinks.forEach(function (link) {
      link.classList.toggle('active', link.getAttribute('href') === '#' + id);
    });
  }

  if ('IntersectionObserver' in window) {
    var spyObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) setCurrent(entry.target.id);
      });
    }, { rootMargin: '-40% 0px -55% 0px' });

    sectionIds.forEach(function (id) {
      var section = document.getElementById(id);
      if (section) spyObserver.observe(section);
    });
  }

  /* ---------- cursor spotlight on cards ---------- */
  var spotEls = Array.prototype.slice.call(document.querySelectorAll('.spot'));
  var spotLast = 0;

  if (spotEls.length && window.matchMedia('(hover: hover)').matches) {
    document.addEventListener('mousemove', function (e) {
      var now = Date.now();
      if (now - spotLast < 16) return;
      spotLast = now;
      spotEls.forEach(function (el) {
        var r = el.getBoundingClientRect();
        if (e.clientX < r.left - 60 || e.clientX > r.right + 60 || e.clientY < r.top - 60 || e.clientY > r.bottom + 60) return;
        el.style.setProperty('--mx', (e.clientX - r.left) + 'px');
        el.style.setProperty('--my', (e.clientY - r.top) + 'px');
      });
    }, { passive: true });
  }

  /* ---------- before/after comparison sliders ---------- */
  function initBA(slider) {
    var handle = slider.querySelector('.ba-handle');
    if (!handle) return;

    var pos = parseFloat(handle.getAttribute('aria-valuenow')) || 50;
    var tagRanges = null;
    var TAG_MARGIN = 80;

    function measureTags() {
      var sr = slider.getBoundingClientRect();
      var out = { before: null, after: null };
      var b = slider.querySelector('.ba-tag-before');
      var a = slider.querySelector('.ba-tag-after');
      if (b) {
        var rb = b.getBoundingClientRect();
        out.before = { left: rb.left - sr.left, right: rb.right - sr.left };
      }
      if (a) {
        var ra = a.getBoundingClientRect();
        out.after = { left: ra.left - sr.left, right: ra.right - sr.left };
      }
      tagRanges = out;
    }

    function updateHandleState() {
      if (!tagRanges) measureTags();
      var hx = slider.offsetWidth * pos / 100;
      slider.classList.toggle('hide-before', !!tagRanges.before && hx > tagRanges.before.left - TAG_MARGIN && hx < tagRanges.before.right + TAG_MARGIN);
      slider.classList.toggle('hide-after', !!tagRanges.after && hx > tagRanges.after.left - TAG_MARGIN && hx < tagRanges.after.right + TAG_MARGIN);
    }

    function setPos(p) {
      pos = Math.min(100, Math.max(0, p));
      slider.style.setProperty('--ba', pos);
      handle.setAttribute('aria-valuenow', Math.round(pos));
      updateHandleState();
    }
    setPos(pos);

    window.addEventListener('resize', function () {
      tagRanges = null;
      updateHandleState();
    });

    function xToPos(clientX) {
      var r = slider.getBoundingClientRect();
      return ((clientX - r.left) / r.width) * 100;
    }

    slider.addEventListener('dragstart', function (e) {
      e.preventDefault();
    });

    slider.addEventListener('pointerdown', function (e) {
      slider.classList.add('dragging');
      try { slider.setPointerCapture(e.pointerId); } catch (err) {}
      setPos(xToPos(e.clientX));
    });

    slider.addEventListener('pointermove', function (e) {
      if (!slider.classList.contains('dragging')) return;
      setPos(xToPos(e.clientX));
    });

    ['pointerup', 'pointercancel'].forEach(function (ev) {
      slider.addEventListener(ev, function () {
        slider.classList.remove('dragging');
      });
    });

    handle.addEventListener('keydown', function (e) {
      var step = e.shiftKey ? 10 : 5;
      var map = { ArrowLeft: -step, ArrowRight: step, Home: -100, End: 100 };
      if (map[e.key] === undefined) return;
      e.preventDefault();
      setPos(pos + map[e.key]);
    });
  }

  document.querySelectorAll('.ba-slider').forEach(initBA);

  /* ---------- paint care row expand ---------- */
  var toggles = document.querySelectorAll('.pc-toggle');
  toggles.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var open = btn.getAttribute('aria-expanded') === 'true';
      btn.setAttribute('aria-expanded', String(!open));
      btn.classList.toggle('is-open', !open);
      var details = btn.querySelector('.pc-details');
      if (details) details.hidden = open;
    });
  });

  /* ---------- theme toggle ---------- */
  var themeToggle = document.querySelector('.theme-toggle');
  var themeMeta = document.querySelector('meta[name="theme-color"]');

  function syncThemeUI() {
    var cur = document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
    if (themeToggle) themeToggle.setAttribute('aria-pressed', cur === 'light' ? 'true' : 'false');
    if (themeMeta) themeMeta.setAttribute('content', cur === 'light' ? '#f1f2f4' : '#050607');
  }

  if (themeToggle) {
    themeToggle.addEventListener('click', function () {
      var next = document.documentElement.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
      document.documentElement.setAttribute('data-theme', next);
      try { localStorage.setItem('apex-theme', next); } catch (e) {}
      syncThemeUI();
    });
  }
  syncThemeUI();
})();
