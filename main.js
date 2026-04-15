/* ========================================
   THREE.JS 3D ACADEMIC PORTFOLIO — Main Script
   Dr. Sanket Salvi
   ======================================== */

(function () {
  'use strict';

  // ── Globals ──
  const canvas = document.getElementById('three-canvas');
  let scene, camera, renderer, clock;
  let particles, floatingShapes = [];
  let mouseX = 0, mouseY = 0;
  let targetMouseX = 0, targetMouseY = 0;
  let scrollY = 0;
  let animationFrameId;

  // ── Color Palette ──
  const COLORS = {
    accent1: 0x667eea,
    accent2: 0x764ba2,
    pink: 0xf093fb,
    cyan: 0x00f2fe,
    gold: 0xfee140,
    white: 0xf0f0f5,
  };

  // ========================================
  //  INIT THREE.JS
  // ========================================
  function initThree() {
    scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x0a0a0f, 0.0008);

    camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.1,
      2000
    );
    camera.position.set(0, 0, 500);

    renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      antialias: true,
      alpha: true,
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x0a0a0f, 1);

    clock = new THREE.Clock();

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
    scene.add(ambientLight);

    const pointLight1 = new THREE.PointLight(COLORS.accent1, 1.5, 800);
    pointLight1.position.set(200, 200, 200);
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(COLORS.accent2, 1.2, 800);
    pointLight2.position.set(-200, -100, 300);
    scene.add(pointLight2);

    const pointLight3 = new THREE.PointLight(COLORS.cyan, 0.8, 600);
    pointLight3.position.set(0, -200, -200);
    scene.add(pointLight3);

    createParticleField();
    createFloatingShapes();
  }

  // ========================================
  //  PARTICLE FIELD
  // ========================================
  function createParticleField() {
    const count = 2000;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const sizes = new Float32Array(count);

    const colorPalette = [
      new THREE.Color(COLORS.accent1),
      new THREE.Color(COLORS.accent2),
      new THREE.Color(COLORS.pink),
      new THREE.Color(COLORS.cyan),
      new THREE.Color(COLORS.white),
    ];

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      const radius = 400 + Math.random() * 600;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);

      positions[i3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i3 + 2] = radius * Math.cos(phi);

      const color = colorPalette[Math.floor(Math.random() * colorPalette.length)];
      colors[i3] = color.r;
      colors[i3 + 1] = color.g;
      colors[i3 + 2] = color.b;

      sizes[i] = Math.random() * 3 + 1;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    const material = new THREE.PointsMaterial({
      size: 2,
      vertexColors: true,
      transparent: true,
      opacity: 0.7,
      sizeAttenuation: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    particles = new THREE.Points(geometry, material);
    scene.add(particles);
  }

  // ========================================
  //  FLOATING SHAPES (academic — molecules, data, networks)
  // ========================================
  function createFloatingShapes() {
    const shapeDefs = [
      {
        geo: new THREE.IcosahedronGeometry(30, 1),
        color: COLORS.accent1,
        pos: new THREE.Vector3(-250, 120, -100),
        rotSpeed: { x: 0.003, y: 0.005, z: 0.002 },
      },
      {
        geo: new THREE.OctahedronGeometry(25, 0),
        color: COLORS.accent2,
        pos: new THREE.Vector3(280, -80, -150),
        rotSpeed: { x: 0.004, y: 0.003, z: 0.005 },
      },
      {
        geo: new THREE.TorusGeometry(22, 8, 16, 40),
        color: COLORS.pink,
        pos: new THREE.Vector3(-180, -200, 50),
        rotSpeed: { x: 0.005, y: 0.004, z: 0.003 },
      },
      {
        geo: new THREE.TetrahedronGeometry(20, 0),
        color: COLORS.cyan,
        pos: new THREE.Vector3(200, 200, -80),
        rotSpeed: { x: 0.006, y: 0.003, z: 0.004 },
      },
      {
        geo: new THREE.DodecahedronGeometry(18, 0),
        color: COLORS.gold,
        pos: new THREE.Vector3(0, -150, -200),
        rotSpeed: { x: 0.003, y: 0.006, z: 0.002 },
      },
      {
        geo: new THREE.TorusKnotGeometry(15, 5, 64, 16),
        color: COLORS.accent1,
        pos: new THREE.Vector3(320, 50, -250),
        rotSpeed: { x: 0.002, y: 0.004, z: 0.003 },
      },
      {
        geo: new THREE.IcosahedronGeometry(15, 0),
        color: COLORS.accent2,
        pos: new THREE.Vector3(-320, -50, -180),
        rotSpeed: { x: 0.004, y: 0.002, z: 0.006 },
      },
    ];

    shapeDefs.forEach((def) => {
      const material = new THREE.MeshPhongMaterial({
        color: def.color,
        transparent: true,
        opacity: 0.35,
        wireframe: true,
        side: THREE.DoubleSide,
      });

      const mesh = new THREE.Mesh(def.geo, material);
      mesh.position.copy(def.pos);
      mesh.userData.initialPos = def.pos.clone();
      mesh.userData.rotSpeed = def.rotSpeed;
      mesh.userData.floatOffset = Math.random() * Math.PI * 2;

      scene.add(mesh);
      floatingShapes.push(mesh);
    });
  }

  // ========================================
  //  ANIMATION LOOP
  // ========================================
  function animate() {
    animationFrameId = requestAnimationFrame(animate);

    const elapsed = clock.getElapsedTime();

    // Smooth mouse follow
    mouseX += (targetMouseX - mouseX) * 0.05;
    mouseY += (targetMouseY - mouseY) * 0.05;

    // Rotate particle field
    if (particles) {
      particles.rotation.y = elapsed * 0.05 + mouseX * 0.0003;
      particles.rotation.x = elapsed * 0.03 + mouseY * 0.0003;
    }

    // Animate floating shapes
    floatingShapes.forEach((shape) => {
      const rs = shape.userData.rotSpeed;
      shape.rotation.x += rs.x;
      shape.rotation.y += rs.y;
      shape.rotation.z += rs.z;

      const offset = shape.userData.floatOffset;
      shape.position.y =
        shape.userData.initialPos.y + Math.sin(elapsed * 0.5 + offset) * 20;
      shape.position.x =
        shape.userData.initialPos.x + Math.cos(elapsed * 0.3 + offset) * 10;
    });

    // Camera parallax from mouse
    camera.position.x += (mouseX * 0.05 - camera.position.x) * 0.02;
    camera.position.y += (-mouseY * 0.05 - camera.position.y) * 0.02;
    camera.lookAt(scene.position);

    // Scroll-based camera z
    const targetZ = 500 - scrollY * 0.15;
    camera.position.z += (targetZ - camera.position.z) * 0.05;

    renderer.render(scene, camera);
  }

  // ========================================
  //  EVENT LISTENERS
  // ========================================
  function initEvents() {
    // Mouse move
    document.addEventListener('mousemove', (e) => {
      targetMouseX = e.clientX - window.innerWidth / 2;
      targetMouseY = e.clientY - window.innerHeight / 2;

      // Custom cursor
      const dot = document.getElementById('cursor-dot');
      const ring = document.getElementById('cursor-ring');
      if (dot) {
        dot.style.left = e.clientX + 'px';
        dot.style.top = e.clientY + 'px';
      }
      if (ring) {
        requestAnimationFrame(() => {
          ring.style.left = e.clientX + 'px';
          ring.style.top = e.clientY + 'px';
        });
      }
    });

    // Hover effects on interactive elements
    const interactiveEls = document.querySelectorAll(
      'a, button, .project-card, .about-card, .skill-category, .contact-link, .edu-card, .patent-item, .award-item, .cert-chip, .pub-tab, input, textarea'
    );
    const ring = document.getElementById('cursor-ring');

    interactiveEls.forEach((el) => {
      el.addEventListener('mouseenter', () => {
        if (ring) {
          ring.style.width = '60px';
          ring.style.height = '60px';
          ring.style.borderColor = 'rgba(102, 126, 234, 0.8)';
        }
      });
      el.addEventListener('mouseleave', () => {
        if (ring) {
          ring.style.width = '40px';
          ring.style.height = '40px';
          ring.style.borderColor = 'rgba(255, 255, 255, 0.5)';
        }
      });
    });

    // Scroll
    window.addEventListener('scroll', () => {
      scrollY = window.pageYOffset;
      updateScrollProgress();
      updateNavOnScroll();
    });

    // Resize
    window.addEventListener('resize', () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    });

    // Smooth scroll for nav links
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
      anchor.addEventListener('click', (e) => {
        e.preventDefault();
        const target = document.querySelector(anchor.getAttribute('href'));
        if (target) {
          target.scrollIntoView({ behavior: 'smooth' });
        }
      });
    });

    // Contact form
    const form = document.getElementById('contact-form');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const btn = document.getElementById('submit-btn');
        btn.innerHTML = '<span>Message Sent! ✓</span>';
        btn.style.background = 'linear-gradient(135deg, #00c851 0%, #007e33 100%)';
        setTimeout(() => {
          btn.innerHTML = '<span>Send Message</span><span class="btn-arrow">→</span>';
          btn.style.background = '';
          form.reset();
        }, 3000);
      });
    }
  }

  // ========================================
  //  PUBLICATION TABS
  // ========================================
  function initPubTabs() {
    const tabs = document.querySelectorAll('.pub-tab');
    const lists = document.querySelectorAll('.pub-list');

    tabs.forEach((tab) => {
      tab.addEventListener('click', () => {
        // Remove active from all tabs and lists
        tabs.forEach((t) => t.classList.remove('active'));
        lists.forEach((l) => l.classList.remove('active'));

        // Activate clicked tab
        tab.classList.add('active');
        const targetId = 'tab-' + tab.getAttribute('data-tab');
        const targetList = document.getElementById(targetId);
        if (targetList) {
          targetList.classList.add('active');

          // Trigger reveal animations for newly visible items
          const revealItems = targetList.querySelectorAll('.reveal-text');
          revealItems.forEach((item, i) => {
            // Reset animation
            item.classList.remove('visible');
            item.style.transitionDelay = (i * 0.05) + 's';
            // Trigger after brief delay for reflow
            requestAnimationFrame(() => {
              requestAnimationFrame(() => {
                item.classList.add('visible');
              });
            });
          });
        }
      });
    });
  }

  // ========================================
  //  SCROLL PROGRESS BAR
  // ========================================
  function updateScrollProgress() {
    const scrollTop = window.pageYOffset;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = (scrollTop / docHeight) * 100;
    const bar = document.getElementById('scroll-progress');
    if (bar) bar.style.width = progress + '%';
  }

  // ========================================
  //  NAV ACTIVE STATE
  // ========================================
  let lastScrollY = 0;

  function updateNavOnScroll() {
    const nav = document.getElementById('main-nav');
    const current = window.pageYOffset;

    if (current > lastScrollY && current > 100) {
      nav.classList.add('hidden');
    } else {
      nav.classList.remove('hidden');
    }
    lastScrollY = current;

    // Active section highlighting
    const sections = document.querySelectorAll('.section');
    const navLinks = document.querySelectorAll('.nav-link');

    sections.forEach((section) => {
      const top = section.offsetTop - 200;
      const bottom = top + section.offsetHeight;
      if (current >= top && current < bottom) {
        const id = section.getAttribute('id');
        navLinks.forEach((link) => {
          link.classList.remove('active');
          if (link.getAttribute('data-section') === id) {
            link.classList.add('active');
          }
        });
      }
    });
  }

  // ========================================
  //  INTERSECTION OBSERVER — REVEAL
  // ========================================
  function initRevealAnimations() {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');

            // Animate skill bars
            if (entry.target.classList.contains('skill-category')) {
              const fills = entry.target.querySelectorAll('.skill-fill');
              fills.forEach((fill, i) => {
                setTimeout(() => {
                  fill.style.width = fill.getAttribute('data-level') + '%';
                  fill.classList.add('animated');
                }, i * 150);
              });
            }

            // Counter animation for stats & metrics
            const counters = entry.target.querySelectorAll('.stat-number, .hero-metric-num, .pub-summary-num');
            counters.forEach((counter) => {
              animateCounter(counter);
            });
          }
        });
      },
      {
        threshold: 0.15,
        rootMargin: '0px 0px -50px 0px',
      }
    );

    document.querySelectorAll('.reveal-text').forEach((el) => {
      observer.observe(el);
    });

    // Stagger children in sections
    document.querySelectorAll('.section').forEach((section) => {
      const children = section.querySelectorAll('.reveal-text');
      children.forEach((child, i) => {
        child.style.transitionDelay = i * 0.08 + 's';
      });
    });
  }

  // ========================================
  //  COUNTER ANIMATION
  // ========================================
  function animateCounter(el) {
    const target = parseInt(el.getAttribute('data-count'));
    if (!target || el.dataset.animated) return;
    el.dataset.animated = 'true';

    let current = 0;
    const increment = target / 50;
    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        el.textContent = target;
        clearInterval(timer);
      } else {
        el.textContent = Math.floor(current);
      }
    }, 20);
  }

  // ========================================
  //  TILT EFFECT ON CARDS
  // ========================================
  function initTiltEffect() {
    const cards = document.querySelectorAll('.edu-card, .timeline-card');
    cards.forEach((card) => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const rotateX = ((y - centerY) / centerY) * -3;
        const rotateY = ((x - centerX) / centerX) * 3;

        card.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
      });

      card.addEventListener('mouseleave', () => {
        card.style.transform = 'perspective(800px) rotateX(0) rotateY(0)';
      });
    });
  }

  // ========================================
  //  MAGNETIC BUTTON EFFECT
  // ========================================
  function initMagneticButtons() {
    const buttons = document.querySelectorAll('.btn, .btn-glow');
    buttons.forEach((btn) => {
      btn.addEventListener('mousemove', (e) => {
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        btn.style.transform = `translate(${x * 0.15}px, ${y * 0.15}px)`;
      });
      btn.addEventListener('mouseleave', () => {
        btn.style.transform = '';
      });
    });
  }

  // ========================================
  //  INITIALIZATION
  // ========================================
  function init() {
    initThree();
    initEvents();
    initPubTabs();
    initRevealAnimations();
    initTiltEffect();
    initMagneticButtons();
    animate();

    // Trigger hero reveals
    setTimeout(() => {
      document.querySelectorAll('#hero .reveal-text').forEach((el, i) => {
        setTimeout(() => el.classList.add('visible'), i * 120);
      });
    }, 300);
  }

  // Start when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
