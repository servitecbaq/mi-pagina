document.addEventListener('DOMContentLoaded', function () {

  /* ============================================
     1. MENÚ MÓVIL
     ============================================ */
  const toggle = document.getElementById('navToggle');
  const nav = document.getElementById('nav');

  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      nav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', nav.classList.contains('open'));
    });

    nav.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        nav.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
      });
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
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  /* ============================================
     3. HEADER CON SOMBRA AL HACER SCROLL
     ============================================ */
  const header = document.querySelector('.header');
  if (header) {
    window.addEventListener('scroll', function () {
      if (window.scrollY > 20) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    }, { passive: true });
  }

  /* ============================================
     4. REVEAL ON SCROLL (IntersectionObserver)
     ============================================ */
  const revealSelectors = [
    '.hero h1', '.hero-subtitle', '.hero-cta', '.hero-badges',
    '.section-title', '.section-subtitle',
    '.service-card',
    '.feature',
    '.founder-card',
    '.testimonial',
    '.contact-card',
    '.reviews-cta-buttons', '.reviews-note'
  ];

  // Añade la clase reveal con delays escalonados a las tarjetas
  document.querySelectorAll('.service-card').forEach(function (el, i) {
    el.classList.add('reveal');
    if (i < 8) el.classList.add('reveal-delay-' + (i % 8 + 1));
  });
  document.querySelectorAll('.feature').forEach(function (el, i) {
    el.classList.add('reveal', 'reveal-delay-' + (i + 1));
  });
  document.querySelectorAll('.testimonial').forEach(function (el, i) {
    el.classList.add('reveal', 'reveal-delay-' + (i + 1));
  });
  document.querySelectorAll('.contact-card').forEach(function (el, i) {
    el.classList.add('reveal', 'reveal-delay-' + (i + 1));
  });
  document.querySelectorAll('.section-title, .section-subtitle').forEach(function (el) {
    el.classList.add('reveal');
  });
  const founderCard = document.querySelector('.founder-card');
  if (founderCard) founderCard.classList.add('reveal');

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.12,
      rootMargin: '0px 0px -40px 0px'
    });

    document.querySelectorAll('.reveal').forEach(function (el) {
      observer.observe(el);
    });
  } else {
    // Fallback navegadores antiguos
    document.querySelectorAll('.reveal').forEach(function (el) {
      el.classList.add('visible');
    });
  }

  /* ============================================
     5. TOGGLE DE TEMA CLARO / OSCURO
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
    reparacion: {
      icon: '💻',
      title: 'Reparación de computadores',
      description: 'Diagnosticamos y solucionamos problemas de hardware y software, tanto en equipos de escritorio como portátiles.',
      items: [
        'Diagnóstico completo del equipo',
        'Cambio de piezas (disco, RAM, batería, teclado)',
        'Reinstalación de sistema operativo',
        'Eliminación de virus y malware',
        'Recuperación de datos cuando sea posible'
      ]
    },
    mantenimiento: {
      icon: '⚡',
      title: 'Mantenimiento preventivo y correctivo',
      description: 'Prolongamos la vida útil de tus equipos con limpieza, optimización y revisiones periódicas.',
      items: [
        'Limpieza interna de polvo y ventiladores',
        'Cambio de pasta térmica',
        'Optimización del sistema operativo',
        'Actualización de controladores y software',
        'Revisión de temperaturas y rendimiento'
      ]
    },
    redes: {
      icon: '🌐',
      title: 'Redes e Internet',
      description: 'Configuramos y solucionamos problemas de conectividad en hogares y pequeñas empresas.',
      items: [
        'Configuración de routers y módems',
        'Instalación de redes Wi-Fi y cableadas',
        'Ampliación de cobertura con repetidores',
        'Solución de cortes o lentitud de internet',
        'Configuración de red para pequeñas oficinas'
      ]
    },
    impresoras: {
      icon: '🖨️',
      title: 'Impresoras',
      description: 'Instalamos, configuramos y reparamos impresoras de todas las marcas.',
      items: [
        'Instalación en Windows y Mac',
        'Configuración en red o Wi-Fi',
        'Solución de atascos y errores',
        'Cambio de cartuchos y tóner',
        'Impresión desde celular o tablet'
      ]
    },
    instalacion: {
      icon: '🔧',
      title: 'Instalación y configuración',
      description: 'Dejamos tus equipos listos para trabajar, estudiar o disfrutar, con todo lo necesario configurado.',
      items: [
        'Instalación de computadores nuevos',
        'Configuración inicial de Windows, macOS o Linux',
        'Instalación de programas esenciales',
        'Configuración de cuentas y correo',
        'Puesta a punto de equipos para oficina'
      ]
    },
    seguridad: {
      icon: '🔒',
      title: 'Seguridad y respaldo',
      description: 'Protegemos tu información y te enseñamos buenas prácticas para evitar pérdidas de datos.',
      items: [
        'Instalación de antivirus y firewall',
        'Configuración de copias de seguridad automáticas',
        'Respaldo en la nube o discos externos',
        'Protección contra ransomware',
        'Asesoría en contraseñas seguras'
      ]
    },
    aplicativos: {
      icon: '🧩',
      title: 'Soporte de aplicativos',
      description: 'Te ayudamos con la instalación, configuración y solución de problemas de los programas que usas a diario.',
      items: [
        'Instalación y configuración de programas',
        'Actualización o reinstalación de aplicaciones',
        'Solución de errores de programas (Office, sistemas contables, navegadores, etc.)',
        'Configuración de correo y aplicaciones corporativas'
      ]
    },
    desarrollo: {
      icon: '👨‍💻',
      title: 'Desarrollo de software',
      description: 'Creamos soluciones a la medida para automatizar procesos y mejorar la operación de tu negocio.',
      items: [
        'Páginas web y landing pages',
        'Automatización de tareas repetitivas',
        'Scripts en PowerShell y Python',
        'Integración de sistemas y APIs',
        'Bases de datos SQL y reportes personalizados'
      ]
    }
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

});