document.addEventListener('DOMContentLoaded', function () {

  const isMobile = window.matchMedia('(max-width: 640px)').matches;
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ============================================
     1. MENÚ MÓVIL
     ============================================ */
  const toggle = document.getElementById('navToggle');
  const nav = document.getElementById('nav');

  function closeNav() {
    nav.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.textContent = '☰';
    toggle.setAttribute('aria-label', 'Abrir menú');
    document.body.classList.remove('nav-open');
  }

  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      const isOpen = nav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', isOpen);
      document.body.classList.toggle('nav-open', isOpen);
      toggle.textContent = isOpen ? '✕' : '☰';
      toggle.setAttribute('aria-label', isOpen ? 'Cerrar menú' : 'Abrir menú');
    });

    nav.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', closeNav);
    });

    document.addEventListener('click', function (e) {
      if (!nav.classList.contains('open')) return;
      if (nav.contains(e.target) || toggle.contains(e.target)) return;
      closeNav();
    });
  }

  /* ============================================
     2. SCROLL SUAVE
     ============================================ */
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#' || targetId === '') return;
      const target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        const header = document.querySelector('.header');
        const offset = header ? header.offsetHeight + 12 : 0;
        const top = target.getBoundingClientRect().top + window.pageYOffset - offset;
        window.scrollTo({ top: top, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
      }
    });
  });

  /* ============================================
     3. HEADER CON SOMBRA
     ============================================ */
  const header = document.querySelector('.header');
  if (header) {
    let ticking = false;
    window.addEventListener('scroll', function () {
      if (!ticking) {
        window.requestAnimationFrame(function () {
          header.classList.toggle('scrolled', window.scrollY > 20);
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });
  }

  /* ============================================
     4. REVEAL ON SCROLL
     ============================================ */
  const revealTargets = ['.service-card', '.feature', '.contact-card', '.faq-item'];
  revealTargets.forEach(function (selector) {
    document.querySelectorAll(selector).forEach(function (el, i) {
      el.classList.add('reveal');
      if (i < 8) el.classList.add('reveal-delay-' + ((i % 8) + 1));
    });
  });
  document.querySelectorAll('.section-title, .section-subtitle').forEach(function (el) {
    el.classList.add('reveal');
  });
  const founderCard = document.querySelector('.founder-card');
  if (founderCard) founderCard.classList.add('reveal');

  if ('IntersectionObserver' in window && !prefersReducedMotion) {
    const revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -30px 0px' });

    document.querySelectorAll('.reveal').forEach(function (el) {
      revealObserver.observe(el);
    });
  } else {
    document.querySelectorAll('.reveal').forEach(function (el) {
      el.classList.add('visible');
    });
  }

  /* ============================================
     5. TOGGLE DE TEMA
     ============================================ */
  const themeToggle = document.getElementById('themeToggle');
  if (themeToggle) {
    themeToggle.addEventListener('click', function () {
      const current = document.documentElement.getAttribute('data-theme');
      const next = current === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      try { localStorage.setItem('theme', next); } catch (e) {}
    });
  }

  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  mediaQuery.addEventListener('change', function (e) {
    let savedTheme = null;
    try { savedTheme = localStorage.getItem('theme'); } catch (err) {}
    if (!savedTheme) {
      document.documentElement.setAttribute('data-theme', e.matches ? 'dark' : 'light');
    }
  });

  /* ============================================
     6. MODAL DE SERVICIOS
     ============================================ */
  const servicesData = {
    reparacion: { icon: '💻', title: 'Reparación de computadores', description: 'Diagnosticamos y solucionamos problemas de hardware y software, tanto en equipos de escritorio como portátiles.', items: ['Diagnóstico completo del equipo','Cambio de piezas (disco, RAM, batería, teclado)','Reinstalación de sistema operativo','Eliminación de virus y malware','Recuperación de datos cuando sea posible'] },
    mantenimiento: { icon: '⚡', title: 'Mantenimiento preventivo y correctivo', description: 'Prolongamos la vida útil de tus equipos con limpieza, optimización y revisiones periódicas.', items: ['Limpieza interna de polvo y ventiladores','Cambio de pasta térmica','Optimización del sistema operativo','Actualización de controladores y software','Revisión de temperaturas y rendimiento'] },
    redes: { icon: '🌐', title: 'Redes e Internet', description: 'Configuramos y solucionamos problemas de conectividad en hogares y pequeñas empresas.', items: ['Configuración de routers y módems','Instalación de redes Wi-Fi y cableadas','Ampliación de cobertura con repetidores','Solución de cortes o lentitud de internet','Configuración de red para pequeñas oficinas'] },
    impresoras: { icon: '🖨️', title: 'Impresoras', description: 'Instalamos, configuramos y reparamos impresoras de todas las marcas.', items: ['Instalación en Windows y Mac','Configuración en red o Wi-Fi','Solución de atascos y errores','Cambio de cartuchos y tóner','Impresión desde celular o tablet'] },
    instalacion: { icon: '🔧', title: 'Instalación y configuración', description: 'Dejamos tus equipos listos para trabajar, estudiar o disfrutar, con todo lo necesario configurado.', items: ['Instalación de computadores nuevos','Configuración inicial de Windows, macOS o Linux','Instalación de programas esenciales','Configuración de cuentas y correo','Puesta a punto de equipos para oficina'] },
    seguridad: { icon: '🔒', title: 'Seguridad y respaldo', description: 'Protegemos tu información y te enseñamos buenas prácticas para evitar pérdidas de datos.', items: ['Instalación de antivirus y firewall','Configuración de copias de seguridad automáticas','Respaldo en la nube o discos externos','Protección contra ransomware','Asesoría en contraseñas seguras'] },
    aplicativos: { icon: '🧩', title: 'Soporte de aplicativos', description: 'Te ayudamos con la instalación, configuración y solución de problemas de los programas que usas a diario.', items: ['Instalación y configuración de programas','Actualización o reinstalación de aplicaciones','Solución de errores de programas (Office, sistemas contables, navegadores, etc.)','Configuración de correo y aplicaciones corporativas'] },
    desarrollo: { icon: '👨‍💻', title: 'Desarrollo de software', description: 'Creamos soluciones a la medida para automatizar procesos y mejorar la operación de tu negocio.', items: ['Páginas web y landing pages','Automatización de tareas repetitivas','Scripts en PowerShell y Python','Integración de sistemas y APIs','Bases de datos SQL y reportes personalizados'] }
  };

  const modal = document.getElementById('serviceModal');
  const modalIcon = document.getElementById('modalIcon');
  const modalTitle = document.getElementById('modalTitle');
  const modalDesc = document.getElementById('modalDesc');
  const modalList = document.getElementById('modalList');
  const modalCloseBtn = document.getElementById('modalClose');
  const modalCta = modal ? modal.querySelector('.modal-cta') : null;

  function openModal(key) {
    const data = servicesData[key];
    if (!data || !modal) return;
    modalIcon.textContent = data.icon;
    modalTitle.textContent = data.title;
    modalDesc.textContent = data.description;
    modalList.innerHTML = '';
    data.items.forEach(function (item) {
      const li = document.createElement('li');
      li.textContent = item;
      modalList.appendChild(li);
    });
    if (modalCta) {
      const msg = encodeURIComponent('Hola Servitec.baq, necesito información sobre: ' + data.title);
      modalCta.href = 'https://wa.me/573158505020?text=' + msg;
    }
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-open');
  }

  function closeModal() {
    if (!modal) return;
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('modal-open');
  }

  document.querySelectorAll('.service-card').forEach(function (card) {
    const key = card.getAttribute('data-service');
    card.addEventListener('click', function () { openModal(key); });
    card.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openModal(key);
      }
    });
  });

  if (modal) {
    if (modalCloseBtn) modalCloseBtn.addEventListener('click', closeModal);
    modal.querySelectorAll('[data-close-modal]').forEach(function (el) {
      el.addEventListener('click', closeModal);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && modal.classList.contains('open')) closeModal();
    });
  }

  /* ============================================
     7. TIPS
     ============================================ */
  const tipTrack = document.getElementById('tipTrack');
  const tipDots = document.getElementById('tipDots');
  const tipPrev = document.getElementById('tipPrev');
  const tipNext = document.getElementById('tipNext');
  const tipsGrid = document.getElementById('tipsGrid');
  const tipsExpandBtn = document.getElementById('tipsExpandBtn');
  const tipsGridWrapper = document.getElementById('tipsGridWrapper');
  const tipsExpandText = tipsExpandBtn ? tipsExpandBtn.querySelector('.tips-expand-text') : null;

  let currentTip = 0;
  let tipsData = [];
  let autoplayTimer = null;
  const SHOULD_AUTOPLAY = !isMobile && !prefersReducedMotion;
  const AUTOPLAY_INTERVAL = 8000;

  function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  if (tipTrack && tipDots) {
    fetch('tips.json')
      .then(function (r) { if (!r.ok) throw new Error('tips.json'); return r.json(); })
      .then(function (data) {
        if (!Array.isArray(data) || data.length === 0) return;
        tipsData = shuffleArray(data);

        const card = document.createElement('article');
        card.className = 'tip-card';
        tipTrack.appendChild(card);

        function paintTip(tip, animate) {
          const html =
            '<span class="tip-category">' + tip.category + '</span>' +
            '<div class="tip-icon">' + tip.icon + '</div>' +
            '<h3 class="tip-title">' + tip.title + '</h3>' +
            '<p class="tip-desc">' + tip.desc + '</p>' +
            '<span class="tip-benefit">✨ ' + tip.benefit + '</span>';

          if (!animate || !SHOULD_AUTOPLAY || prefersReducedMotion) {
            card.innerHTML = html;
            return;
          }
          card.classList.add('switching');
          setTimeout(function () {
            card.innerHTML = html;
            card.classList.remove('switching');
          }, 180);
        }

        paintTip(tipsData[0], false);

        tipsData.forEach(function (tip, i) {
          const dot = document.createElement('button');
          dot.className = 'tip-dot' + (i === 0 ? ' active' : '');
          dot.setAttribute('aria-label', 'Ir al tip ' + (i + 1));
          dot.addEventListener('click', function () { goToTip(i); });
          tipDots.appendChild(dot);
        });

        if (tipsGrid) {
          const frag = document.createDocumentFragment();
          tipsData.forEach(function (tip) {
            const mini = document.createElement('article');
            mini.className = 'tip-mini';
            mini.innerHTML =
              '<span class="tip-mini-icon">' + tip.icon + '</span>' +
              '<h4>' + tip.title + '</h4>' +
              '<p>' + tip.desc + '</p>';
            frag.appendChild(mini);
          });
          tipsGrid.appendChild(frag);
        }

        const dots = tipDots.querySelectorAll('.tip-dot');

        function goToTip(index) {
          if (index === currentTip || !tipsData.length) return;
          dots[currentTip].classList.remove('active');
          currentTip = (index + tipsData.length) % tipsData.length;
          dots[currentTip].classList.add('active');
          paintTip(tipsData[currentTip], true);
          restartAutoplay();
        }
        function nextTip() { goToTip(currentTip + 1); }
        function prevTip() { goToTip(currentTip - 1); }

        function startAutoplay() {
          if (autoplayTimer || !SHOULD_AUTOPLAY) return;
          autoplayTimer = setInterval(nextTip, AUTOPLAY_INTERVAL);
        }
        function stopAutoplay() {
          if (autoplayTimer) { clearInterval(autoplayTimer); autoplayTimer = null; }
        }
        function restartAutoplay() { stopAutoplay(); startAutoplay(); }

        if (tipNext) tipNext.addEventListener('click', nextTip);
        if (tipPrev) tipPrev.addEventListener('click', prevTip);

        const carousel = document.getElementById('tipCarousel');
        if (carousel) {
          carousel.addEventListener('mouseenter', stopAutoplay);
          carousel.addEventListener('mouseleave', startAutoplay);
        }

        document.addEventListener('keydown', function (e) {
          if (!carousel) return;
          const rect = carousel.getBoundingClientRect();
          const inView = rect.top < window.innerHeight && rect.bottom > 0;
          if (!inView) return;
          if (e.key === 'ArrowRight') nextTip();
          if (e.key === 'ArrowLeft') prevTip();
        });

        if (tipsExpandBtn && tipsGridWrapper) {
          tipsExpandBtn.addEventListener('click', function () {
            const isOpen = tipsGridWrapper.classList.toggle('open');
            tipsExpandBtn.setAttribute('aria-expanded', isOpen);
            if (tipsExpandText) tipsExpandText.textContent = isOpen ? 'Ocultar tips' : 'Ver todos los tips';
          });
        }

        if ('IntersectionObserver' in window && carousel && SHOULD_AUTOPLAY) {
          const playObserver = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
              if (entry.isIntersecting) startAutoplay(); else stopAutoplay();
            });
          }, { threshold: 0.1 });
          playObserver.observe(carousel);
        }
      })
      .catch(function (error) {
        console.error('Error tips:', error);
        if (tipTrack) tipTrack.innerHTML = '<p style="text-align:center;color:var(--color-text-light);padding:40px 20px;">No se pudieron cargar los tips.</p>';
      });
  }

  /* ============================================
     8. APLICATIVOS
     ============================================ */
  const appsGrid = document.getElementById('appsGrid');
  const appsFilters = document.getElementById('appsFilters');
  const appsSearch = document.getElementById('appsSearch');
  const appsEmpty = document.getElementById('appsEmpty');

  if (appsGrid && appsFilters) {
    let allApps = [];
    let activeCategory = 'all';
    let searchTerm = '';

    fetch('apps.json')
      .then(function (r) { if (!r.ok) throw new Error('apps.json'); return r.json(); })
      .then(function (data) {
        if (!Array.isArray(data) || data.length === 0) return;
        allApps = data;

        const categories = ['all'];
        data.forEach(function (app) {
          if (!categories.includes(app.category)) categories.push(app.category);
        });

        const frag = document.createDocumentFragment();
        categories.forEach(function (cat) {
          const btn = document.createElement('button');
          btn.className = 'apps-filter' + (cat === 'all' ? ' active' : '');
          btn.dataset.category = cat;
          btn.textContent = cat === 'all' ? 'Todos' : cat;
          btn.addEventListener('click', function () {
            appsFilters.querySelectorAll('.apps-filter').forEach(function (b) { b.classList.remove('active'); });
            btn.classList.add('active');
            activeCategory = cat;
            renderApps();
          });
          frag.appendChild(btn);
        });
        appsFilters.innerHTML = '';
        appsFilters.appendChild(frag);

        renderApps();
      })
      .catch(function (error) {
        console.error('Error apps:', error);
        if (appsGrid) appsGrid.innerHTML = '<p class="apps-empty">No se pudieron cargar los aplicativos.</p>';
      });

    function renderApps() {
      if (!appsGrid) return;

      const term = searchTerm.toLowerCase().trim();
      const filtered = allApps.filter(function (app) {
        const cat = activeCategory === 'all' || app.category === activeCategory;
        const s = !term ||
          app.name.toLowerCase().includes(term) ||
          app.desc.toLowerCase().includes(term) ||
          app.category.toLowerCase().includes(term);
        return cat && s;
      });

      appsGrid.innerHTML = '';

      if (filtered.length === 0) {
        if (appsEmpty) appsEmpty.hidden = false;
        return;
      }
      if (appsEmpty) appsEmpty.hidden = true;

      const frag = document.createDocumentFragment();
      filtered.forEach(function (app) {
        const card = document.createElement('a');
        card.className = 'app-card';
        card.href = app.url;
        card.target = '_blank';
        card.rel = 'noopener';

        const badgesHTML = (app.badges || []).map(function (b) {
          const isFree = b.toLowerCase() === 'gratis' || b.toLowerCase() === 'free';
          return '<span class="app-badge' + (isFree ? ' free' : '') + '">' + b + '</span>';
        }).join('');

        card.innerHTML =
          '<div class="app-logo">' + app.icon + '</div>' +
          '<h3 class="app-name">' + app.name + '</h3>' +
          '<p class="app-desc">' + app.desc + '</p>' +
          '<div class="app-meta">' + badgesHTML + '</div>' +
          '<span class="app-link">Sitio oficial →</span>';

        frag.appendChild(card);
      });
      appsGrid.appendChild(frag);
    }

    if (appsSearch) {
      let debounceTimer;
      appsSearch.addEventListener('input', function (e) {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(function () {
          searchTerm = e.target.value;
          renderApps();
        }, 200);
      });
    }
  }

  /* ============================================
     9. FAQ
     ============================================ */
  const faqItems = document.querySelectorAll('.faq-item');

  faqItems.forEach(function (item) {
    const answer = item.querySelector('.faq-answer');
    if (!answer) return;
    if (answer.parentElement.classList.contains('faq-content')) return;

    const wrapper = document.createElement('div');
    wrapper.className = 'faq-content';
    const inner = document.createElement('div');
    answer.parentNode.insertBefore(wrapper, answer);
    wrapper.appendChild(inner);
    inner.appendChild(answer);
  });

  /* ============================================
     10. LAZY LOAD: CREDLY
     ============================================ */
  const founderCerts = document.getElementById('founderCerts');
  let credlyLoaded = false;

  function loadCredly() {
    if (credlyLoaded || !founderCerts) return;
    credlyLoaded = true;

    founderCerts.querySelectorAll('[data-credly-badge]').forEach(function (el) {
      el.removeAttribute('data-credly-badge');
    });

    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.async = true;
    script.src = 'https://cdn.credly.com/assets/utilities/embed.js';
    document.body.appendChild(script);
  }

  if (founderCerts) {
    if ('IntersectionObserver' in window) {
      const credlyObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            loadCredly();
            credlyObserver.disconnect();
          }
        });
      }, { rootMargin: '200px 0px' });
      credlyObserver.observe(founderCerts);
    } else {
      loadCredly();
    }
  }

  /* ============================================
     11. LAZY LOAD: GR WIDGET
     ============================================ */
  const reviewsSection = document.getElementById('resenas');
  let grWidgetLoaded = false;

  function loadGrWidget() {
    if (grWidgetLoaded || !reviewsSection) return;
    grWidgetLoaded = true;

    const script = document.createElement('script');
    script.src = 'https://grwidget.com/v1/grwidget.js';
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);
  }

  if (reviewsSection) {
    if ('IntersectionObserver' in window) {
      const grObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            loadGrWidget();
            grObserver.disconnect();
          }
        });
      }, { rootMargin: '300px 0px' });
      grObserver.observe(reviewsSection);
    } else {
      loadGrWidget();
    }
  }

  /* ============================================
     12. FORMULARIO DE CONTACTO (Web3Forms)
     ============================================ */
  const contactForm = document.getElementById('contactForm');
  const formStatus = document.getElementById('formStatus');
  const formSubmit = document.getElementById('formSubmit');

  if (contactForm) {
    contactForm.addEventListener('submit', function (e) {
      e.preventDefault();

      // Estado: enviando
      formSubmit.disabled = true;
      formSubmit.textContent = '⏳ Enviando…';
      if (formStatus) {
        formStatus.hidden = true;
        formStatus.className = 'form-status';
        formStatus.textContent = '';
      }

      const formData = new FormData(contactForm);

      fetch(contactForm.action, {
        method: 'POST',
        body: formData,
        headers: { 'Accept': 'application/json' }
      })
        .then(function (response) { return response.json(); })
        .then(function (data) {
          if (data.success) {
            // Éxito
            if (formStatus) {
              formStatus.hidden = false;
              formStatus.className = 'form-status success';
              formStatus.textContent = '¡Gracias! Hemos recibido tu mensaje. Te responderemos lo antes posible.';
            }
            contactForm.reset();

            formSubmit.disabled = false;
            formSubmit.textContent = '✉️ Enviar mensaje';

            // Ocultar el mensaje después de 8 segundos
            setTimeout(function () {
              if (formStatus) formStatus.hidden = true;
            }, 8000);
          } else {
            throw new Error(data.message || 'Error al enviar');
          }
        })
        .catch(function (error) {
          console.error('Error formulario:', error);
          if (formStatus) {
            formStatus.hidden = false;
            formStatus.className = 'form-status error';
            formStatus.textContent = 'Hubo un problema al enviar. Intenta de nuevo o escríbenos por WhatsApp al +57 315 850 5020.';
          }
          formSubmit.disabled = false;
          formSubmit.textContent = '✉️ Enviar mensaje';
        });
    });
  }

});