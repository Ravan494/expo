// Smooth FAQ accordion (accessible + reduced-motion aware)
function initFAQ() {
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
}





document.addEventListener("DOMContentLoaded", function () {
  const navPlaceholder = document.getElementById("navbar-placeholder");
  if (navPlaceholder) {
    fetch("navbar.html")
      .then(response => response.text())
      .then(data => {
        navPlaceholder.innerHTML = data;
        initNavbar();
      })
      .catch(error => console.error("Error loading navbar:", error));
  }

  const ftPlaceholder = document.getElementById("footer-placeholder");
  if (ftPlaceholder) {
    fetch("footer.html")
      .then(response => response.text())
      .then(data => {
        ftPlaceholder.innerHTML = data;
      })
      .catch(error => console.error("Error loading footer:", error));
  }

  const faqPlaceholder = document.getElementById("faq-placeholder");
  if (faqPlaceholder) {
    fetch("faq.html")
      .then(response => response.text())
      .then(data => {
        faqPlaceholder.innerHTML = data;
        initFAQ();
      })
      .catch(error => console.error("Error loading FAQ:", error));
  }
});

// Mobile menu toggle
function initNavbar() {
  const menuBtn = document.getElementById('menuBtn');
  const navLinks = document.getElementById('links');
  if (!menuBtn || !navLinks) return;
  menuBtn.setAttribute('aria-expanded', 'false');
  menuBtn.addEventListener('click', () => {
    const open = navLinks.classList.toggle('open');
    menuBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
  // close when a link is clicked (mobile)
  // navLinks.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
  //   if (navLinks.classList.contains('open')) {
  //     navLinks.classList.remove('open');
  //     menuBtn.setAttribute('aria-expanded', 'false');
  //   }
  //   // also close destination dropdown if open
  //   const destToggle2 = document.getElementById('destToggle');
  //   const destMenu2 = document.getElementById('destMenu');
  //   if (destToggle2 && destMenu2 && destToggle2.getAttribute('aria-expanded') === 'true') {
  //     destToggle2.setAttribute('aria-expanded', 'false');
  //     destMenu2.hidden = true;
  //     destToggle2.parentElement.classList.remove('open');
  //   }
  // }));

  // generic dropdown toggling (accessibility + mobile)
  const dropdownToggles = document.querySelectorAll('.dropdown-toggle');
  dropdownToggles.forEach(toggle => {
    const menuId = toggle.getAttribute('aria-controls');
    const menu = document.getElementById(menuId);
    if (toggle && menu) {
      toggle.addEventListener('click', (e) => {
        const open = toggle.getAttribute('aria-expanded') === 'true';

        // Close all other top-level dropdowns
        dropdownToggles.forEach(otherToggle => {
          if (otherToggle !== toggle) {
            const otherMenuId = otherToggle.getAttribute('aria-controls');
            const otherMenu = document.getElementById(otherMenuId);
            if (otherMenu) {
              otherToggle.setAttribute('aria-expanded', 'false');
              otherMenu.hidden = true;
              otherToggle.parentElement.classList.remove('open');
            }
          }
        });

        toggle.setAttribute('aria-expanded', open ? 'false' : 'true');
        menu.hidden = open;
        toggle.parentElement.classList.toggle('open', !open);
      });
      toggle.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          toggle.click();
        } else if (e.key === 'Escape') {
          toggle.setAttribute('aria-expanded', 'false');
          menu.hidden = true;
          toggle.parentElement.classList.remove('open');
          toggle.focus();
        }
      });
    }
  });

  // Multilevel submenu mobile toggles
  const submenuToggles = document.querySelectorAll('.submenu-toggle');
  submenuToggles.forEach(toggle => {
    toggle.addEventListener('click', (e) => {
      e.preventDefault(); // Prevent navigating when the caret is clicked
      e.stopPropagation(); // Stop click from triggering parent <a> navigation
      if (window.innerWidth <= 900) {
        const parent = toggle.closest('.dropdown-submenu-parent');
        if (parent) {
          parent.classList.toggle('open');
          const isExpanded = toggle.getAttribute('aria-expanded') === 'true';
          toggle.setAttribute('aria-expanded', !isExpanded ? 'true' : 'false');
        }
      }
    });
  });

  // show/hide for hover and focus on desktop (accessibility)
  // destToggle.parentElement.addEventListener('mouseenter', () => {
  //   if (window.innerWidth > 900) {
  //     destMenu.hidden = false;
  //     // destToggle.setAttribute('aria-expanded', 'true');
  //   }
  // });
  // destToggle.parentElement.addEventListener('mouseleave', () => {
  //   if (window.innerWidth > 900) {
  //     destMenu.hidden = true;
  //     destToggle.setAttribute('aria-expanded', 'false');
  //   }
  // });
  // destToggle.addEventListener('focus', () => {
  //   if (window.innerWidth > 900) {
  //     destMenu.hidden = false;
  //     destToggle.setAttribute('aria-expanded','true');
  //   }
  // });
  // destToggle.addEventListener('blur', () => {
  //   if (window.innerWidth > 900) {
  //     destMenu.hidden = true;
  //     destToggle.setAttribute('aria-expanded','false');
  //   }
  // });

  // // close dropdown when clicking outside
  // document.addEventListener('click', (e) => {
  //   if (!destToggle.parentElement.contains(e.target) && destToggle.getAttribute('aria-expanded') === 'true') {
  //     destToggle.setAttribute('aria-expanded', 'false');
  //     destMenu.hidden = true;
  //     destToggle.parentElement.classList.remove('open');
  //   }
  // });

  // close menu & dropdown on resize to desktop (accessibility + UX)
  // window.addEventListener('resize', () => {
  //   if (window.innerWidth > 900) {
  //     if (navLinks.classList.contains('open')) {
  //       navLinks.classList.remove('open');
  //       menuBtn.setAttribute('aria-expanded', 'false');
  //     }
  //     if (destToggle && destMenu && destToggle.getAttribute('aria-expanded') === 'true') {
  //       destToggle.setAttribute('aria-expanded', 'false');
  //       destMenu.hidden = true;
  //       destToggle.parentElement.classList.remove('open');
  //     }
  //   }
  // });
}