// Smooth FAQ accordion (accessible + reduced-motion aware)
  document.addEventListener('DOMContentLoaded', function () {
    const buttons = Array.from(document.querySelectorAll('.faq-question'));

    const isReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function closeItem(btn) {
      const answer = document.getElementById(btn.getAttribute('aria-controls'));
      if (!answer || answer.hidden) return;
      // ensure current height is set so transition can animate
      answer.style.maxHeight = answer.scrollHeight + 'px';
      // force frame then collapse
      requestAnimationFrame(() => {
        answer.style.maxHeight = '0';
        answer.style.opacity = '0';
        btn.parentElement.classList.remove('open');
        btn.setAttribute('aria-expanded', 'false');
        const icon = btn.querySelector('.faq-icon');
        if (icon) icon.textContent = '+';
      });

      const onEnd = (e) => {
        if (e.propertyName !== 'max-height') return;
        answer.hidden = true;
        answer.removeEventListener('transitionend', onEnd);
        // keep inline styles minimal
        answer.style.maxHeight = null;
      };

      if (isReduced) {
        // Immediately hide for reduced-motion
        answer.hidden = true;
        answer.style.maxHeight = null;
      } else {
        answer.addEventListener('transitionend', onEnd);
      }
    }

    function openItem(btn) {
      const answer = document.getElementById(btn.getAttribute('aria-controls'));
      if (!answer || !answer.hidden) return;
      answer.hidden = false;
      // ensure starting from 0
      answer.style.maxHeight = '0';
      answer.style.opacity = '0';
      // force frame then expand
      requestAnimationFrame(() => {
        answer.style.maxHeight = answer.scrollHeight + 'px';
        answer.style.opacity = '1';
        btn.parentElement.classList.add('open');
        btn.setAttribute('aria-expanded', 'true');
        const icon = btn.querySelector('.faq-icon');
        if (icon) icon.textContent = '+';
      });

      const onEnd = (e) => {
        if (e.propertyName !== 'max-height') return;
        // remove max-height constraint so content can grow naturally
        answer.style.maxHeight = 'none';
        answer.removeEventListener('transitionend', onEnd);
      };

      if (!isReduced) answer.addEventListener('transitionend', onEnd);
    }

    function toggleItem(btn) {
      const expanded = btn.getAttribute('aria-expanded') === 'true';
      if (expanded) {
        closeItem(btn);
      } else {
        // close others first
        buttons.forEach(b => {
          if (b !== btn) closeItem(b);
        });
        openItem(btn);
      }
    }

    buttons.forEach(btn => {
      btn.addEventListener('click', () => toggleItem(btn));
      btn.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          toggleItem(btn);
        }
      });
    });

    // adjust open panels on resize
    let resizeTimeout;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        buttons.forEach(btn => {
          const answer = document.getElementById(btn.getAttribute('aria-controls'));
          if (answer && !answer.hidden && answer.style.maxHeight !== 'none') {
            answer.style.maxHeight = answer.scrollHeight + 'px';
          }
        });
      }, 120);
    });
  });