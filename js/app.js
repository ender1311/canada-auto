/* ============================================
   DriveNorth — App JS
   ============================================ */

(function () {
  'use strict';

  /* ---- Sticky Nav ---- */
  const nav = document.querySelector('.site-nav');
  if (nav) {
    const onScroll = () => {
      nav.classList.toggle('scrolled', window.scrollY > 40);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ---- Hamburger / Mobile Nav ---- */
  const hamburger = document.querySelector('.hamburger');
  const mobileNav = document.querySelector('.mobile-nav');

  if (hamburger && mobileNav) {
    hamburger.addEventListener('click', () => {
      const isOpen = hamburger.classList.toggle('open');
      mobileNav.classList.toggle('open', isOpen);
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });

    // Close on link click
    mobileNav.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        hamburger.classList.remove('open');
        mobileNav.classList.remove('open');
        document.body.style.overflow = '';
      });
    });
  }

  /* ---- Scroll Animations (IntersectionObserver) ---- */
  const fadeEls = document.querySelectorAll('.fade-in');
  if (fadeEls.length) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

    fadeEls.forEach(el => observer.observe(el));
  }

  /* ---- Smooth Scroll ---- */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        e.preventDefault();
        const offset = 80;
        const top = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });

  /* ---- FAQ Accordion ---- */
  document.querySelectorAll('.faq-question').forEach(btn => {
    btn.addEventListener('click', () => {
      const item = btn.closest('.faq-item');
      const isOpen = item.classList.contains('open');

      // Close all
      document.querySelectorAll('.faq-item.open').forEach(el => el.classList.remove('open'));

      // Open clicked if it was closed
      if (!isOpen) item.classList.add('open');
    });
  });

  /* ---- Filter Pills ---- */
  document.querySelectorAll('.filter-pills .pill').forEach(pill => {
    pill.addEventListener('click', () => {
      const group = pill.closest('.filter-pills');
      group.querySelectorAll('.pill').forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
    });
  });

  /* ---- Option Cards (single-select) ---- */
  document.querySelectorAll('.option-cards').forEach(group => {
    group.querySelectorAll('.option-card').forEach(card => {
      card.addEventListener('click', () => {
        // Deselect all in same group
        group.querySelectorAll('.option-card').forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');

        // Store value on hidden input if present
        const input = group.previousElementSibling;
        if (input && input.type === 'hidden') {
          input.value = card.dataset.value || card.querySelector('.option-label')?.textContent || '';
        }
      });
    });
  });

  /* ---- Multi-Step Form Engine ---- */
  document.querySelectorAll('.multistep-form').forEach(form => {
    const steps = Array.from(form.querySelectorAll('.form-step'));
    const progressBar = form.querySelector('.progress-bar');
    const dots = Array.from(form.querySelectorAll('.step-dot'));
    const stepCountEl = form.querySelector('.step-count');
    let currentStep = 0;

    function showStep(index) {
      steps.forEach((s, i) => {
        s.classList.toggle('active', i === index);
      });
      dots.forEach((d, i) => {
        d.classList.remove('active', 'completed');
        if (i < index) d.classList.add('completed');
        if (i === index) d.classList.add('active');
      });
      if (progressBar) {
        const pct = ((index + 1) / steps.length) * 100;
        progressBar.style.width = pct + '%';
      }
      if (stepCountEl) {
        stepCountEl.textContent = `Step ${index + 1} of ${steps.length}`;
      }
    }

    function validateStep(index) {
      const step = steps[index];
      let valid = true;

      // Check required text/select/email/tel inputs
      step.querySelectorAll('[required]').forEach(input => {
        const errorEl = input.closest('.form-group')?.querySelector('.form-error');
        if (!input.value.trim()) {
          input.classList.add('error');
          if (errorEl) errorEl.classList.add('visible');
          valid = false;
        } else {
          input.classList.remove('error');
          if (errorEl) errorEl.classList.remove('visible');
        }
      });

      // Check required option card groups
      step.querySelectorAll('.option-cards[data-required]').forEach(group => {
        const selected = group.querySelector('.option-card.selected');
        const errorEl = group.nextElementSibling;
        if (!selected) {
          if (errorEl && errorEl.classList.contains('form-error')) {
            errorEl.classList.add('visible');
          }
          valid = false;
        } else {
          if (errorEl && errorEl.classList.contains('form-error')) {
            errorEl.classList.remove('visible');
          }
        }
      });

      // Check required checkboxes
      step.querySelectorAll('input[type="checkbox"][required]').forEach(cb => {
        const errorEl = cb.closest('.form-group')?.querySelector('.form-error');
        if (!cb.checked) {
          if (errorEl) errorEl.classList.add('visible');
          valid = false;
        } else {
          if (errorEl) errorEl.classList.remove('visible');
        }
      });

      return valid;
    }

    // Next buttons
    form.querySelectorAll('[data-next]').forEach(btn => {
      btn.addEventListener('click', () => {
        if (!validateStep(currentStep)) return;
        if (currentStep < steps.length - 1) {
          currentStep++;
          showStep(currentStep);
          form.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    });

    // Back buttons
    form.querySelectorAll('[data-back]').forEach(btn => {
      btn.addEventListener('click', () => {
        if (currentStep > 0) {
          currentStep--;
          showStep(currentStep);
        }
      });
    });

    // Submit
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      if (!validateStep(currentStep)) return;
      window.location.href = 'thank-you.html';
    });

    // Init
    showStep(0);
  });

  /* ---- Single-step forms (contact, dealers, newsletter) ---- */
  document.querySelectorAll('.single-form').forEach(form => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      let valid = true;
      form.querySelectorAll('[required]').forEach(input => {
        const errorEl = input.closest('.form-group')?.querySelector('.form-error');
        if (!input.value.trim()) {
          input.classList.add('error');
          if (errorEl) errorEl.classList.add('visible');
          valid = false;
        } else {
          input.classList.remove('error');
          if (errorEl) errorEl.classList.remove('visible');
        }
      });

      if (valid) {
        window.location.href = 'thank-you.html';
      }
    });
  });

  /* ---- Newsletter form ---- */
  document.querySelectorAll('.newsletter-form').forEach(form => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const input = form.querySelector('input[type="email"]');
      if (input && input.value.trim()) {
        const btn = form.querySelector('button');
        if (btn) {
          btn.textContent = 'Subscribed!';
          btn.style.background = '#10B981';
          btn.disabled = true;
        }
      }
    });
  });

  /* ---- Input: clear error on type ---- */
  document.querySelectorAll('.form-control').forEach(input => {
    input.addEventListener('input', () => {
      input.classList.remove('error');
      const errorEl = input.closest('.form-group')?.querySelector('.form-error');
      if (errorEl) errorEl.classList.remove('visible');
    });
  });

})();
