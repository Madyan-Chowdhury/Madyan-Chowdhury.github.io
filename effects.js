/* ============================================================
   Madyan Chowdhury — EXPLODED effects layer.
   Vanilla JS, zero dependencies. Pure progressive enhancement:
   every effect here is decorative and self-disables under
   prefers-reduced-motion, on touch (cursor/tilt), or if JS
   simply never runs. Content is never hidden by this file.
   ============================================================ */
(function () {
  'use strict';

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  var coarse = window.matchMedia('(pointer: coarse)');
  var smallScreen = window.matchMedia('(max-width: 720px)');

  // Master kill switch. If the user prefers reduced motion, do nothing at all —
  // the site is already a clean, readable static page via CSS.
  if (reduce.matches) return;

  var rafThrottle = function (fn) {
    var queued = false, lastArgs;
    return function () {
      lastArgs = arguments;
      if (queued) return;
      queued = true;
      requestAnimationFrame(function () { queued = false; fn.apply(null, lastArgs); });
    };
  };
  var rand = function (min, max) { return Math.random() * (max - min) + min; };

  /* ---------------------------------------------------------
     1. GLITCH — activate CSS RGB-split on headers/awards
     --------------------------------------------------------- */
  document.querySelectorAll('[data-glitch]').forEach(function (el) {
    el.classList.add('glitch-on');
  });

  /* ---------------------------------------------------------
     2. REVEAL SCATTER — randomize explode offsets per element
     --------------------------------------------------------- */
  document.querySelectorAll('.reveal--explode').forEach(function (el) {
    el.style.setProperty('--rx', rand(-40, 40).toFixed(0) + 'px');
    el.style.setProperty('--rr', rand(-4, 4).toFixed(1) + 'deg');
  });

  /* ---------------------------------------------------------
     3. HERO WORD EXPLODE-IN on load
     --------------------------------------------------------- */
  var heroTitle = document.getElementById('hero-title');
  if (heroTitle) {
    var words = heroTitle.querySelectorAll('.word');
    words.forEach(function (w) {
      w.style.setProperty('--wx', rand(-160, 160).toFixed(0) + 'px');
      w.style.setProperty('--wy', rand(-120, 120).toFixed(0) + 'px');
      w.style.setProperty('--wr', rand(-25, 25).toFixed(0) + 'deg');
      w.style.setProperty('--ws', rand(1.3, 2.2).toFixed(2));
    });
    heroTitle.classList.add('is-armed');
    // Stagger the reassembly slightly for a mechanical "snap together" feel.
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        heroTitle.classList.remove('is-armed');
      });
    });
  }

  /* ---------------------------------------------------------
     4. COUNT-UP stats
     --------------------------------------------------------- */
  var counts = document.querySelectorAll('.count');
  if ('IntersectionObserver' in window && counts.length) {
    var fmt = function (n) { return n.toLocaleString('en-US'); };
    var countObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        var el = e.target;
        countObs.unobserve(el);
        var target = parseInt(el.getAttribute('data-count'), 10) || 0;
        var suffix = el.getAttribute('data-suffix') || '';
        var start = performance.now(), dur = 1100;
        (function tick(now) {
          var p = Math.min((now - start) / dur, 1);
          var eased = 1 - Math.pow(1 - p, 3);
          el.textContent = fmt(Math.round(target * eased)) + suffix;
          if (p < 1) requestAnimationFrame(tick);
        })(start);
      });
    }, { threshold: 0.6 });
    counts.forEach(function (c) { countObs.observe(c); });
  }

  /* ---------------------------------------------------------
     5. PARALLAX — pointer + scroll on [data-depth] hero layers
     --------------------------------------------------------- */
  var depthEls = Array.prototype.slice.call(document.querySelectorAll('[data-depth]'));
  var pointerX = 0, pointerY = 0;
  function applyParallax() {
    var sc = window.scrollY;
    depthEls.forEach(function (el) {
      var d = parseFloat(el.getAttribute('data-depth')) || 0;
      var tx = pointerX * d * 26;
      var ty = pointerY * d * 26 - sc * d * 0.15;
      el.style.transform = 'translate3d(' + tx.toFixed(1) + 'px,' + ty.toFixed(1) + 'px,0)';
    });
  }
  var parallaxThrottled = rafThrottle(applyParallax);
  window.addEventListener('scroll', parallaxThrottled, { passive: true });

  /* ---------------------------------------------------------
     6. CUSTOM CURSOR + MAGNETIC (non-touch only)
     --------------------------------------------------------- */
  // Custom cursor removed — the native OS cursor is used everywhere.
  var magnets = Array.prototype.slice.call(document.querySelectorAll('[data-magnetic]'));

  if (!coarse.matches) {
    // Feed the hero parallax from pointer position (no custom cursor drawn)
    window.addEventListener('pointermove', function (e) {
      if (e.pointerType === 'touch') return;
      pointerX = (e.clientX / window.innerWidth - 0.5) * 2;
      pointerY = (e.clientY / window.innerHeight - 0.5) * 2;
      parallaxThrottled();
    }, { passive: true });

    // Magnetic pull on tagged interactive elements
    magnets.forEach(function (el) {
      el.addEventListener('pointermove', function (e) {
        var r = el.getBoundingClientRect();
        var mx = e.clientX - (r.left + r.width / 2);
        var my = e.clientY - (r.top + r.height / 2);
        el.style.transform = 'translate(' + (mx * 0.28).toFixed(1) + 'px,' + (my * 0.4).toFixed(1) + 'px)';
      });
      el.addEventListener('pointerleave', function () { el.style.transform = ''; });
    });
  }

  /* ---------------------------------------------------------
     7. 3D TILT on project cards (non-touch only)
     --------------------------------------------------------- */
  if (!coarse.matches) {
    document.querySelectorAll('[data-tilt]').forEach(function (card) {
      var maxTilt = 6; // degrees — subtle, keeps text readable
      card.addEventListener('pointerenter', function () { card.classList.add('tilt-ready'); });
      card.addEventListener('pointermove', function (e) {
        var r = card.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width - 0.5;
        var py = (e.clientY - r.top) / r.height - 0.5;
        card.style.transform =
          'perspective(900px) rotateX(' + (-py * maxTilt).toFixed(2) + 'deg) rotateY(' +
          (px * maxTilt).toFixed(2) + 'deg)';
      });
      card.addEventListener('pointerleave', function () {
        card.classList.remove('tilt-ready');
        card.style.transform = '';
      });
    });
  }

  /* ---------------------------------------------------------
     8. CANVAS blueprint particle field, warps toward cursor.
        Capped counts, rAF, paused when tab hidden / off-screen.
     --------------------------------------------------------- */
  var canvas = document.getElementById('fx-canvas');
  if (canvas && canvas.getContext) {
    var ctx = canvas.getContext('2d');
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var W = 0, H = 0, particles = [], running = true, mouse = { x: -999, y: -999 };
    var linkDist = smallScreen.matches ? 90 : 130;

    function resize() {
      W = canvas.clientWidth; H = canvas.clientHeight;
      canvas.width = Math.floor(W * dpr);
      canvas.height = Math.floor(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      // Particle count scales with area but hard-capped for performance.
      var target = Math.round((W * H) / 26000);
      target = Math.max(24, Math.min(target, smallScreen.matches ? 42 : 90));
      particles = [];
      for (var i = 0; i < target; i++) {
        particles.push({
          x: Math.random() * W, y: Math.random() * H,
          vx: rand(-0.25, 0.25), vy: rand(-0.25, 0.25),
          r: rand(0.6, 1.8)
        });
      }
    }

    function step() {
      if (!running) return;
      ctx.clearRect(0, 0, W, H);
      for (var i = 0; i < particles.length; i++) {
        var p = particles[i];
        // Warp toward cursor (gentle attraction inside a radius)
        var dx = mouse.x - p.x, dy = mouse.y - p.y;
        var d2 = dx * dx + dy * dy;
        if (d2 < 26000) {
          var f = (26000 - d2) / 26000 * 0.015;
          p.vx += dx * f * 0.02;
          p.vy += dy * f * 0.02;
        }
        p.x += p.vx; p.y += p.vy;
        p.vx *= 0.99; p.vy *= 0.99;
        // wrap
        if (p.x < 0) p.x = W; else if (p.x > W) p.x = 0;
        if (p.y < 0) p.y = H; else if (p.y > H) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255,93,31,0.5)';
        ctx.fill();

        // link nearby particles — "blueprint" web
        for (var j = i + 1; j < particles.length; j++) {
          var q = particles[j];
          var lx = p.x - q.x, ly = p.y - q.y;
          var ld = Math.sqrt(lx * lx + ly * ly);
          if (ld < linkDist) {
            ctx.globalAlpha = (1 - ld / linkDist) * 0.28;
            ctx.strokeStyle = '#ff5d1f';
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(q.x, q.y);
            ctx.stroke();
            ctx.globalAlpha = 1;
          }
        }
      }
      requestAnimationFrame(step);
    }

    window.addEventListener('pointermove', function (e) {
      if (e.pointerType === 'touch') return;
      mouse.x = e.clientX; mouse.y = e.clientY;
    }, { passive: true });
    window.addEventListener('pointerleave', function () { mouse.x = mouse.y = -999; });

    // Pause when tab hidden (perf) and when scrolled far past the fold isn't
    // needed since it's fixed full-screen; visibility handles the main win.
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) { running = false; }
      else if (!running) { running = true; step(); }
    });

    window.addEventListener('resize', rafThrottle(resize), { passive: true });
    resize();
    step();
  }

})();
