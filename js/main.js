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
     3. HEADER CON SOMBRA AL SCROLL
     ============================================ */
  const header = document.querySelector('.header');
  if (header) {
    window.addEventListener('scroll', function () {
      if (window.scrollY > 20) header.classList.add('scrolled');
      else header.classList.remove('scrolled');
    }, { passive: true });
  }

  /* ============================================
     4. REVEAL ON SCROLL
     ============================================ */
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
  document.querySelectorAll('.faq-item').forEach(function (el, i) {
    el.classList.add('reveal', 'reveal-delay-' + Math.min(i + 1, 6));
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
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    document.querySelectorAll('.reveal').forEach(function (el) {
      observer.observe(el);
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

  /* ============================================
     7. MÓDULO ¿SABÍAS QUE?
     ============================================ */
  const tipsData = [
    { category: 'Seguridad', icon: '🔐', title: 'BitLocker cifra todo tu disco', desc: 'Windows Pro incluye BitLocker para cifrar el disco completo. Si roban un portátil corporativo, los datos son ilegibles sin la clave.', benefit: 'Evita filtraciones en caso de robo' },
    { category: 'Seguridad', icon: '🛡️', title: 'LAPS: contraseña única por equipo', desc: 'Local Administrator Password Solution (LAPS) asigna una contraseña distinta a cada PC, gestionada desde Active Directory. Adiós a la clave "Admin123" compartida.', benefit: 'Bloquea movimientos laterales en la red' },
    { category: 'Seguridad', icon: '🚫', title: 'Windows Defender Application Control', desc: 'Bloquea la ejecución de programas no firmados. Es una de las defensas más efectivas contra ransomware en entornos corporativos.', benefit: 'Detiene malware antes de que se ejecute' },
    { category: 'Productividad', icon: '⏰', title: 'Task Scheduler + PowerShell', desc: 'Automatiza backups, limpiezas, reportes y tareas repetitivas con scripts programados. Una vez configurado, trabaja solo.', benefit: 'Ahorra horas de trabajo manual al mes' },
    { category: 'Productividad', icon: '🪟', title: 'Snap Layouts con Win + Z', desc: 'Organiza múltiples ventanas al instante en plantillas predefinidas. Perfecto para comparar documentos o trabajar con varias apps.', benefit: 'Ahorra minutos en cada tarea' },
    { category: 'Productividad', icon: '🗂️', title: 'Escritorios virtuales con Win + Tab', desc: 'Separa contextos: un escritorio para "Trabajo", otro para "Reuniones", otro para "Personal". Cambias entre ellos al instante.', benefit: 'Menos distracciones, más foco' },
    { category: 'Redes', icon: '🖥️', title: 'RDP sobre VPN para soporte remoto', desc: 'Administra equipos de sucursales sin desplazarte. Con RDP sobre VPN accedes al escritorio remoto de cualquier PC de la empresa.', benefit: 'Soporte inmediato sin viajar' },
    { category: 'Redes', icon: '📋', title: 'Group Policy (GPO) centraliza todo', desc: 'Aplica configuraciones, restricciones y políticas a toda la empresa desde un solo lugar. Usuarios, contraseñas, permisos, todo.', benefit: 'Gestión masiva desde un punto' },
    { category: 'Redes', icon: '🌐', title: 'Reservas DHCP por MAC', desc: 'Asigna una IP fija a un equipo sin configurarla manualmente. Ideal para impresoras, servidores y cámaras de seguridad.', benefit: 'IPs estables sin tocar cada PC' },
    { category: 'Datos', icon: '💾', title: 'File History + OneDrive KFM', desc: 'Respaldo automático de Escritorio, Documentos e Imágenes con OneDrive Known Folder Move. Restauras un archivo borrado en segundos.', benefit: 'Nunca más "se me borró el archivo"' },
    { category: 'Datos', icon: '🧹', title: 'Storage Sense libera espacio solo', desc: 'Windows elimina automáticamente archivos temporales, papelera y descargas antiguas. Útil en servidores y PCs con disco limitado.', benefit: 'Menos mantenimiento manual' },
    { category: 'Datos', icon: '🕰️', title: 'Versiones anteriores (Shadow Copies)', desc: 'Recupera versiones previas de archivos o carpetas sin necesidad de backup externo. Windows las guarda por defecto si están activadas.', benefit: 'Restauras archivos en segundos' }
  ];

  const tipTrack = document.getElementById('tipTrack');
  const tipDots = document.getElementById('tipDots');
  const tipPrev = document.getElementById('tipPrev');
  const tipNext = document.getElementById('tipNext');
  const tipsGrid = document.getElementById('tipsGrid');
  const tipsExpandBtn = document.getElementById('tipsExpandBtn');
  const tipsGridWrapper = document.getElementById('tipsGridWrapper');
  const tipsExpandText = tipsExpandBtn ? tipsExpandBtn.querySelector('.tips-expand-text') : null;

  let currentTip = 0;
  let autoplayTimer = null;
  const AUTOPLAY_INTERVAL = 8000;

  if (tipTrack && tipDots) {
    tipsData.forEach(function (tip, i) {
      const card = document.createElement('article');
      card.className = 'tip-card' + (i === 0 ? ' active' : '');
      card.innerHTML =
        '<span class="tip-category">' + tip.category + '</span>' +
        '<div class="tip-icon">' + tip.icon + '</div>' +
        '<h3 class="tip-title">' + tip.title + '</h3>' +
        '<p class="tip-desc">' + tip.desc + '</p>' +
        '<span class="tip-benefit">✨ ' + tip.benefit + '</span>';
      tipTrack.appendChild(card);

      const dot = document.createElement('button');
      dot.className = 'tip-dot' + (i === 0 ? ' active' : '');
      dot.setAttribute('aria-label', 'Ir al tip ' + (i + 1));
      dot.addEventListener('click', function () { goToTip(i); });
      tipDots.appendChild(dot);
    });

    if (tipsGrid) {
      tipsData.forEach(function (tip) {
        const mini = document.createElement('article');
        mini.className = 'tip-mini';
        mini.innerHTML =
          '<span class="tip-mini-icon">' + tip.icon + '</span>' +
          '<h4>' + tip.title + '</h4>' +
          '<p>' + tip.desc + '</p>';
        tipsGrid.appendChild(mini);
      });
    }

    const cards = tipTrack.querySelectorAll('.tip-card');
    const dots = tipDots.querySelectorAll('.tip-dot');

    function goToTip(index) {
      if (index === currentTip) return;
      cards[currentTip].classList.remove('active');
      dots[currentTip].classList.remove('active');
      currentTip = (index + cards.length) % cards.length;
      cards[currentTip].classList.add('active');
      dots[currentTip].classList.add('active');
      restartAutoplay();
    }

    function nextTip() { goToTip(currentTip + 1); }
    function prevTip() { goToTip(currentTip - 1); }

    function startAutoplay() {
      autoplayTimer = setInterval(nextTip, AUTOPLAY_INTERVAL);
    }
    function stopAutoplay() {
      if (autoplayTimer) clearInterval(autoplayTimer);
    }
    function restartAutoplay() {
      stopAutoplay();
      startAutoplay();
    }

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
        if (tipsExpandText) {
          tipsExpandText.textContent = isOpen ? 'Ocultar tips' : 'Ver todos los tips';
        }
      });
    }

    startAutoplay();
  }

  /* ============================================
     8. FAQ: solo una pregunta abierta a la vez
     ============================================ */
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(function (item) {
    item.addEventListener('toggle', function () {
      if (item.open) {
        faqItems.forEach(function (other) {
          if (other !== item) other.removeAttribute('open');
        });
      }
    });
  });

});