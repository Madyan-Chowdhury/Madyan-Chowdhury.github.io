/* Madyan Chowdhury — portfolio interactions.
   Vanilla JS, progressive enhancement only:
   1. Footer year
   2. Scroll-reveal via IntersectionObserver
   3. Gallery lightbox: click-to-zoom, arrow-key nav, Esc close,
      focus management, respects prefers-reduced-motion.
   4. Disabled resume placeholder guard.
*/
(function () {
  'use strict';

  // Flag JS availability so CSS can hide .reveal elements pre-animation.
  document.documentElement.classList.add('has-js');

  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---------- Footer year ----------
  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  // ---------- Resume placeholder guard ----------
  document.querySelectorAll('a[aria-disabled="true"]').forEach(function (a) {
    a.addEventListener('click', function (e) { e.preventDefault(); });
  });

  // ---------- Scroll reveal ----------
  var revealEls = document.querySelectorAll('.reveal');
  if (!('IntersectionObserver' in window) || reducedMotion) {
    revealEls.forEach(function (el) { el.classList.add('is-visible'); });
  } else {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach(function (el) { observer.observe(el); });
  }

  // ---------- Lightbox ----------
  var lightbox = document.getElementById('lightbox');
  if (!lightbox) return;

  var lightboxImg = document.getElementById('lightbox-img');
  var lightboxCaption = document.getElementById('lightbox-caption');
  var btnClose = document.getElementById('lightbox-close');
  var btnPrev = document.getElementById('lightbox-prev');
  var btnNext = document.getElementById('lightbox-next');

  var currentGroup = [];    // [{src, alt}]
  var currentIndex = 0;
  var groupLabel = '';
  var lastFocused = null;

  function showImage(i) {
    if (!currentGroup.length) return;
    currentIndex = (i + currentGroup.length) % currentGroup.length; // wrap
    var item = currentGroup[currentIndex];
    lightboxImg.src = item.src;
    lightboxImg.alt = item.alt || '';
    lightboxCaption.textContent =
      groupLabel + ' — ' + (currentIndex + 1) + ' / ' + currentGroup.length;
  }

  function openLightbox(group, index, label) {
    currentGroup = group;
    groupLabel = label || 'Photo';
    lastFocused = document.activeElement;
    showImage(index);
    lightbox.classList.add('is-open');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    btnClose.focus();
  }

  function closeLightbox() {
    lightbox.classList.remove('is-open');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    if (lastFocused && typeof lastFocused.focus === 'function') lastFocused.focus();
  }

  // Wire up each gallery independently so arrows stay within one project.
  document.querySelectorAll('.gallery').forEach(function (gallery) {
    var label = gallery.getAttribute('data-gallery') || 'Photo';
    var buttons = Array.prototype.slice.call(gallery.querySelectorAll('.gallery__item'));
    var group = buttons.map(function (btn) {
      var img = btn.querySelector('img');
      return { src: img.currentSrc || img.src, alt: img.alt };
    });
    buttons.forEach(function (btn, idx) {
      btn.setAttribute('aria-label', 'View photo ' + (idx + 1) + ' of ' + group.length + ': ' + group[idx].alt);
      btn.addEventListener('click', function () { openLightbox(group, idx, label); });
    });
  });

  btnClose.addEventListener('click', function (e) { e.stopPropagation(); closeLightbox(); });
  btnPrev.addEventListener('click', function (e) { e.stopPropagation(); showImage(currentIndex - 1); });
  btnNext.addEventListener('click', function (e) { e.stopPropagation(); showImage(currentIndex + 1); });

  // Backdrop click closes; clicks on the image/caption don't.
  lightbox.addEventListener('click', closeLightbox);
  lightbox.querySelector('.lightbox__figure').addEventListener('click', function (e) {
    e.stopPropagation();
  });

  // Keyboard: Esc closes, arrows navigate, Tab is trapped inside the dialog.
  document.addEventListener('keydown', function (e) {
    if (!lightbox.classList.contains('is-open')) return;
    if (e.key === 'Escape') {
      closeLightbox();
    } else if (e.key === 'ArrowLeft') {
      showImage(currentIndex - 1);
    } else if (e.key === 'ArrowRight') {
      showImage(currentIndex + 1);
    } else if (e.key === 'Tab') {
      var focusables = [btnClose, btnPrev, btnNext];
      var idx = focusables.indexOf(document.activeElement);
      e.preventDefault();
      if (e.shiftKey) {
        focusables[(idx - 1 + focusables.length) % focusables.length].focus();
      } else {
        focusables[(idx + 1) % focusables.length].focus();
      }
    }
  });
})();
