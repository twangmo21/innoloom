'use strict';

/* =========================================================
   INNOLOOM — Grade IX DTI learning prototype
   Plain HTML, CSS and JavaScript; no build step required.
   ========================================================= */

const STORAGE_KEY = 'innoloom_course_state_v4'; // Keep the same key so existing learner data can be migrated.
const CURRENT_USER_KEY = 'innoloom_current_v4';

const MODULES = [
  {
    id: 1, title: 'Module 1 — World Wide Web', badge: 'WWW Explorer', icon: 'globe',
    items: [['intro', 'Introduction'], ['overview', 'Overview'], ['www', 'World Wide Web'], ['dragdrop', 'Drag-and-Drop Assessment']]
  },
  {
    id: 2, title: 'Module 2 — Web Server', badge: 'Web Server Apprentice', icon: 'server',
    items: [['video', 'Interactive Video'], ['assessment', 'Grading Assessment']]
  },
  {
    id: 3, title: 'Module 3 — Web Browser', badge: 'Browser Basics', icon: 'browser',
    items: [['browser', 'Web Browser'], ['http', 'HTTP'], ['https', 'HTTPS'], ['differences', 'Difference between HTTP and HTTPS'], ['assessment', 'Grading Assessment']]
  },
  {
    id: 4, title: 'Module 4 — Website', badge: 'Website Explorer', icon: 'layout',
    items: [['video', 'What is a website?'], ['explore', 'Explore and Fix Website'], ['elements', 'Elements of Website'], ['assessment', 'Grading Assessment']]
  },
  {
    id: 5, title: 'Module 5 — HTML', badge: 'HTML Creator', icon: 'code',
    items: [
      ['html', 'What is HTML?'], ['document', 'Basic HTML Structure'],
      ['tags', 'Tags, Elements & Attributes'], ['firstsite', 'Create Your First HTML Page'],
      ['stepbystep', 'Interactive HTML Coding Lab'], ['miniproject', 'Mini-Project'],
      ['extension', 'Extension Challenge'], ['assessment', 'Grading Assessment']
    ]
  },
  {
    id: 6, title: 'Module 6 — SDLC', badge: 'SDLC Explorer', icon: 'workflow',
    items: [['introduction', 'Introduction to SDLC'], ['ido', 'I DO'], ['wedo', 'WE DO'], ['youdo', 'YOU DO'], ['assessment', 'Grading Assessment']]
  }
];

function makeDefaultState() {
  return {
    schemaVersion: 5,
    users: [],
    classes: [],
    progress: {},
    badges: {},
    assessmentResults: {},
    codingLab: {},
    feedback: []
  };
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const fresh = makeDefaultState();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(fresh));
      return fresh;
    }
    const parsed = JSON.parse(raw);
    if (!parsed || !Array.isArray(parsed.users) || !Array.isArray(parsed.classes)) {
      throw new Error('Saved data has an unexpected format.');
    }
    parsed.progress ||= {};
    parsed.badges ||= {};
    parsed.assessmentResults ||= {};
    parsed.codingLab ||= {};
    parsed.feedback ||= [];

    // Module 1 now uses the drag-and-drop activity as its only graded assessment.
    // Migrate earlier prototype data without discarding learners' other progress.
    if (parsed.schemaVersion !== 5) {
      Object.keys(parsed.progress).forEach(email => {
        const marks = parsed.progress[email] || {};
        if (marks['1:dragdrop']) {
          parsed.assessmentResults[email] ||= {};
          const previous = parsed.assessmentResults[email][1] || {};
          parsed.assessmentResults[email][1] = {
            attempts: Math.max(1, Number(previous.attempts) || 0),
            passed: true,
            bestScore: 100,
            latestScore: 100,
            completedAt: previous.completedAt || new Date().toISOString()
          };
        } else {
          if (parsed.assessmentResults[email]) delete parsed.assessmentResults[email][1];
          if (parsed.badges[email]) delete parsed.badges[email][1];
        }
        delete marks['1:assessment'];
      });
      parsed.schemaVersion = 5;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
    }
    return parsed;
  } catch (error) {
    console.error('Innoloom could not read saved data:', error);
    return makeDefaultState();
  }
}

function saveState(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    return true;
  } catch (error) {
    console.error('Innoloom could not save data:', error);
    alert('Your browser could not save the change. Check browser storage settings.');
    return false;
  }
}

function getUser() {
  const email = localStorage.getItem(CURRENT_USER_KEY);
  if (!email) return null;
  return loadState().users.find(person => person.email.toLowerCase() === email.toLowerCase()) || null;
}

function setCurrentUser(email) {
  localStorage.setItem(CURRENT_USER_KEY, String(email).toLowerCase());
}

function logout() {
  localStorage.removeItem(CURRENT_USER_KEY);
  location.href = 'index.html';
}

function escapeHTML(value = '') {
  return String(value).replace(/[&<>"']/g, character => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[character]);
}


function iconSVG(name, className = 'ui-icon') {
  const paths = {
    globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a15 15 0 0 1 0 18M12 3a15 15 0 0 0 0 18"/>',
    server: '<rect x="3" y="4" width="18" height="7" rx="2"/><rect x="3" y="13" width="18" height="7" rx="2"/><path d="M7 7.5h.01M7 16.5h.01M11 7.5h6M11 16.5h6"/>',
    browser: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 9h18M7 6.5h.01M10 6.5h.01M7 13h10M7 16h7"/>',
    layout: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 9h18M9 9v11M13 13h5M13 16h5"/>',
    code: '<path d="m8 8-4 4 4 4M16 8l4 4-4 4M14 5l-4 14"/>',
    workflow: '<rect x="3" y="4" width="6" height="5" rx="1"/><rect x="15" y="15" width="6" height="5" rx="1"/><rect x="15" y="4" width="6" height="5" rx="1"/><path d="M9 6.5h6M18 9v3a3 3 0 0 1-3 3h-3M12 15l-3 3 3 3"/>',
    book: '<path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v17H6.5A2.5 2.5 0 0 0 4 22z"/><path d="M4 5.5v14A2.5 2.5 0 0 1 6.5 17H20M8 7h8M8 10h8"/>',
    shield: '<path d="M12 3 20 6v5c0 5-3.4 8.3-8 10-4.6-1.7-8-5-8-10V6z"/><path d="m8.5 12 2.2 2.2 4.8-5"/>',
    network: '<circle cx="12" cy="12" r="2.5"/><circle cx="5" cy="5" r="2"/><circle cx="19" cy="5" r="2"/><circle cx="5" cy="19" r="2"/><circle cx="19" cy="19" r="2"/><path d="m10 10-3.5-3.5M14 10l3.5-3.5M10 14l-3.5 3.5M14 14l3.5 3.5"/>',
    trophy: '<path d="M8 4h8v4a4 4 0 0 1-8 0zM8 6H4v2a4 4 0 0 0 4 4M16 6h4v2a4 4 0 0 1-4 4M12 12v5M8 21h8M10 17h4"/>',
    puzzle: '<path d="M4 4h5a2 2 0 1 1 4 0h7v7a2 2 0 1 0 0 4v5h-7a2 2 0 1 1-4 0H4v-5a2 2 0 1 0 0-4z"/>',
    external: '<path d="M14 3h7v7M10 14 21 3M19 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h6"/>',
    video: '<rect x="3" y="5" width="13" height="14" rx="2"/><path d="m16 10 5-3v10l-5-3z"/>',
    download: '<path d="M12 3v12m-5-5 5 5 5-5M4 20h16"/>',
    css: '<path d="M5 4h14l-1.3 15L12 21l-5.7-2z"/><path d="M8 8h8M8.5 12h7M9 16l3 .8 3-.8"/>',
    globeShield: '<circle cx="10" cy="12" r="8"/><path d="M2 12h16M10 4a14 14 0 0 1 0 16M10 4a14 14 0 0 0 0 16M18 12l3 1v3c0 2-1.2 3.4-3 4-1.8-.6-3-2-3-4v-3z"/>'
  };
  const content = paths[name] || paths.book;
  return `<svg class="${className}" viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${content}</svg>`;
}

function setMessage(id, text, type = '') {
  const element = document.getElementById(id);
  if (!element) return;
  element.textContent = text;
  element.className = `form-message ${type}`.trim();
}

/* ------------------ Form validation ------------------ */

function emailError(value) {
  const email = String(value || '').trim();
  if (!email) return 'Email address is required.';
  if (email.length > 254) return 'Email address is too long.';

  const parts = email.split('@');
  if (parts.length !== 2) return 'Enter a valid email address.';
  const [local, domain] = parts;
  if (!local || !domain || local.length > 64 || local.startsWith('.') || local.endsWith('.') || local.includes('..')) {
    return 'Enter a valid email address.';
  }

  const pattern = /^[A-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[A-Z0-9](?:[A-Z0-9-]{0,61}[A-Z0-9])?(?:\.[A-Z0-9](?:[A-Z0-9-]{0,61}[A-Z0-9])?)+$/i;
  return pattern.test(email) ? '' : 'Enter a valid email address, e.g. student@example.com.';
}

function passwordError(value) {
  const password = String(value || '');
  if (!password) return 'Password is required.';
  if (password.length < 10) return 'Use at least 10 characters.';
  if (password.length > 72) return 'Password must not exceed 72 characters.';
  if (/\s/.test(password)) return 'Password must not contain spaces.';
  if (!/[A-Z]/.test(password)) return 'Include at least one uppercase letter.';
  if (!/[a-z]/.test(password)) return 'Include at least one lowercase letter.';
  if (!/[0-9]/.test(password)) return 'Include at least one number.';
  if (!/[^A-Za-z0-9]/.test(password)) return 'Include at least one symbol, such as ! or @.';

  const common = ['Password123!', 'Welcome123!', 'Qwerty123!', 'Admin123!', 'Abcdef123!'];
  if (common.some(candidate => candidate.toLowerCase() === password.toLowerCase())) {
    return 'Choose a less predictable password.';
  }
  return '';
}

function validatePassword(password) {
  return passwordError(password) === '';
}

function validateName(value) {
  const name = String(value || '').trim();
  if (!name) return 'Full name is required.';
  if (name.length < 2 || name.length > 80) return 'Name must be between 2 and 80 characters.';
  if (!/^[\p{L}\p{M}][\p{L}\p{M} .’'-]*$/u.test(name)) {
    return 'Use letters, spaces, apostrophes, periods or hyphens only.';
  }
  if (name.replace(/[\s.’'-]/g, '').length < 2) return 'Please enter a meaningful name.';
  return '';
}

function validateSchool(value) {
  const school = String(value || '').trim();
  if (!school) return 'School name is required.';
  if (school.length < 2 || school.length > 120) return 'School name must be between 2 and 120 characters.';
  if (/[\u0000-\u001F\u007F<>]/.test(school)) return 'Please enter a valid school name.';
  return '';
}

function validateBio(value) {
  const bio = String(value || '');
  if (bio.length > 500) return 'Your bio must be no longer than 500 characters.';
  if (/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/.test(bio)) return 'Your bio contains invalid characters.';
  return '';
}

function setFieldError(form, fieldName, message) {
  const field = form.querySelector(`[name="${fieldName}"]`);
  if (!field) return;
  const group = field.closest('.form-group');
  const error = group ? group.querySelector('.field-error') : null;
  if (error) error.textContent = message;
  field.setAttribute('aria-invalid', message ? 'true' : 'false');
}

function setInputError(input, message) {
  if (!input) return;
  const group = input.closest('.form-group');
  const error = group ? group.querySelector('.field-error') : null;
  if (error) error.textContent = message;
  input.setAttribute('aria-invalid', message ? 'true' : 'false');
}

function clearFieldErrors(form) {
  form.querySelectorAll('.field-error').forEach(node => { node.textContent = ''; });
  form.querySelectorAll('[aria-invalid]').forEach(node => node.removeAttribute('aria-invalid'));
}

/* ------------------ Shared page chrome ------------------ */

function renderHeader() {
  const current = getUser();
  const headerHost = document.getElementById('site-header');
  if (!headerHost) return;

  headerHost.innerHTML = `
    <div class="site-header">
      <div class="header-inner">
        <a class="brand" href="index.html" aria-label="Innoloom home">
          <img class="innoloom-logo" src="assets/innoloom-logo.png" alt="Innoloom logo">
          <span class="brand-text">
            <strong>Innoloom</strong>
            <span>DTI Learning Platform</span>
          </span>
        </a>
        <div class="header-curriculum">
          Aligned to Bhutan's Class IX Digital<br>
          Technology and Innovation (DTI) Curriculum
        </div>
      </div>
      <nav class="top-nav" aria-label="Main navigation">
        <div class="top-nav-inner">
          <a href="${current ? 'course.html' : 'login.html'}" ${current ? '' : 'title="Log in to access the course"'}>Courses</a>
          <a href="resources.html">Resources</a>
          <a href="feedback.html">Feedback</a>
          <a href="about.html">About</a>
          ${current && current.role === 'teacher' ? '<a href="teacher.html">Teacher Dashboard</a>' : ''}
          ${current
            ? `<span class="user-pill">${escapeHTML(current.name)} (${current.role})</span><button id="logout-btn" class="btn btn-outline" type="button">Logout</button>`
            : '<a class="auth-nav-link" href="login.html">Login</a><a class="auth-nav-link auth-nav-signup" href="signup.html">Sign Up</a>'}
        </div>
      </nav>
    </div>
  `;
  document.getElementById('logout-btn')?.addEventListener('click', logout);
}

function renderFooter() {
  const footerHost = document.getElementById('site-footer');
  if (footerHost) {
    footerHost.innerHTML = '<div class="site-footer">© 2026 Innoloom. Built for independent, self-paced student practice.</div>';
  }
}

function initShell() {
  renderHeader();
  renderFooter();
}

/* ------------------ Accessible congratulation pop-ups ------------------ */

function showBadgePopup(title, icon, description) {
  let layer = document.getElementById('innoloom-badge-modal');
  if (!layer) {
    layer = document.createElement('div');
    layer.id = 'innoloom-badge-modal';
    layer.className = 'innoloom-modal';
    layer.hidden = true;
    document.body.appendChild(layer);
  }

  layer.innerHTML = `
    <section class="badge-dialog" role="dialog" aria-modal="true" aria-labelledby="badge-dialog-title">
      <button type="button" class="modal-close" aria-label="Close congratulation">×</button>
      <div class="badge-fireworks" aria-hidden="true"></div>
      <div class="badge-sparkle" aria-hidden="true">✦ ✧ ✦</div>
      <div class="badge-dialog-icon" aria-hidden="true">
        <img class="module-completion-badge" src="assets/module-completion-badge.jpg" alt="">
      </div>
      <p class="eyebrow">Congratulations!</p>
      <h2 id="badge-dialog-title">${escapeHTML(title)}</h2>
      <p>${escapeHTML(description)}</p>
      <div class="badge-dialog-ribbon">Achievement unlocked</div>
      <button type="button" class="btn btn-primary modal-continue">Continue learning</button>
    </section>
  `;
  // Create a short celebratory burst around the badge whenever a new award is earned.
  const fireworks = layer.querySelector('.badge-fireworks');
  if (fireworks && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const colors = ['#f5c542', '#e94b64', '#36a6d8', '#6fc58a', '#a78bfa'];
    for (let i = 0; i < 42; i += 1) {
      const spark = document.createElement('span');
      spark.className = 'badge-firework-spark';
      const angle = (Math.PI * 2 * i) / 42 + (Math.random() - 0.5) * 0.22;
      const distance = 95 + Math.random() * 155;
      spark.style.setProperty('--spark-x', `${Math.cos(angle) * distance}px`);
      spark.style.setProperty('--spark-y', `${Math.sin(angle) * distance}px`);
      spark.style.setProperty('--spark-delay', `${Math.random() * 180}ms`);
      spark.style.setProperty('--spark-color', colors[i % colors.length]);
      fireworks.appendChild(spark);
    }
  }
  layer.hidden = false;
  document.body.classList.add('modal-open');

  const close = () => {
    layer.hidden = true;
    document.body.classList.remove('modal-open');
    window.removeEventListener('keydown', onKeydown);
  };
  const onKeydown = event => {
    if (event.key === 'Escape') close();
  };
  layer.querySelector('.modal-close').addEventListener('click', close);
  layer.querySelector('.modal-continue').addEventListener('click', close);
  layer.onclick = event => {
    if (event.target === layer) close();
  };
  window.addEventListener('keydown', onKeydown);
  layer.querySelector('.modal-continue').focus();
}

/* ------------------ Progress and badges ------------------ */

function allCourseItems() {
  return MODULES.flatMap(module => module.items.map(item => `${module.id}:${item[0]}`));
}


/* Course gating: every prior item must be completed before a later item opens. */
function courseSequence() {
  return [
    ...MODULES.flatMap(module => module.items.map(item => ({
      moduleId: module.id,
      sectionId: item[0],
      title: item[1]
    }))),
    { moduleId: 7, sectionId: 'summary', title: 'Course Summary' },
    { moduleId: 8, sectionId: 'overall', title: 'Overall Assessment' }
  ];
}

function sequenceItemIndex(moduleId, sectionId) {
  return courseSequence().findIndex(item =>
    item.moduleId === Number(moduleId) && item.sectionId === sectionId
  );
}

function canAccessItem(moduleId, sectionId, email = null) {
  const sequence = courseSequence();
  const index = sequenceItemIndex(moduleId, sectionId);
  if (index < 0) return false;
  return sequence.slice(0, index).every(item =>
    isDone(item.moduleId, item.sectionId, email)
  );
}

function firstIncompleteItem(email = null) {
  const sequence = courseSequence();
  return sequence.find(item => !isDone(item.moduleId, item.sectionId, email)) || null;
}

function sectionIsComplete(moduleId, sectionId) {
  return isDone(moduleId, sectionId);
}

function isAssessmentSection(moduleId, sectionId) {
  const id = Number(moduleId);
  return (id === 1 && sectionId === 'dragdrop') ||
    (id >= 2 && id <= 6 && sectionId === 'assessment') ||
    (id === 8 && sectionId === 'overall');
}

function isVideoSection(moduleId, sectionId) {
  return ([2, 4].includes(Number(moduleId)) && sectionId === 'video') || (Number(moduleId) === 5 && ['document', 'tags', 'firstsite', 'miniproject'].includes(sectionId)) || (Number(moduleId) === 6 && ['introduction', 'wedo', 'youdo'].includes(sectionId));
}

function completeButtonState(moduleId, sectionId) {
  if (sectionIsComplete(moduleId, sectionId)) {
    return { disabled: true, label: '✓ Completed' };
  }
  if (isAssessmentSection(moduleId, sectionId)) {
    return {
      disabled: true,
      label: Number(moduleId) === 1 ? 'Submit the drag-and-drop assessment to complete' : 'Pass assessment to complete'
    };
  }
  if (isVideoSection(moduleId, sectionId)) {
    return { disabled: true, label: 'Watch video to complete' };
  }
  if (Number(moduleId) === 5 && sectionId === 'stepbystep' && !htmlCodingLabIsComplete()) {
    return { disabled: true, label: 'Complete all coding challenges and the quick check' };
  }
  if (Number(moduleId) === 7 && !allModulesComplete()) {
    return { disabled: true, label: 'Complete Modules 1–6 first' };
  }
  if (Number(moduleId) === 8 && !isDone(7, 'summary')) {
    return { disabled: true, label: 'Complete the summary first' };
  }
  return { disabled: false, label: 'Mark as complete' };
}

function progressKey(email = null) {
  const person = email ? { email } : getUser();
  return person ? person.email.toLowerCase() : 'guest';
}

function isDone(moduleId, sectionId, email = null) {
  const data = loadState();
  return Boolean(data.progress[progressKey(email)]?.[`${moduleId}:${sectionId}`]);
}

function markDone(moduleId, sectionId, email = null) {
  const wasBadgeEarned = moduleId >= 1 && moduleId <= 6
    ? hasBadge(moduleId, email)
    : false;
  const data = loadState();
  const key = progressKey(email);
  data.progress[key] ||= {};
  data.progress[key][`${moduleId}:${sectionId}`] = true;
  if (!saveState(data)) return;
  updateBadges(email);
  refreshModuleIndicators();

  // Only show a pop-up when the currently signed-in learner newly earns a badge.
  if (email === null && moduleId >= 1 && moduleId <= 6 && !wasBadgeEarned && hasBadge(moduleId)) {
    const completedModule = MODULES[moduleId - 1];
    showBadgePopup(
      completedModule.badge,
      completedModule.icon,
      `You completed ${completedModule.title}. Keep going to unlock your next achievement!`
    );
  }
}


function recordAssessmentResult(moduleId, score, total, passed) {
  const data = loadState();
  const key = progressKey();
  data.assessmentResults ||= {};
  data.assessmentResults[key] ||= {};
  const previous = data.assessmentResults[key][moduleId] || { attempts: 0, passed: false, bestScore: 0 };
  data.assessmentResults[key][moduleId] = {
    attempts: previous.attempts + 1,
    passed: previous.passed || passed,
    bestScore: Math.max(previous.bestScore || 0, Math.round((score / total) * 100)),
    latestScore: Math.round((score / total) * 100),
    completedAt: passed ? new Date().toISOString() : (previous.completedAt || null)
  };
  saveState(data);
}

function assessmentPassMark() {
  return 70;
}

function countDone(email = null) {
  const data = loadState();
  const marks = data.progress[progressKey(email)] || {};
  return Object.values(marks).filter(Boolean).length;
}

function courseProgress(email = null) {
  // Six-module items plus the course summary and overall assessment.
  const total = allCourseItems().length + 2;
  return Math.min(100, Math.round((countDone(email) / total) * 100));
}

function updateBadges(email = null) {
  const data = loadState();
  const key = progressKey(email);
  data.badges[key] ||= {};
  MODULES.forEach(module => {
    if (module.items.every(item => isDone(module.id, item[0], email))) {
      data.badges[key][module.id] = true;
    }
  });
  saveState(data);
}

function hasBadge(moduleId, email = null) {
  const data = loadState();
  return Boolean(data.badges[progressKey(email)]?.[moduleId]);
}

function refreshModuleIndicators() {
  const percentage = courseProgress();
  const label = document.getElementById('progress-label');
  const bar = document.getElementById('progress-bar');
  if (label) label.textContent = `${percentage}%`;
  if (bar) bar.style.width = `${percentage}%`;

  const parameters = new URLSearchParams(location.search);
  const moduleId = Number(parameters.get('m') || '1');
  const rawSectionId = parameters.get('s') || 'intro';
  const isBrowserMenuView = moduleId === 3 && (rawSectionId === 'menu' || parameters.get('view') === 'menu');
  const isBrowserDetailView = moduleId === 3 && !isBrowserMenuView && ['browser', 'http', 'https', 'differences'].includes(rawSectionId);
  const sectionId = isBrowserMenuView ? 'menu' : rawSectionId;

  const completeButton = document.getElementById('complete-section');
  if (completeButton) {
    completeButton.style.display = (isBrowserMenuView || isBrowserDetailView) ? 'none' : '';
    const buttonState = completeButtonState(moduleId, sectionId);
    completeButton.disabled = buttonState.disabled;
    completeButton.textContent = buttonState.label;
    completeButton.title = buttonState.disabled ? buttonState.label : 'Mark this section complete to unlock Next.';
  }

  const previousLink = document.getElementById('prev-link');
  const nextLink = document.getElementById('next-link');
  const learningNav = document.querySelector('.learning-nav');
  if (isBrowserDetailView) {
    if (previousLink) previousLink.style.display = 'none';
    if (nextLink) nextLink.style.display = 'none';
    if (learningNav) learningNav.style.display = 'none';
  } else {
    if (previousLink) previousLink.style.display = '';
    if (nextLink) nextLink.style.display = isBrowserMenuView ? 'none' : '';
    if (learningNav) learningNav.style.display = '';
  }
  if (nextLink) {
    const completed = sectionIsComplete(moduleId, sectionId);
    nextLink.href = nextURL(moduleId, sectionId);
    nextLink.classList.toggle('is-disabled', !completed);
    nextLink.setAttribute('aria-disabled', String(!completed));
    nextLink.tabIndex = completed ? 0 : -1;
    nextLink.title = completed ? 'Continue to the next section.' : 'Complete this section and mark it complete before continuing.';
    nextLink.onclick = event => {
      if (!sectionIsComplete(moduleId, sectionId)) {
        event.preventDefault();
        alert('Complete this section and mark it complete before moving to the next section. Assessments must be passed first.');
      }
    };
  }

  const sidebarHost = document.getElementById('course-sidebar');
  if (sidebarHost) {
    sidebarHost.innerHTML = renderSidebar(moduleId, sectionId);
    sidebarHost.onclick = event => {
      const link = event.target.closest('a[data-course-link]');
      if (!link) return;
      if (link.dataset.locked === 'true') {
        event.preventDefault();
        alert('This section is locked. Complete the previous section and mark it complete first.');
      }
    };
  }

  const badgeArea = document.getElementById('badge-area');
  // Congratulations are presented in a modal when a badge is newly earned.
  if (badgeArea) badgeArea.innerHTML = '';
}
function allModulesComplete(email = null) {
  return MODULES.every(module => module.items.every(item => isDone(module.id, item[0], email)));
}

function awardCourseBadge() {
  const data = loadState();
  const key = progressKey();
  const alreadyAwarded = Boolean(data.badges[key]?.overall);
  data.badges[key] ||= {};
  data.badges[key].overall = true;
  data.progress[key] ||= {};
  data.progress[key]['8:overall'] = true;
  if (!saveState(data)) return;
  refreshModuleIndicators();
  if (!alreadyAwarded) {
    showBadgePopup(
      'Innoloom Course Champion',
      'trophy',
      'You passed the overall assessment and completed the Grade IX DTI learning journey.'
    );
  }
}

function itemURL(moduleId, sectionId) {
  return `module.html?m=${moduleId}&s=${encodeURIComponent(sectionId)}`;
}

function previousURL(moduleId, sectionId) {
  if (moduleId === 3) return 'module.html?m=3&s=menu';
  if (moduleId === 1 && sectionId === 'intro') return 'course.html';
  if (moduleId === 7) return itemURL(6, 'assessment');
  if (moduleId === 8) return itemURL(7, 'summary');
  const module = MODULES.find(item => item.id === moduleId);
  const index = module ? module.items.findIndex(item => item[0] === sectionId) : -1;
  if (index > 0) return itemURL(moduleId, module.items[index - 1][0]);
  const previous = MODULES.find(item => item.id === moduleId - 1);
  return previous ? itemURL(previous.id, previous.items[previous.items.length - 1][0]) : 'course.html';
}

function nextURL(moduleId, sectionId) {
  if (moduleId === 7) return itemURL(8, 'overall');
  if (moduleId === 8) return 'course.html';
  const module = MODULES.find(item => item.id === moduleId);
  if (!module) return 'course.html';
  const index = module.items.findIndex(item => item[0] === sectionId);
  if (index >= 0 && index < module.items.length - 1) return itemURL(moduleId, module.items[index + 1][0]);
  const next = MODULES.find(item => item.id === moduleId + 1);
  if (next && next.id === 3) return 'module.html?m=3&s=menu';
  return next ? itemURL(next.id, next.items[0][0]) : itemURL(7, 'summary');
}

function renderSidebar(activeModule, activeSection) {
  function makeLink(moduleId, sectionId, label, active = false, extraClass = '') {
    const unlocked = canAccessItem(moduleId, sectionId);
    const classes = ['sidebar-sub', active ? 'active' : '', !unlocked ? 'is-locked' : '', extraClass].filter(Boolean).join(' ');
    return `<a class="${classes}" data-course-link="true" data-locked="${unlocked ? 'false' : 'true'}" href="${itemURL(moduleId, sectionId)}" ${unlocked ? '' : 'aria-disabled="true" tabindex="-1" title="Complete the previous section first."'}>${escapeHTML(label)}${unlocked ? '' : `<span class="sidebar-state-icon">${iconSVG('shield')}</span>`}</a>`;
  }

  let html = '<div class="sidebar-title">COURSE<br>OVERVIEW</div><a class="sidebar-sub" href="course.html">Course Overview</a>';
  MODULES.forEach(module => {
    const complete = module.items.every(item => isDone(module.id, item[0]));
    const firstSection = module.items[0][0];
    const unlocked = canAccessItem(module.id, firstSection);
    const moduleHref = module.id === 3 ? 'module.html?m=3&s=menu' : itemURL(module.id, firstSection);
    html += `<div class="sidebar-module"><a data-course-link="true" data-locked="${unlocked ? 'false' : 'true'}" class="${activeModule === module.id ? 'active' : ''} ${unlocked ? '' : 'is-locked'}" href="${moduleHref}" ${unlocked ? '' : 'aria-disabled="true" tabindex="-1" title="Complete the previous section first."'}>${escapeHTML(module.title)} ${complete ? `<span class="sidebar-badge-icon">${iconSVG('trophy')}</span>` : (!unlocked ? `<span class="sidebar-state-icon">${iconSVG('shield')}</span>` : '')}</a>`;
    module.items.forEach(item => {
      const active = activeModule === module.id && activeSection === item[0];
      html += makeLink(module.id, item[0], item[1], active);
    });
    html += '</div>';
  });
  html += makeLink(7, 'summary', 'Course Summary', activeModule === 7);
  html += makeLink(8, 'overall', 'Overall Assessment', activeModule === 8);
  return html;
}
function lessonHeader(moduleId, title, subtitle = '') {
  const module = MODULES.find(item => item.id === moduleId);
  return `<div class="lesson-card"><p class="eyebrow">${module ? escapeHTML(module.title) : 'Innoloom'}</p><h1>${escapeHTML(title)}</h1>${subtitle ? `<p class="muted">${escapeHTML(subtitle)}</p>` : ''}`;
}


function browserReadingFooter(sectionId) {
  const completed = isDone(3, sectionId);
  return `
    <div class="browser-reading-footer">
      <p class="browser-reading-status">
        ${completed
          ? `${iconSVG('check')} This reading section has been marked complete. You can return to the four sections and choose the next one.`
          : 'When you finish reading, mark this section complete. Then return to the four sections to choose the next topic.'}
      </p>
      <div class="browser-reading-actions">
        <button type="button" class="btn btn-primary" data-browser-mark="${sectionId}" ${completed ? 'disabled' : ''}>
          ${completed ? '✓ Reading marked complete' : 'Mark this reading complete'}
        </button>
        <a class="btn btn-outline ${completed ? '' : 'is-disabled'}"
           href="module.html?m=3&amp;s=menu"
           data-browser-return="true"
           aria-disabled="${completed ? 'false' : 'true'}">
          ← Back to the four sections
        </a>
      </div>
    </div>`;
}

/* ------------------ Interactive HTML Coding Lab ------------------ */

const HTML_LAB_CHALLENGES = [
  {
    id: 1,
    title: 'Challenge 1: Create a Heading',
    task: 'Create a heading containing your name. Replace the placeholder text with your own name.',
    example: '<h1>My Name</h1>',
    starter: '<h1>Your Name</h1>',
    hint: 'The <h1> element creates the main or largest heading on a webpage. It needs an opening <h1> tag and a closing </h1> tag.',
    checks: [
      'An opening <h1> tag is present.',
      'Your name appears between the tags.',
      'A closing </h1> tag is present.'
    ]
  },
  {
    id: 2,
    title: 'Challenge 2: Introduce Yourself',
    task: 'Keep your heading and add a paragraph of one or two sentences introducing yourself. You can mention your school, hobbies, interests, or something you enjoy learning.',
    example: '<h1>Pema</h1>\n<p>I am a Class IX student. I enjoy learning about computers.</p>',
    starter: '<h1>Your Name</h1>\n<p>Write one or two sentences about yourself.</p>',
    hint: 'The <p> element is used to create a paragraph. Put your sentence between <p> and </p>.',
    checks: [
      'Your heading is still present.',
      'At least one <p> element is present.',
      'The paragraph contains your own introduction, not the placeholder instruction.'
    ]
  },
  {
    id: 3,
    title: 'Challenge 3: Create a Hyperlink',
    task: 'Keep your heading and paragraph. Add a hyperlink to a website you would like to visit. Add a real website address in the href attribute.',
    example: '<a href="https://www.rub.edu.bt" target="_blank">Visit RUB</a>',
    starter: '<h1>Your Name</h1>\n<p>I am a Class IX student learning HTML.</p>\n<a href="">Visit a website</a>',
    hint: 'The <a> element creates a hyperlink. The href attribute stores the destination address. Use a complete address beginning with https:// or http://.',
    checks: [
      'Your heading and paragraph are present.',
      'An <a> element contains clickable text.',
      'The href attribute contains a valid http:// or https:// address.'
    ]
  },
  {
    id: 4,
    title: 'Challenge 4: Build Your Complete Webpage',
    task: 'Put everything together. Your webpage must contain your name as a heading, a short introduction, and a hyperlink to a website you like.',
    example: '<h1>Pema</h1>\n\n<p>I am a Class IX student learning HTML.</p>\n\n<a href="https://www.rub.edu.bt" target="_blank">Visit RUB</a>',
    starter: '<h1>Your Name</h1>\n\n<p>Write a short introduction about yourself.</p>\n\n<a href="" target="_blank">Visit my favourite website</a>',
    hint: 'Check the three main elements: <h1> for your name, <p> for your introduction, and <a href="..."> for the link. Remember to give the hyperlink a real destination.',
    checks: [
      'A meaningful <h1> heading contains your name.',
      'A <p> paragraph contains your introduction.',
      'An <a> element has clickable text and a valid href destination.'
    ]
  }
];

function getHTMLLabRecord() {
  const data = loadState();
  data.codingLab ||= {};
  const key = progressKey();
  data.codingLab[key] ||= {
    completedChallenges: [],
    drafts: {},
    activeChallenge: 1,
    quickCheckPassed: false
  };
  const record = data.codingLab[key];
  if (!Array.isArray(record.completedChallenges)) record.completedChallenges = [];
  if (!record.drafts || typeof record.drafts !== 'object') record.drafts = {};
  if (!Number.isInteger(record.activeChallenge)) record.activeChallenge = 1;
  record.quickCheckPassed = Boolean(record.quickCheckPassed);
  return { data, key, record };
}

function saveHTMLLabRecord(record) {
  const data = loadState();
  data.codingLab ||= {};
  data.codingLab[progressKey()] = record;
  return saveState(data);
}

function htmlLabChallengeDone(challengeId) {
  return getHTMLLabRecord().record.completedChallenges.includes(challengeId);
}

function htmlLabChallengeUnlocked(challengeId) {
  if (challengeId === 1) return true;
  const record = getHTMLLabRecord().record;
  return HTML_LAB_CHALLENGES
    .filter(challenge => challenge.id < challengeId)
    .every(challenge => record.completedChallenges.includes(challenge.id));
}

function htmlCodingLabIsComplete() {
  const record = getHTMLLabRecord().record;
  return HTML_LAB_CHALLENGES.every(challenge =>
    record.completedChallenges.includes(challenge.id)
  ) && record.quickCheckPassed;
}

function htmlCodingLabMarkup() {
  const { record } = getHTMLLabRecord();
  const activeChallenge = Math.min(4, Math.max(1, record.activeChallenge));
  return lessonHeader(5, 'Interactive HTML Coding Lab', 'Build Your Webpage') + `
    <div class="html-lab-intro">
      <h2>Welcome to the HTML Coding Lab!</h2>
      <p>In this activity, you will create a simple webpage by writing HTML code directly in the editor. You do not need to open another application such as VS Code or Notepad.</p>
    </div>

    <section class="html-lab-learning-goal">
      <h2>🎯 Learning Goal</h2>
      <p>By the end of this activity, you will be able to:</p>
      <ul>
        <li>Create a heading using the <code>&lt;h1&gt;</code> element.</li>
        <li>Create a paragraph using the <code>&lt;p&gt;</code> element.</li>
        <li>Create a hyperlink using the <code>&lt;a&gt;</code> element.</li>
        <li>Use the <code>href</code> attribute to specify the destination of a hyperlink.</li>
        <li>Run HTML code and view the result in a browser preview.</li>
      </ul>
    </section>

    <section class="html-lab-howto">
      <h2>📝 How to Use the Coding Lab</h2>
      <ol>
        <li><strong>Step 1:</strong> Read the instruction carefully.</li>
        <li><strong>Step 2:</strong> Type or edit the HTML code in the coding box.</li>
        <li><strong>Step 3:</strong> Click <strong>Run Code</strong>.</li>
        <li><strong>Step 4:</strong> Look at the result in the preview window.</li>
        <li><strong>Step 5:</strong> Check the feedback.</li>
        <li><strong>Step 6:</strong> If your answer is incorrect, read the hint and try again.</li>
      </ol>
      <p>Don't worry about making mistakes. Coding is a process of experimenting, testing, finding errors, and improving your code.</p>
    </section>

    <section class="html-lab-progress" aria-live="polite">
      <div><strong>Your coding challenges</strong><span id="html-lab-progress-label"></span></div>
      <div class="html-lab-progress-track"><span id="html-lab-progress-bar"></span></div>
    </section>

    <nav id="html-lab-challenge-nav" class="html-lab-challenge-nav" aria-label="Coding challenges">
      ${HTML_LAB_CHALLENGES.map(challenge => {
        const completed = record.completedChallenges.includes(challenge.id);
        const unlocked = challenge.id === 1 || HTML_LAB_CHALLENGES
          .filter(item => item.id < challenge.id)
          .every(item => record.completedChallenges.includes(item.id));
        return `<button type="button" class="html-lab-challenge-tab ${challenge.id === activeChallenge ? 'active' : ''} ${completed ? 'completed' : ''} ${unlocked ? '' : 'locked'}" data-lab-challenge="${challenge.id}" ${unlocked ? '' : 'disabled'}>
          <span>${completed ? '✓' : challenge.id}</span>${challenge.title.replace(/^Challenge \d+: /, '')}
        </button>`;
      }).join('')}
    </nav>

    <div id="html-lab-current-challenge"></div>

    <section id="html-lab-quick-check" class="html-lab-quick-check" ${record.completedChallenges.includes(4) ? '' : 'hidden'}>
      <h2>🧠 Quick Check</h2>
      <p><strong>Which attribute specifies the destination of a hyperlink?</strong></p>
      <div class="html-lab-quick-options">
        <label><input type="radio" name="html-lab-quick-answer" value="A"> A. <code>src</code></label>
        <label><input type="radio" name="html-lab-quick-answer" value="B"> B. <code>href</code></label>
        <label><input type="radio" name="html-lab-quick-answer" value="C"> C. <code>link</code></label>
        <label><input type="radio" name="html-lab-quick-answer" value="D"> D. <code>url</code></label>
      </div>
      <button id="html-lab-check-quick" class="btn btn-primary" type="button" ${record.quickCheckPassed ? 'disabled' : ''}>Check my answer</button>
      <p id="html-lab-quick-feedback" class="form-message" role="status" aria-live="polite">${record.quickCheckPassed ? 'Correct! The href attribute tells the browser where the hyperlink should take the user.' : 'Complete Challenge 4 to unlock this quick check.'}</p>
    </section>

    <section id="html-lab-finish" class="html-lab-finish" ${htmlCodingLabIsComplete() ? '' : 'hidden'}>
      <div class="html-lab-finish-icon">🎉</div>
      <h2>Well Done!</h2>
      <p>You have created a webpage using HTML. You have practised headings, paragraphs, hyperlinks, the <code>href</code> attribute, and running code in a browser preview.</p>
      <p><strong>All four coding challenges and the Quick Check are complete.</strong> Now click “Mark as complete” below this lesson to record your work and unlock the Mini-Project.</p>
    </section>
  </div>`;
}

function getHTMLLabChallenge(challengeId) {
  return HTML_LAB_CHALLENGES.find(challenge => challenge.id === challengeId);
}

function htmlLabChallengePanelMarkup(challengeId) {
  const challenge = getHTMLLabChallenge(challengeId);
  const { record } = getHTMLLabRecord();
  const draft = Object.prototype.hasOwnProperty.call(record.drafts, challengeId)
    ? record.drafts[challengeId]
    : challenge.starter;
  const completed = record.completedChallenges.includes(challengeId);

  return `
    <section class="html-lab-challenge-panel">
      <div class="html-lab-challenge-heading">
        <p class="eyebrow">Challenge ${challenge.id} of 4 ${completed ? '· Completed ✓' : ''}</p>
        <h2>${escapeHTML(challenge.title)}</h2>
      </div>
      <h3>Task</h3>
      <p>${escapeHTML(challenge.task)}</p>
      <div class="html-lab-example">
        <h3>Example</h3>
        <pre><code>${escapeHTML(challenge.example)}</code></pre>
      </div>
      <div class="html-lab-workspace">
        <div class="html-lab-editor-column">
          <label for="html-lab-editor"><strong>Your HTML code</strong></label>
          <textarea id="html-lab-editor" class="html-lab-editor" spellcheck="false" autocapitalize="off" autocomplete="off" aria-describedby="html-lab-editor-help">${escapeHTML(draft)}</textarea>
          <p id="html-lab-editor-help" class="html-lab-editor-help">Write or edit HTML in this box. This lab supports HTML for these challenges; JavaScript is not needed.</p>
          <div class="html-lab-actions">
            <button id="html-lab-run" class="btn btn-primary" type="button">▶ Run Code</button>
            <button id="html-lab-reset" class="btn btn-outline" type="button">Reset code</button>
          </div>
          <details class="html-lab-hint">
            <summary>💡 Show hint</summary>
            <p>${escapeHTML(challenge.hint)}</p>
          </details>
          <div class="html-lab-success-checks">
            <strong>✅ Success Check</strong>
            <ul>${challenge.checks.map(check => `<li>${escapeHTML(check)}</li>`).join('')}</ul>
          </div>
          <p id="html-lab-feedback" class="form-message" role="status" aria-live="polite">${completed ? 'This challenge has already been completed. You can still edit and run your code for practice.' : 'Run your code to see the preview and receive feedback.'}</p>
          <div id="html-lab-next-challenge"></div>
        </div>
        <div class="html-lab-preview-column">
          <div class="html-lab-preview-heading"><strong>Browser Preview</strong><span>Output</span></div>
          <iframe id="html-lab-preview" class="html-lab-preview" title="Your HTML webpage preview" sandbox="allow-popups" referrerpolicy="no-referrer"></iframe>
        </div>
      </div>
    </section>`;
}

function validateHTMLLabCode(challengeId, code) {
  const source = String(code || '');
  const parsed = new DOMParser().parseFromString(source, 'text/html');
  const heading = parsed.querySelector('h1');
  const paragraph = parsed.querySelector('p');
  const anchor = parsed.querySelector('a');
  const issues = [];
  const headingText = heading?.textContent.trim() || '';
  const paragraphText = paragraph?.textContent.trim() || '';
  const linkText = anchor?.textContent.trim() || '';
  const href = anchor?.getAttribute('href')?.trim() || '';
  let validHref = false;

  if (href) {
    try {
      const url = new URL(href);
      validHref = ['http:', 'https:'].includes(url.protocol) && Boolean(url.hostname);
    } catch (error) {
      validHref = false;
    }
  }

  const isPlaceholder = (text, phrases) => {
    const normalised = text.toLowerCase().replace(/\s+/g, ' ').trim();
    return !normalised || phrases.some(phrase => normalised === phrase);
  };
  const hasOpenTag = tag => new RegExp(`<\\s*${tag}(?:\\s|>)`, 'i').test(source);
  const hasCloseTag = tag => new RegExp(`<\\/\\s*${tag}\\s*>`, 'i').test(source);

  if (challengeId === 1) {
    if (!heading || !hasOpenTag('h1') || !hasCloseTag('h1')) issues.push('Add an opening <h1> tag and a closing </h1> tag.');
    else if (isPlaceholder(headingText, ['your name', 'my name', 'name'])) issues.push('Replace the placeholder with your own name.');
  }

  if (challengeId === 2) {
    if (!heading || !hasOpenTag('h1') || !hasCloseTag('h1')) issues.push('Keep your name inside an opening <h1> tag and closing </h1> tag.');
    else if (isPlaceholder(headingText, ['your name', 'my name', 'name'])) issues.push('Replace the heading placeholder with your own name.');
    if (!paragraph || !hasOpenTag('p') || !hasCloseTag('p')) issues.push('Add a paragraph using an opening <p> tag and closing </p> tag.');
    else if (paragraphText.length < 12 || isPlaceholder(paragraphText, ['write one or two sentences about yourself.', 'your introduction'])) issues.push('Write one or two sentences about yourself inside the paragraph.');
  }

  if (challengeId === 3 || challengeId === 4) {
    if (!heading || !hasOpenTag('h1') || !hasCloseTag('h1')) issues.push('Add your name inside an opening <h1> tag and closing </h1> tag.');
    else if (isPlaceholder(headingText, ['your name', 'my name', 'name'])) issues.push('Replace the heading placeholder with your own name.');
    if (!paragraph || !hasOpenTag('p') || !hasCloseTag('p')) issues.push('Add an introduction using opening <p> and closing </p> tags.');
    else if (paragraphText.length < 12 || isPlaceholder(paragraphText, ['write a short introduction about yourself.', 'write one or two sentences about yourself.', 'your introduction'])) issues.push('Write a short, meaningful introduction inside the paragraph.');
    if (!anchor || !hasOpenTag('a') || !hasCloseTag('a')) issues.push('Add a hyperlink with an opening <a> tag and closing </a> tag.');
    else {
      if (!linkText) issues.push('Add visible clickable text between <a> and </a>.');
      if (!validHref) issues.push('Add a valid website address in href, beginning with https:// or http://.');
    }
  }

  return { passed: issues.length === 0, issues };
}

function htmlLabPreviewDocument(code) {
  const source = String(code || '');
  if (/<!doctype\s+html|<html[\s>]/i.test(source)) return source;
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>HTML Coding Lab Preview</title>
<style>
body{font-family:Arial,sans-serif;color:#1c2930;padding:18px;line-height:1.55;overflow-wrap:anywhere}
a{color:#135da8}h1{color:#174d71}
</style>
</head>
<body>${source}</body>
</html>`;
}

function renderHTMLLabProgress() {
  const { record } = getHTMLLabRecord();
  const completed = record.completedChallenges.length;
  const label = document.getElementById('html-lab-progress-label');
  const bar = document.getElementById('html-lab-progress-bar');
  if (label) label.textContent = `${completed}/4 challenges complete`;
  if (bar) bar.style.width = `${(completed / 4) * 100}%`;

  const quickCheck = document.getElementById('html-lab-quick-check');
  if (quickCheck) quickCheck.hidden = !record.completedChallenges.includes(4);
  const finish = document.getElementById('html-lab-finish');
  if (finish) finish.hidden = !htmlCodingLabIsComplete();
}

function renderHTMLLabCurrentChallenge() {
  const host = document.getElementById('html-lab-current-challenge');
  if (!host) return;
  const { record } = getHTMLLabRecord();
  let activeChallenge = Math.min(4, Math.max(1, record.activeChallenge || 1));
  if (!htmlLabChallengeUnlocked(activeChallenge)) activeChallenge = 1;
  record.activeChallenge = activeChallenge;
  saveHTMLLabRecord(record);

  host.innerHTML = htmlLabChallengePanelMarkup(activeChallenge);
  const challenge = getHTMLLabChallenge(activeChallenge);
  const editor = document.getElementById('html-lab-editor');
  const preview = document.getElementById('html-lab-preview');
  const feedbackId = 'html-lab-feedback';

  function runCode() {
    const code = editor.value;
    const current = getHTMLLabRecord().record;
    current.drafts[activeChallenge] = code;
    saveHTMLLabRecord(current);
    preview.srcdoc = htmlLabPreviewDocument(code);

    const result = validateHTMLLabCode(activeChallenge, code);
    if (!result.passed) {
      setMessage(feedbackId, `Not quite yet. ${result.issues.join(' ')}`, 'error');
      return;
    }

    if (!current.completedChallenges.includes(activeChallenge)) {
      current.completedChallenges.push(activeChallenge);
      current.completedChallenges.sort((a, b) => a - b);
    }
    saveHTMLLabRecord(current);
    setMessage(feedbackId, `Excellent! Challenge ${activeChallenge} passed. Your code meets the success checks.`, 'success');
    renderHTMLLabProgress();
    renderHTMLLabChallengeNavigation();

    const nextContainer = document.getElementById('html-lab-next-challenge');
    if (nextContainer && activeChallenge < 4) {
      nextContainer.innerHTML = `<button type="button" class="btn btn-primary" id="html-lab-go-next">Continue to Challenge ${activeChallenge + 1} →</button>`;
      document.getElementById('html-lab-go-next').addEventListener('click', () => {
        const updated = getHTMLLabRecord().record;
        updated.activeChallenge = activeChallenge + 1;
        saveHTMLLabRecord(updated);
        renderHTMLLabCurrentChallenge();
        renderHTMLLabChallengeNavigation();
      });
    } else if (nextContainer && activeChallenge === 4) {
      nextContainer.innerHTML = '<p class="html-lab-unlock-note">All four challenges are complete. The Quick Check is now unlocked below.</p>';
    }
  }

  document.getElementById('html-lab-run').addEventListener('click', runCode);
  editor.addEventListener('keydown', event => {
    if (event.key === 'Tab') {
      event.preventDefault();
      const start = editor.selectionStart;
      const end = editor.selectionEnd;
      editor.setRangeText('  ', start, end, 'end');
    }
    if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') {
      event.preventDefault();
      runCode();
    }
  });
  document.getElementById('html-lab-reset').addEventListener('click', () => {
    editor.value = challenge.starter;
    const current = getHTMLLabRecord().record;
    current.drafts[activeChallenge] = challenge.starter;
    saveHTMLLabRecord(current);
    preview.srcdoc = htmlLabPreviewDocument(challenge.starter);
    setMessage(feedbackId, 'Code reset to the starter example. Edit it and click Run Code.', '');
    document.getElementById('html-lab-next-challenge').innerHTML = '';
  });

  // Show a preview immediately, but do not mark the challenge complete until Run Code passes the checks.
  preview.srcdoc = htmlLabPreviewDocument(editor.value);
}

function renderHTMLLabChallengeNavigation() {
  const nav = document.getElementById('html-lab-challenge-nav');
  if (!nav) return;
  const { record } = getHTMLLabRecord();
  nav.querySelectorAll('[data-lab-challenge]').forEach(button => {
    const id = Number(button.dataset.labChallenge);
    const completed = record.completedChallenges.includes(id);
    const unlocked = htmlLabChallengeUnlocked(id);
    button.disabled = !unlocked;
    button.classList.toggle('active', id === record.activeChallenge);
    button.classList.toggle('completed', completed);
    button.classList.toggle('locked', !unlocked);
    const label = button.querySelector('span');
    if (label) label.textContent = completed ? '✓' : String(id);
  });
}

function initHTMLCodingLab() {
  const host = document.getElementById('html-lab-current-challenge');
  if (!host) return;

  renderHTMLLabChallengeNavigation();
  renderHTMLLabProgress();
  renderHTMLLabCurrentChallenge();

  document.getElementById('html-lab-challenge-nav').addEventListener('click', event => {
    const button = event.target.closest('[data-lab-challenge]');
    if (!button) return;
    const challengeId = Number(button.dataset.labChallenge);
    if (!htmlLabChallengeUnlocked(challengeId)) {
      alert('Complete the previous challenge first.');
      return;
    }
    const { record } = getHTMLLabRecord();
    record.activeChallenge = challengeId;
    saveHTMLLabRecord(record);
    renderHTMLLabCurrentChallenge();
    renderHTMLLabChallengeNavigation();
  });

  const quickButton = document.getElementById('html-lab-check-quick');
  quickButton?.addEventListener('click', () => {
    const choice = document.querySelector('input[name="html-lab-quick-answer"]:checked');
    if (!choice) {
      setMessage('html-lab-quick-feedback', 'Choose an answer before checking.', 'error');
      return;
    }
    if (choice.value !== 'B') {
      setMessage('html-lab-quick-feedback', 'Not quite. Think about which attribute stores the destination address of a hyperlink. Try again.', 'error');
      return;
    }

    const { record } = getHTMLLabRecord();
    record.quickCheckPassed = true;
    saveHTMLLabRecord(record);
    setMessage('html-lab-quick-feedback', 'Correct! The href attribute tells the browser where the hyperlink should take the user.', 'success');
    quickButton.disabled = true;

    if (htmlCodingLabIsComplete()) {
      renderHTMLLabProgress();
      refreshModuleIndicators();
      const finish = document.getElementById('html-lab-finish');
      if (finish) finish.hidden = false;
      finish?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  });
}

/* ------------------ Learning content ------------------ */

const VIDEO_CHECKPOINTS = {
  2: [
    {
      id: 'server-video-definition', time: 93,
      question: 'What is the main purpose of a web server?',
      options: ['To store website files and deliver webpages when requested', 'To replace a web browser', 'To create computer keyboards'],
      answer: 0,
      explanation: 'A web server stores website files and sends requested webpages to a browser.'
    },
    {
      id: 'server-video-protocol', time: 224,
      question: 'How does HTTPS help protect information?',
      options: ['By automatically building websites', 'By encrypting data sent between a browser and server', 'By removing the need for a browser'],
      answer: 1,
      explanation: 'HTTPS encrypts information travelling between the browser and server.'
    }
  ],
  4: [
    {
      id: 'website-definition', time: 112,
      question: 'What is a website?',
      options: ['A group of related webpages connected under a common web address', 'A single computer keyboard', 'A type of internet cable'],
      answer: 0,
      explanation: 'A website is a collection of related webpages that can be accessed through a web address.'
    }
  ]
  ,5: [
    {
      id: 'html-structure-body', time: 68,
      question: 'Which HTML element contains the content displayed on a webpage?',
      options: ['<head>', '<body>', '<title>'],
      answer: 1,
      explanation: 'The <body> element contains visible webpage content, including headings and paragraphs.'
    }
  ]
  ,'5:firstsite': [{
    id: 'first-page-preview', time: 85,
    question: 'What should you do after saving an HTML file to see the webpage?',
    options: ['Open the HTML file in a web browser', 'Rename it as a picture', 'Delete the HTML tags'], answer: 0,
    explanation: 'A web browser reads the saved HTML file and displays the webpage.'
  }],
  '5:tags': [{
    id: 'html-tags-attributes', time: 75,
    question: 'What is the purpose of an HTML attribute?',
    options: ['To provide additional information about an element', 'To delete the webpage', 'To replace all HTML tags'], answer: 0,
    explanation: 'Attributes provide extra information about HTML elements, such as the source of an image.'
  }],
  '6:introduction': [{
    id: 'sdlc-stages', time: 95,
    question: 'Why is the System Development Life Cycle useful?',
    options: ['It organises development into manageable stages', 'It eliminates the need for testing', 'It only changes website colours'], answer: 0,
    explanation: 'SDLC helps teams plan, develop, test and improve systems in an organised way.'
  }],
  '6:wedo': [
    { id: 'sdlc-we-users', time: 205,
      question: 'Who might use a school website?',
      options: ['Students, parents, teachers and visitors', 'Only the website developer', 'Only computer technicians'], answer: 0,
      explanation: 'A school website can serve students, parents, teachers and visitors.' },
    { id: 'sdlc-we-test', time: 510,
      question: 'What should be checked during website testing?',
      options: ['Whether pages and links work correctly', 'Only the colour of the computer case', 'Whether the browser has been deleted'], answer: 0,
      explanation: 'Testing checks whether links, pages and other website features work as intended.' }
  ],
  '6:youdo': [{
    id: 'sdlc-you-requirements', time: 60,
    question: 'What should be identified before designing a school mobile application?',
    options: ['The users and their requirements', 'Only the application icon colour', 'The number of computers in the classroom'], answer: 0,
    explanation: 'Understanding users and their needs helps guide the application design.'
  }],
  '5:miniproject': [{
    id: 'mini-project-link', time: 178,
    question: 'Which HTML element creates a clickable link?',
    options: ['<a>', '<h1>', '<title>'], answer: 0,
    explanation: 'The <a> element creates a hyperlink; its href attribute specifies the destination.'
  }]
};

function videoLessonMarkup(moduleId, sectionId = 'video') {
  const serverVideo = moduleId === 2;
  const firstPage = moduleId === 5 && sectionId === 'firstsite';
  const miniProject = moduleId === 5 && sectionId === 'miniproject';
  const htmlVideo = moduleId === 5 && sectionId === 'document';
  const tagsVideo = moduleId === 5 && sectionId === 'tags';
  const sdlcVideo = moduleId === 6 && sectionId === 'introduction';
  const sdlcWeDo = moduleId === 6 && sectionId === 'wedo';
  const sdlcYouDo = moduleId === 6 && sectionId === 'youdo';
  const title = serverVideo ? 'Web Server — Interactive Video' : firstPage ? 'Create Your First HTML Page' : miniProject ? 'HTML Mini-Project' : htmlVideo ? 'Basic HTML Structure' : tagsVideo ? 'Tags, Elements & Attributes' : sdlcVideo ? 'Introduction to SDLC' : sdlcWeDo ? 'WE DO — Applying SDLC Together' : sdlcYouDo ? 'YOU DO — Apply SDLC Independently' : 'What is a website?';
  const description = serverVideo ? 'Learn how browsers request pages and how web servers respond.' : firstPage ? 'Create and save an HTML document, then open it in your browser.' : miniProject ? 'Build, test and improve a personal webpage using HTML.' : htmlVideo ? 'Discover the basic HTML document structure and how it appears in a browser.' : tagsVideo ? 'Recognise HTML tags, elements and attributes in practical examples.' : sdlcVideo ? 'Explore how a step-by-step process helps teams plan, build and improve IT systems.' : sdlcWeDo ? 'Work through the eight SDLC stages using a school website example.' : sdlcYouDo ? 'Apply SDLC to a school mobile application challenge.' : 'Explore websites, web addresses, design and the parts of a webpage.';
  const file = serverVideo ? 'Webserver' : firstPage ? 'Create Your first HTML Page' : miniProject ? 'HTML Mini project' : htmlVideo ? 'Module 5- Basic HTML structure' : tagsVideo ? 'Tag, Element & Attribute' : sdlcVideo ? 'Introduction to SDLC' : sdlcWeDo ? 'Module 6- SDLC- We Do' : sdlcYouDo ? 'SDLC -You Do' : 'Module 4 - Website-What is Website';
  const label = title;
  const checkpointKey = (moduleId === 5 && (firstPage || miniProject || tagsVideo)) || (moduleId === 6 && (sdlcVideo || sdlcWeDo || sdlcYouDo)) ? `${moduleId}:${sectionId}` : moduleId;
  return lessonHeader(moduleId, title, description) + `
    <div class="video-activity" id="video-activity" data-module="${moduleId}">
      <video id="lesson-video" controls playsinline preload="metadata"
             aria-label="${label}">
        <source src="assets/videos/${file}.mp4" type="video/mp4">
        Your browser does not support HTML video. Please use the download link below.
      </video>
      <div class="video-toolbar">
        <label for="video-speed">Playback speed</label>
        <select id="video-speed" aria-label="Video playback speed">
          <option value="0.5">0.5×</option>
          <option value="0.75">0.75×</option>
          <option value="1" selected>1× Normal</option>
          <option value="1.25">1.25×</option>
          <option value="1.5">1.5×</option>
          <option value="1.75">1.75×</option>
          <option value="2">2×</option>
        </select>
        <a class="btn btn-outline video-download" href="assets/videos/${file}.mp4" download="${file}.mp4">
          Download video ↓
        </a>
      </div>
      <p class="video-instructions">The video pauses at key moments for questions. Answer each correctly, then watch to the end to complete this section.</p>
      <p id="video-status" class="form-message" role="status">Checkpoint questions: 0 of ${(VIDEO_CHECKPOINTS[checkpointKey] || []).length} completed.</p>
      <div id="video-question-modal" class="video-question-modal" hidden></div>
    </div>
  </div>`;
}

const CONTENT = {
  1: {
    intro: () => lessonHeader(1, 'Introduction', 'Chapter 13: Internet and Web Technologies') + `
      <div class="chapter-intro-hero">
        <p class="eyebrow">Explore • Understand • Create</p>
        <h2>Discover how the digital world works</h2>
        <p class="chapter-lead">Have you ever opened a website, searched for information, watched a video online, or clicked a link to visit another page? Several technologies work together behind these everyday activities.</p>
      </div>

      <p>The Internet connects computers and other digital devices around the world. The World Wide Web allows us to explore linked webpages and online resources. Web browsers help us access those pages, web servers deliver requested information, and websites organise content for people to use.</p>

      <p>But how does a browser communicate with a web server? How are websites structured? How can we create our own webpages? And how do developers plan and build digital systems?</p>

      <p>In this chapter, you will explore Internet and web technologies, learn about web browsers and servers, examine website elements, practise HTML, and discover the System Development Life Cycle (SDLC).</p>

      <div class="lesson-banner"><strong>What to expect:</strong> Reading materials, infographics, videos, demonstrations, interactive activities, practical challenges, and assessments will help you connect concepts with real-world examples.</div>

      <div class="callout"><strong>Think about it:</strong> When you open an educational website, what makes it possible for the page to appear on your screen? Keep this question in mind as you work through the chapter.</div>

      <h2>Get ready to learn</h2>
      <p>Be curious, try each activity, and use the practice tasks to strengthen your understanding. By the end of the chapter, you will have a stronger foundation in Internet and web technologies and experience applying the ideas yourself.</p>
      <p><strong>Let's begin exploring the technologies behind the Web!</strong></p>
    </div>`,
    overview: () => lessonHeader(1, 'Chapter Overview', 'Chapter 13: Internet and Web Technologies') + `
      <p>This chapter introduces the essential concepts, tools, and processes involved in accessing, understanding, and creating content on the Web. You will move from foundational Internet concepts to website development with HTML and the process used to develop digital systems.</p>

      <h2>Learning objectives</h2>
      <p>By the end of this chapter, you should be able to:</p>
      <ul class="chapter-objectives">
        <li>Explain the Internet and World Wide Web and distinguish between them.</li>
        <li>Describe the role of a web server in delivering online resources.</li>
        <li>Explain how browsers access and display webpages.</li>
        <li>Describe HTTP and HTTPS and identify their differences.</li>
        <li>Identify common website elements and explain their purposes.</li>
        <li>Create a simple webpage using HTML tags, elements, and attributes.</li>
        <li>Apply HTML concepts through guided practice and a mini-project.</li>
        <li>Explain the purpose and stages of the System Development Life Cycle (SDLC).</li>
      </ul>

      <h2>Your learning path</h2>
      <div class="chapter-module-grid">
        <article class="chapter-module-card"><span>01</span><h3>World Wide Web (WWW)</h3><p>Compare the Internet and the Web, study an infographic, and complete a drag-and-drop assessment.</p></article>
        <article class="chapter-module-card"><span>02</span><h3>Web Server</h3><p>Explore how web servers respond to requests through an interactive video and a multiple-choice assessment.</p></article>
        <article class="chapter-module-card"><span>03</span><h3>Web Browser</h3><p>Read about browsers, HTTP, HTTPS, and the differences between HTTP and HTTPS.</p></article>
        <article class="chapter-module-card"><span>04</span><h3>Website</h3><p>Explore website examples, identify website elements, and practise finding and fixing common issues.</p></article>
        <article class="chapter-module-card"><span>05</span><h3>HTML</h3><p>Learn HTML structure, tags, elements, and attributes. Create a webpage, build it step by step, complete a mini-project, and attempt the assessment.</p></article>
        <article class="chapter-module-card"><span>06</span><h3>System Development Life Cycle (SDLC)</h3><p>Learn through the I DO, WE DO, YOU DO approach, apply the development process, and complete an assessment.</p></article>
      </div>

      <h2>After the six modules</h2>
      <ul>
        <li><strong>Course Summary:</strong> Review the main ideas and learning points across the chapter.</li>
        <li><strong>Overall Assessment:</strong> Demonstrate your understanding of the chapter as a whole.</li>
      </ul>

      <h2>How to approach this chapter</h2>
      <ol>
        <li><strong>Learn:</strong> Read the material and watch videos or demonstrations.</li>
        <li><strong>Practise:</strong> Try the interactive activities and HTML coding tasks.</li>
        <li><strong>Assess:</strong> Complete each required assessment and review feedback.</li>
        <li><strong>Reflect:</strong> Revisit challenging concepts and download resources for revision.</li>
        <li><strong>Progress:</strong> Complete the required work in each section before continuing to the next.</li>
      </ol>

      <div class="lesson-banner"><strong>Ready to begin?</strong> Start with Module 1: World Wide Web (WWW). Follow the sections in order and apply what you learn as you move through the chapter.</div>
    </div>`,
    www: () => lessonHeader(1, 'World Wide Web', 'Read the explanation and explore the infographic.') + `
      <p>The <strong>World Wide Web (WWW)</strong> is an Internet-based service that allows us to access and share information through linked webpages. We use web browsers such as Google Chrome, Mozilla Firefox, Microsoft Edge, Safari and Opera to explore the Web.</p>

      <p>The Web uses common communication rules called <strong>protocols</strong>, including HTTP and HTTPS, to help browsers and web servers exchange requests and information. Webpages and their resources are stored on computers called <strong>web servers</strong>.</p>

      <p>The World Wide Web is a collection of webpages linked together on the Internet. It allows us to read articles, e-books, news and tutorials, view images, watch videos, and follow links from one page to another.</p>

      <figure class="module-infographic">
        <img src="assets/infographics/internet-world-wide-web-infographic.png"
             alt="Infographic comparing the Internet and the World Wide Web, showing how the Internet connects devices and how browsers access webpages stored on web servers."
             loading="lazy">
        <figcaption>Internet and World Wide Web (WWW) — connecting the world, sharing knowledge.</figcaption>
      </figure>
      <div class="button-row infographic-actions">
        <a class="btn btn-primary" href="assets/infographics/internet-world-wide-web-infographic.png" download="internet-world-wide-web-infographic.png">Download infographic ↓</a>
      </div>

      <div class="callout"><strong>Remember:</strong> The World Wide Web is part of the Internet, but the Internet also supports services such as email, file transfers and video calls that do not depend on the Web.</div>
    </div>`,
    dragdrop: () => lessonHeader(1, 'Module 1 Grading Assessment — Drag and Drop', 'Sort all six descriptions into the correct category.') + '<p>This drag-and-drop activity is the graded assessment for Module 1. Place every description into the correct Internet or World Wide Web column. You must place all six correctly to pass and unlock Module 2.</p><div id="drag-assessment"></div></div>'
  },
  2: {
    video: () => videoLessonMarkup(2),
    assessment: () => lessonHeader(2, 'MCQ Assessment', 'Choose the best answer.') + '<div id="mcq-assessment"></div></div>'
  },
  3: {
    browser: () => lessonHeader(3, '1. Web Browser', 'Reading material') + `
      <h2>${iconSVG('browser')} What is a Web Browser?</h2>
      <p>A web browser is a software application that allows you to open, view, and explore websites on the Internet. It takes information from websites and displays it in a form that is easy for us to read and understand.</p>
      <p>A web browser allows you to access a wide range of information on the Internet, including text, images, videos, and other types of content from around the world.</p>
      <p>The Internet has become an important part of our everyday lives. Over the years, it has changed the way we work, learn, communicate, and entertain ourselves. It connects people across different countries, supports businesses, helps us build relationships, and provides opportunities to learn and share information.</p>
      <p>Since we use the Internet so often, it is important to understand the tools that help us access it. Web browsers such as Mozilla Firefox, Google Chrome, Microsoft Edge, and Apple Safari are commonly used every day.</p>

      <figure class="browser-reading-figure">
        <img src="assets/browser-material/browser-examples.png"
             alt="Examples of web browsers: Google Chrome, Mozilla Firefox, Microsoft Edge, Apple Safari, Opera and UC Browser"
             loading="lazy">
        <figcaption>Examples of web browsers shown in the supplied reading material.</figcaption>
      </figure>

      <div class="callout"><strong>Important:</strong> A browser is not the Internet itself. The Internet is the global network that connects computers and devices, while a web browser is software that allows you to access web content through that network.</div>

      <h2>${iconSVG('browser')} What does a web browser do?</h2>
      <p>A web browser performs several important tasks.</p>
      <h3>1. Accesses websites</h3>
      <p>You can enter a website address into the browser's address bar. For example:</p>
      <p><code>https://www.google.com</code></p>
      <p>The browser uses this address to request the website.</p>
      <h3>2. Displays webpages</h3>
      <p>The browser receives information from a web server and displays it as a webpage. The webpage may contain:</p>
      <ul class="browser-content-list"><li>Text</li><li>Images</li><li>Videos</li><li>Audio</li><li>Links</li><li>Buttons</li><li>Forms</li></ul>
      <h3>3. Follows hyperlinks</h3>
      <p>A webpage can contain hyperlinks. When you click a hyperlink, the browser requests the new webpage or resource.</p>
      <h3>4. Communicates with web servers</h3>
      <p>The browser communicates with web servers using protocols such as HTTP and HTTPS.</p>

      <h2>${iconSVG('network')} How does a browser access a webpage?</h2>
      <p>Suppose you want to visit a website. The basic process is:</p>
      <ol class="browser-process-list">
        <li><strong>Step 1:</strong> You enter a web address.</li>
        <li><strong>Step 2:</strong> The web browser sends a request.</li>
        <li><strong>Step 3:</strong> The request travels through the Internet to a web server.</li>
        <li><strong>Step 4:</strong> The web server processes the request.</li>
        <li><strong>Step 5:</strong> The web server sends the requested information back.</li>
        <li><strong>Step 6:</strong> The browser receives the information and displays the webpage.</li>
      </ol>
      <div class="callout"><strong>Remember:</strong> A web browser is software used to access and view websites and webpages.</div>

      <blockquote class="browser-quote">In just a short period of time, we have moved from being amazed by the ability to send an email to someone anywhere in the world to having instant access to an enormous amount of information.</blockquote>

      <h2>How web server work?</h2>
      <p>When you enter a website address into a web browser, the browser sends a request to the web server where the website is stored. The server receives the request, finds the required information, and sends it back to the browser. The browser then processes the information and displays the webpage on your computer, tablet, or mobile phone. This is how you can view text, images, videos, and other content from websites.</p>
      <p>The communication between a web browser and a web server takes place using HTTP or HTTPS. These protocols provide the rules for how information is requested, transferred, and received over the Internet. Whenever you open a website, HTTP or HTTPS helps the browser and server communicate with each other so that the requested webpage can be displayed correctly.</p>
      <figure class="browser-reading-figure">
        <img src="assets/browser-material/browser-server-request-response.png"
             alt="Diagram showing a web browser client sending a webpage request through the Internet to a web server and receiving data in response"
             loading="lazy">
        <figcaption>Browser and web server communication: request for a webpage and response with data.</figcaption>
      </figure>
      <div class="callout"><strong>Remember:</strong> The browser displays the information it receives from the website's web server.</div>
      ${browserReadingFooter('browser')}
    </div>`,

    http: () => lessonHeader(3, '2. HTTP', 'Hypertext Transfer Protocol') + `
      <p><strong>HTTP</strong> stands for <strong>Hypertext Transfer Protocol</strong>.</p>
      <p>Therefore, Hypertext Transfer Protocol is a set of rules used for communication between a web browser and a web server. It works through a request-and-response process, where the browser sends a request to a server for resources such as web pages, images, or videos, and the server sends the requested information back. HTTP is an application-layer protocol and is one of the main foundations of the World Wide Web, allowing information to be transferred between networked devices over the Internet.</p>

      <h2>${iconSVG('network')} How it works</h2>
      <figure class="browser-reading-figure">
        <img src="assets/browser-material/browser-server-request-response.png"
             alt="HTTP diagram showing a web browser sending a request for a webpage through the Internet to a web server, then receiving a response with data"
             loading="lazy">
        <figcaption>HTTP request-and-response diagram from the supplied reading material.</figcaption>
      </figure>
      <p>In HTTP, the web browser sends a request to the web server for a webpage or other information. The server receives the request, finds the required information, and sends it back to the browser. The browser then displays the received webpage to the user. In simple terms, it follows a <strong>request → server → response</strong> process.</p>

      <div class="browser-step-flow" aria-label="HTTP request and response steps">
        <div><strong>1. Browser</strong><span>Sends a request</span></div>
        <span class="browser-flow-arrow" aria-hidden="true">→</span>
        <div><strong>2. Web server</strong><span>Finds the requested information</span></div>
        <span class="browser-flow-arrow" aria-hidden="true">→</span>
        <div><strong>3. Browser</strong><span>Receives and displays the response</span></div>
      </div>
      ${browserReadingFooter('http')}
    </div>`,

    https: () => lessonHeader(3, '3. HTTPS', 'Hypertext Transfer Protocol Secure') + `
      <p><strong>HTTPS</strong> stands for <strong>Hypertext Transfer Protocol Secure</strong>.</p>
      <p>Therefore, Hypertext Transfer Protocol Secure is a secure protocol used to protect the communication between a web browser and a website. It helps keep information exchanged online safe, especially when users enter sensitive information such as passwords, usernames, bank details, or other personal information.</p>
      <p>HTTPS uses a security technology called <strong>TLS (Transport Layer Security)</strong> to protect the information. It also helps users know that they are connected to the correct and trusted website. In most modern web browsers, a padlock icon appears in the address bar when a website uses HTTPS. This shows that the connection is protected and provides a safer way to use websites and online services.</p>

      <h2>How it works?</h2>
      <figure class="browser-reading-figure">
        <img src="assets/browser-material/https-secure-request-response.png"
             alt="HTTPS diagram showing a browser and web server exchanging requests and encrypted responses through a protected Internet connection"
             loading="lazy">
        <figcaption>HTTPS uses a secure connection and encrypted response while information is transferred.</figcaption>
      </figure>
      <p>HTTPS works in a similar request-and-response process, but it provides security while the data is being transferred. The browser sends a request to the web server through a secure connection, and the server sends the requested information back in an encrypted form. This helps protect the information from being read or changed by unauthorized people while it is being transmitted.</p>
      <div class="browser-address-example">
        <span class="connection-lock">${iconSVG('shield')}</span>
        <code>https://www.example.com</code>
        <span class="connection-label">HTTPS connection</span>
      </div>
      ${browserReadingFooter('https')}
    </div>`,

    differences: () => lessonHeader(3, '4. Difference between HTTP and HTTPS', 'Compare the two communication protocols') + `
      <p>The table below compares HTTP and HTTPS using the aspects in your supplied reading material.</p>
      <div class="table-wrap browser-comparison-table">
        <table>
          <thead>
            <tr><th>Aspect</th><th>HTTP</th><th>HTTPS</th></tr>
          </thead>
          <tbody>
            <tr><th>Full form</th><td>HyperText Transfer Protocol</td><td>HyperText Transfer Protocol Secure</td></tr>
            <tr><th>Meaning</th><td>A set of rules used for communication between a web browser and a web server.</td><td>A secure version of HTTP used for communication between a web browser and a web server.</td></tr>
            <tr><th>Security</th><td>Not secure because data is sent as plain text and can be intercepted.</td><td>Secure because data is encrypted during transfer.</td></tr>
            <tr><th>Data encryption</th><td>Does not encrypt the data.</td><td>Encrypts the data to protect it from unauthorized access.</td></tr>
            <tr><th>Port used</th><td>Port 80</td><td>Port 443</td></tr>
            <tr><th>Website address</th><td>Starts with <code>http://</code></td><td>Starts with <code>https://</code></td></tr>
            <tr><th>How it works</th><td>The browser sends a request to the server, and the server sends a response. The data is exchanged as plain text.</td><td>The browser and server establish a secure, encrypted connection before exchanging data.</td></tr>
            <tr><th>Use case</th><td>Used for normal websites where sensitive information is not required.</td><td>Used for banking, online shopping, email, login, and other secure websites.</td></tr>
            <tr><th>Security level</th><td>Lower security</td><td>Higher security</td></tr>
            <tr><th>Speed</th><td>Generally faster because encryption is not required.</td><td>May be slightly slower because encryption and decryption are required.</td></tr>
            <tr><th>Browser indication</th><td>Shows <code>http://</code> in the website address.</td><td>Shows <code>https://</code> and a secure connection indicator in the browser.</td></tr>
            <tr><th>Protection of data</th><td>Data can be read if intercepted during transmission.</td><td>Encryption helps protect data from being read by unauthorized people.</td></tr>
            <tr><th>Example</th><td>A simple website that does not require users to enter sensitive information.</td><td>Banking, shopping, email, login, and other websites where personal or sensitive information is entered.</td></tr>
          </tbody>
        </table>
      </div>
      <figure class="browser-reading-figure browser-comparison-figure">
        <img src="assets/browser-material/http-https-comparison-chart.png"
             alt="Original comparison chart showing differences between HTTP and HTTPS across thirteen aspects"
             loading="lazy">
        <figcaption>Comparison chart from the supplied reading material.</figcaption>
        <a class="btn btn-outline" href="assets/browser-material/http-https-comparison-chart.png" download="http-https-comparison.png">Download comparison chart ${iconSVG('download')}</a>
      </figure>
      ${browserReadingFooter('differences')}
    </div>`,

    assessment: () => lessonHeader(3, 'Module 3 Grading Assessment', 'Answer all eight questions. A score of 70% or higher is required to pass.') + '<div id="mcq-assessment"></div></div>'
  },
  4: {
    video: () => videoLessonMarkup(4),
    explore: () => lessonHeader(4, '1. Explore and Fix Website') + `<p>Look for broken links, unclear headings, missing alternative text, poor contrast or confusing navigation.</p><div class="code-demo"><pre class="code-editor">&lt;img src="school.png"&gt;\n&lt;a href="#"&gt;Click here&lt;/a&gt;\n&lt;h4&gt;Welcome&lt;/h4&gt;</pre><div class="code-preview"><h2>Fix the website</h2><ul><li>Add meaningful alternative text.</li><li>Use a descriptive link name.</li><li>Use an appropriate heading level.</li></ul></div></div></div>`,
    elements: () => lessonHeader(4, '2. Elements of Website') + `<ul><li>Header and navigation</li><li>Main content</li><li>Images and media</li><li>Links and buttons</li><li>Forms</li><li>Footer</li></ul><div class="callout"><strong>Challenge:</strong> Identify at least five elements on a website you use.</div></div>`,
    assessment: () => lessonHeader(4, 'Module 4 Grading Assessment', 'Answer all five questions. A score of 70% or higher is required to pass.') + '<div id="mcq-assessment"></div></div>'
  },
  5: {
    html: () => lessonHeader(5, '1. What is HTML?', 'Grade 9 • Chapter 13 • Learn the building blocks of a webpage') + `
      <div class="html-intro-hero"><span class="html-kicker">START HERE · HTML BASICS</span><h2>Every webpage starts with a structure</h2><p>Imagine opening your school website. You see its name, photographs, announcements and links. How does the browser know what each part means?</p><p><strong>HTML provides the structure.</strong> Just as a school building has classrooms, corridors and doors, a webpage has headings, paragraphs, pictures and links.</p></div>
      <div class="html-concept-graphic" role="img" aria-label="Illustration showing a webpage structure: header, heading, paragraph, image and link"><div class="html-graphic-browser"><div class="html-graphic-top"><span>● ● ●</span> school.example</div><div class="html-graphic-head">MY SCHOOL</div><div class="html-graphic-nav">Home &nbsp; | &nbsp; Announcements &nbsp; | &nbsp; Calendar</div><div class="html-graphic-content"><div><strong>School Announcements</strong><p>Welcome to our school webpage.</p><span class="html-graphic-link">View school calendar →</span></div><div class="html-graphic-picture">▧<small>School photo</small></div></div></div><div class="html-graphic-note">HTML identifies each part so the browser can display it meaningfully.</div></div>
      <h2>What is HTML?</h2><p><strong>HTML stands for HyperText Markup Language.</strong> It is the standard markup language used to define the structure and content of webpages. It organises headings, paragraphs, images, links and other content.</p>
      <div class="html-term-grid"><div><h3>HyperText</h3><p>Text that can connect to other webpages or resources through clickable links.</p></div><div><h3>Markup</h3><p>Tags that identify and organise content.</p></div><div><h3>Language</h3><p>A set of agreed rules understood by web browsers.</p></div></div>
      <div class="lesson-banner"><strong>Remember:</strong> HTML is a <strong>markup language</strong>, not a programming language. HTML structures content; CSS controls appearance such as colours and spacing; JavaScript can add interactive behaviour.</div>
      <h2>Why do we use HTML?</h2><ul><li>Create the basic structure of a webpage.</li><li>Display headings and paragraphs.</li><li>Include images, audio and video.</li><li>Create hyperlinks to other pages.</li><li>Organise information for browsers.</li></ul><p>For example, a school announcement page can have a heading, announcement text, a photograph and a link to the school calendar.</p>
      <h2>How does HTML work?</h2><p>We write HTML as text containing tags and content. A browser reads the file, interprets the tags and displays the webpage. The tags themselves are not normally visible.</p>
      <div class="html-example-grid"><div><h3>HTML code</h3><pre class="html-sample-code">&lt;h1&gt;Welcome to My School&lt;/h1&gt;
&lt;p&gt;My school is located in Bhutan.&lt;/p&gt;</pre></div><div class="html-example-result"><h3>Browser result</h3><strong class="html-preview-heading">Welcome to My School</strong><p>My school is located in Bhutan.</p></div></div>
      <h2>What are HTML tags?</h2><p>HTML tags are words or letters enclosed in angle brackets. Many elements have an opening tag, content and a closing tag.</p><div class="html-tag-anatomy"><span>&lt;p&gt;<small>Opening tag</small></span><span>Welcome to Bhutan<small>Content</small></span><span>&lt;/p&gt;<small>Closing tag</small></span></div><p>The closing tag includes a forward slash (/). Some elements, such as <code>&lt;br&gt;</code>, do not need a closing tag.</p>
      <h3>Common HTML tags</h3><div class="html-table-wrap"><table class="html-tag-table"><thead><tr><th>Tag</th><th>Purpose</th></tr></thead><tbody><tr><td><code>&lt;html&gt;</code></td><td>Defines the HTML document.</td></tr><tr><td><code>&lt;head&gt;</code></td><td>Contains information about the webpage.</td></tr><tr><td><code>&lt;title&gt;</code></td><td>Defines the browser-tab title.</td></tr><tr><td><code>&lt;body&gt;</code></td><td>Contains visible webpage content.</td></tr><tr><td><code>&lt;h1&gt;</code></td><td>Defines a main heading.</td></tr><tr><td><code>&lt;p&gt;</code></td><td>Defines a paragraph.</td></tr><tr><td><code>&lt;br&gt;</code></td><td>Inserts a line break.</td></tr></tbody></table></div>
      <h2>Tools required</h2><p>Use a <strong>text editor</strong> such as Notepad or Visual Studio Code to write HTML, and a <strong>web browser</strong> such as Chrome, Firefox or Edge to view the result. Save your file with a <code>.html</code> extension, for example <code>index.html</code>.</p><div class="callout"><strong>Try it:</strong> Open Notepad, type a short HTML document, save it as <code>mypage.html</code> (choose All Files if needed), then open the saved file in your browser. Save and refresh after making changes.</div>
      <div class="html-reflection"><strong>Think about it</strong><p>If a webpage had no headings or paragraphs, would it be easy to read? How does HTML make information clearer?</p></div>
    </div>`,
    document: () => videoLessonMarkup(5) + `<div class="html-video-recap"><h2>Basic HTML structure at a glance</h2><p>The video demonstrates an HTML document in VS Code and shows the resulting webpage in a browser.</p><pre class="html-sample-code">&lt;!DOCTYPE html&gt;
&lt;html&gt;
  &lt;head&gt;
    &lt;title&gt;My Page&lt;/title&gt;
  &lt;/head&gt;
  &lt;body&gt;
    &lt;h1&gt;Welcome to My Webpage&lt;/h1&gt;
    &lt;p&gt;I am learning HTML.&lt;/p&gt;
  &lt;/body&gt;
&lt;/html&gt;</pre><p><strong>Key idea:</strong> The <code>&lt;head&gt;</code> contains information about the page; the <code>&lt;body&gt;</code> contains what visitors see.</p></div>`,
    tags: () => videoLessonMarkup(5, 'tags').replace('</div>', '</div>') + `<div class="callout"><strong>Key ideas:</strong> A tag marks content (for example, <code>&lt;p&gt;</code>); an element includes its tags and content; an attribute adds information such as <code>src</code> for an image source or <code>alt</code> for alternative text.</div>`,
    firstsite: () => videoLessonMarkup(5, 'firstsite') + `<div class="html-video-recap"><h2>Practise: Create your first HTML page</h2><p>The demonstration creates an <code>index.html</code> file in VS Code, adds a heading and paragraphs, and opens the saved file in a browser.</p><div class="lesson-banner"><strong>Try it yourself:</strong> Save your HTML file with the <code>.html</code> extension. Open it in a browser. Change the heading, save the file and refresh the page.</div><h3>Try editing HTML and previewing it here</h3><div class="code-demo"><textarea id="html-editor" class="code-editor" spellcheck="false">&lt;h1&gt;Hello, Class IX!&lt;/h1&gt;\n&lt;p&gt;Welcome to my first HTML webpage.&lt;/p&gt;</textarea><div id="html-preview" class="code-preview"></div></div><button id="preview-html" class="btn btn-primary" type="button">Update Preview</button></div>`,
    stepbystep: () => htmlCodingLabMarkup(),
    miniproject: () => videoLessonMarkup(5, 'miniproject') + `<div class="html-video-recap"><h2>Your mini-project: A personal webpage</h2><p>Use the HTML skills you have practised to build a simple webpage about yourself. Follow the video as you create, test and improve it.</p><div class="html-term-grid"><div><h3>1. Create</h3><p>Make a new HTML file and add the document structure.</p></div><div><h3>2. Build</h3><p>Add a page title, main heading, a short introduction, your interests and a hyperlink.</p></div><div><h3>3. Test</h3><p>Open the page in a browser. Check that the content appears and the link works.</p></div></div><div class="lesson-banner"><strong>Project checklist:</strong><ul><li>My webpage has a browser-tab title.</li><li>My page includes a heading and an introduction.</li><li>I have described my interests.</li><li>I have added a working hyperlink.</li><li>I tested and improved the webpage.</li></ul></div><p><strong>Deliverable:</strong> Save your HTML file and open it in a web browser.</p></div>`,
    extension: () => lessonHeader(5, 'Extension Challenge — Go Beyond the Basic Webpage', 'Optional • For early finishers') + `<div class="html-intro-hero"><span class="html-kicker">OPTIONAL EXTENSION</span><h2>Ready for the next challenge?</h2><p>If you have completed the mini-project, improve your webpage by adding an image, a list of hobbies and a second page. Learn by experimenting with new HTML elements!</p></div>
      <div class="html-term-grid"><div><h3>A · Add an image</h3><p>Display a photo and describe it for visitors.</p></div><div><h3>B · Add a list</h3><p>Show your favourite hobbies as bullet points.</p></div><div><h3>C · Add a second page</h3><p>Connect your homepage to an About Me page.</p></div></div>
      <h2>Extension A: Add an image</h2><pre class="html-sample-code">&lt;img src="myphoto.jpg"
     alt="A description of my photo"
     width="300"&gt;</pre><p><code>src</code> identifies the image file, <code>alt</code> describes the image, and <code>width</code> controls the displayed width.</p><div class="lesson-banner"><strong>Important:</strong> Put the image in the correct folder relative to your HTML file, or use a valid image URL.</div>
      <h2>Extension B: Add a list</h2><pre class="html-sample-code">&lt;h2&gt;My Hobbies&lt;/h2&gt;
&lt;ul&gt;
  &lt;li&gt;Reading&lt;/li&gt;
  &lt;li&gt;Drawing&lt;/li&gt;
  &lt;li&gt;Learning technology&lt;/li&gt;
&lt;/ul&gt;</pre><p><code>&lt;ul&gt;</code> creates an unordered list; each <code>&lt;li&gt;</code> is one list item. Replace the examples with your own hobbies.</p>
      <h2>Extension C: Add a second page</h2><p>Create a new file called <code>about.html</code> in the same folder as <code>index.html</code>.</p><pre class="html-sample-code">&lt;!DOCTYPE html&gt;
&lt;html lang="en"&gt;
&lt;head&gt;
  &lt;meta charset="UTF-8"&gt;
  &lt;title&gt;About Me&lt;/title&gt;
&lt;/head&gt;
&lt;body&gt;
  &lt;h1&gt;About Me&lt;/h1&gt;
  &lt;p&gt;This page contains information about me.&lt;/p&gt;
  &lt;a href="index.html"&gt;Back to Home&lt;/a&gt;
&lt;/body&gt;
&lt;/html&gt;</pre><p>Then add this link to your <code>index.html</code> file:</p><pre class="html-sample-code">&lt;a href="about.html"&gt;About Me&lt;/a&gt;</pre><p>Now your two pages are connected. You have started building a multi-page website!</p>
      <div class="html-reflection"><strong>Extension self-check</strong><p>Can you see your image? Does your hobbies list display as bullet points? Can you navigate from <code>index.html</code> to <code>about.html</code> and back?</p></div><p><em>This extension is optional and is not included in the graded assessment.</em></p></div>`,
    assessment: () => lessonHeader(5, '9. Assessment') + '<div id="mcq-assessment"></div></div>'
  },
  6: {
    introduction: () => videoLessonMarkup(6, 'introduction') + `<div class="callout"><strong>Key idea:</strong> SDLC is a step-by-step process for planning, building and improving IT systems. It makes complex tasks more manageable and helps teams work systematically.</div><div class="lesson-banner"><strong>Think about it:</strong> How could a school use SDLC when developing its website?</div>`,
    ido: () => lessonHeader(6, 'I DO') + `<p>The teacher models the SDLC process and explains how planning, analysis, design, development, testing, implementation and maintenance connect.</p><div class="lesson-banner"><strong>I DO:</strong> Watch an example and identify the stages.</div></div>`,
    wedo: () => videoLessonMarkup(6, 'wedo') + `<div class="callout"><strong>Work together:</strong> Imagine your school is developing a website. Identify its users and their needs, plan the pages and navigation, and decide how to test links and features.</div><div class="lesson-banner"><strong>Discuss:</strong> Which SDLC stage would help you decide who will use the website? What would you check before publishing it?</div>`,
    youdo: () => videoLessonMarkup(6, 'youdo') + `<div class="callout"><strong>Your independent challenge:</strong> Your school wants a mobile application for students. Write a short plan explaining the users, their needs, a possible design, how the app would be built and tested, and how feedback would help improve it.</div><div class="lesson-banner"><strong>Try it yourself:</strong> Organise your ideas under the eight SDLC stages. You can use a notebook or a separate document.</div>`,
    assessment: () => lessonHeader(6, 'SDLC Assessment') + '<div id="mcq-assessment"></div></div>'
  }
};

const MCQ_QUESTIONS = {
  2: [
    { question: 'What is a web server?', options: ['A computer or software that stores website files and delivers webpages', 'Only a web browser', 'A keyboard connected to the Internet', 'A tool for drawing pictures'], answer: 0 },
    { question: 'Which of the following are examples of web server software?', options: ['Apache, Nginx and IIS', 'Chrome, Firefox and Safari', 'Word, Excel and PowerPoint', 'HTML, CSS and JavaScript'], answer: 0 },
    { question: 'What additional protection does HTTPS provide compared with HTTP?', options: ['Encryption of data while it travels between browser and server', 'It removes the need for a server', 'It automatically designs a website', 'It prevents users from visiting websites'], answer: 0 },
    { question: 'What happens after a web browser sends a request to a web server?', options: ['The server finds the requested file and sends a response so the page can load', 'The browser deletes the website', 'The webpage loads before the server responds', 'The keyboard sends the webpage directly'], answer: 0 }
  ],
  3: [
    { question: 'What is a web browser?', options: ['Software used to access, retrieve and view web content', 'The global network itself', 'A physical web server rack', 'A type of internet cable'], answer: 0 },
    { question: 'Which of these is a web browser?', options: ['Mozilla Firefox', 'Microsoft Word', 'A computer keyboard', 'A spreadsheet cell'], answer: 0 },
    { question: 'What does a browser do after receiving webpage resources?', options: ['Interprets and displays the webpage', 'Turns the resources into electricity', 'Prints every webpage automatically', 'Deletes the web server'], answer: 0 },
    { question: 'What does HTTP stand for?', options: ['Hypertext Transfer Protocol', 'High Technology Text Program', 'Hyperlink Type Transfer Page', 'Home Tool Tracking Process'], answer: 0 },
    { question: 'How does HTTP communication generally work?', options: ['A client sends a request and a server sends a response', 'A server always sends data before any request', 'A browser sends a paper letter', 'A monitor requests a keyboard'], answer: 0 },
    { question: 'What does the S in HTTPS indicate?', options: ['Secure', 'Search', 'Storage', 'System'], answer: 0 },
    { question: 'What technology is used by HTTPS to protect data in transit?', options: ['TLS encryption', 'Screen rotation', 'A browser theme', 'A larger monitor'], answer: 0 },
    { question: 'Does HTTPS guarantee that a website is honest or safe in every way?', options: ['No; it secures the connection but does not prove the site is trustworthy', 'Yes, every HTTPS site is trustworthy', 'Yes, it verifies all website content', 'No, HTTPS is a type of browser'], answer: 0 }
  ],
  4: [
    { question: 'What is a website?', options: ['A collection of related webpages', 'A computer keyboard', 'A web browser setting', 'An image format'], answer: 0 },
    { question: 'What is a URL used for?', options: ['Identifying the address of a resource on the internet', 'Adjusting the computer volume', 'Changing the screen brightness', 'Printing a webpage automatically'], answer: 0 },
    { question: 'Which feature makes a website easier for visitors to use?', options: ['Clear navigation and readable content', 'Confusing menus', 'Very small text', 'Unrelated information'], answer: 0 },
    { question: 'Which part of a website usually contains the site name or logo?', options: ['Header', 'Footer', 'Sidebar', 'Main content'], answer: 0 },
    { question: 'What is the purpose of a navigation menu?', options: ['To help visitors move between pages', 'To change the internet connection', 'To turn off the browser', 'To store the computer battery'], answer: 0 }
  ],
  5: [
    { question: 'What does HTML stand for?', options: ['HyperText Markup Language', 'High Transfer Machine Link', 'Home Tool Markup List', 'Hyperlink Text Management Logic'], answer: 0 },
    { question: 'What is the main purpose of HTML?', options: ['To structure webpage content', 'To change internet speed', 'To protect a computer from viruses', 'To replace a web browser'], answer: 0 },
    { question: 'Which HTML element contains the content displayed in a webpage?', options: ['<body>', '<head>', '<title>', '<meta>'], answer: 0 },
    { question: 'What is the purpose of the <title> element?', options: ['To set the browser-tab title', 'To insert a photograph', 'To make a hyperlink', 'To create a paragraph'], answer: 0 },
    { question: 'Which tag creates the main heading of a webpage?', options: ['<h1>', '<p>', '<a>', '<br>'], answer: 0 },
    { question: 'How can you view an HTML file as a webpage?', options: ['Save it with the .html extension and open it in a browser', 'Save it as an image', 'Delete all tags', 'Only print the code'], answer: 0 },
    { question: 'Which HTML attribute gives an image alternative text?', options: ['alt', 'src', 'href', 'width'], answer: 0 },
    { question: 'Which example shows a complete HTML paragraph element?', options: ['<p>Hello</p>', '<p>', 'alt="Hello"', '</p> only'], answer: 0 },
    { question: 'Which HTML element creates a clickable hyperlink?', options: ['<a>', '<p>', '<h1>', '<body>'], answer: 0 },
    { question: 'What should you do after making changes to a saved HTML file?', options: ['Save it and refresh the browser', 'Delete the HTML file', 'Disconnect the computer', 'Change its extension to .jpg'], answer: 0 }
  ],
  6: [
    { question: 'What does SDLC stand for?', options: ['System Development Life Cycle', 'Software Design Link Code', 'System Data Learning Centre', 'Secure Digital Login Control'], answer: 0 },
    { question: 'Which is a benefit of following SDLC?', options: ['Breaking complex work into manageable stages', 'Avoiding all planning', 'Never checking for errors', 'Removing the need to understand users'], answer: 0 },
    { question: 'Why is the SDLC used?', options: ['To organise the stages of developing and maintaining a system', 'To choose a web browser colour', 'To create email addresses only', 'To increase internet speed'], answer: 0 },
    { question: 'Which activity is most closely related to the analysis stage?', options: ['Understanding the problem and gathering requirements', 'Decorating the finished product only', 'Deleting all user feedback', 'Publishing before planning'], answer: 0 },
    { question: 'What happens during the design stage?', options: ['The solution structure and plan are prepared', 'The system is maintained for years without review', 'The problem is ignored', 'The final product is automatically tested'], answer: 0 },
    { question: 'What is the development stage?', options: ['Building or coding the planned system', 'Collecting user names only', 'Writing the project conclusion before starting', 'Removing the design'], answer: 0 },
    { question: 'Why is testing important?', options: ['To find problems and check that the system meets requirements', 'To make the system harder to use', 'To avoid checking the system', 'To replace all planning'], answer: 0 },
    { question: 'What does implementation usually involve?', options: ['Putting the completed system into use', 'Only discussing possible colours', 'Removing the system from use', 'Skipping user preparation'], answer: 0 },
    { question: 'What is maintenance?', options: ['Fixing, updating and improving a system after it is in use', 'Writing the first idea only', 'Choosing a project name', 'Turning off the network permanently'], answer: 0 },
    { question: 'Which group should be considered when planning a school website?', options: ['Students, parents, teachers and visitors', 'Only the web developer', 'Only the school principal', 'Only the computer manufacturer'], answer: 0 },
    { question: 'How can a school improve a mobile application after it is launched?', options: ['Review user feedback and refine the application', 'Ignore reported problems', 'Remove all documentation', 'Stop testing permanently'], answer: 0 }
  ]
};

/* ------------------ Activity widgets ------------------ */

function initVideo(moduleId, sectionId) {
  const container = document.getElementById('video-activity');
  const video = document.getElementById('lesson-video');
  if (!container || !video) return;

  const key = (moduleId === 5 && ['firstsite', 'miniproject', 'tags'].includes(sectionId)) || (moduleId === 6 && ['introduction', 'wedo', 'youdo'].includes(sectionId)) ? `${moduleId}:${sectionId}` : moduleId;
  const questions = VIDEO_CHECKPOINTS[key] || [];
  const modal = document.getElementById('video-question-modal');
  const speedSelect = document.getElementById('video-speed');
  const status = document.getElementById('video-status');
  const answered = new Set();
  let activeQuestion = null;
  let finished = false;

  function updateStatus(message = '') {
    if (!status) return;
    status.textContent = message || `Checkpoint questions: ${answered.size} of ${questions.length} completed.`;
    status.classList.toggle('success', answered.size === questions.length);
  }

  function firstUnansweredQuestion() {
    return questions.find(question => !answered.has(question.id)) || null;
  }

  function displayQuestion(question) {
    if (!question || activeQuestion || !modal) return;
    activeQuestion = question;
    video.pause();
    modal.innerHTML = `
      <section class="video-question-dialog" role="dialog" aria-modal="true" aria-labelledby="video-question-title">
        <p class="eyebrow">Video checkpoint ${answered.size + 1} of ${questions.length}</p>
        <h2 id="video-question-title">Quick question</h2>
        <p>${escapeHTML(question.question)}</p>
        <form id="video-question-form">
          <div class="video-question-options">
            ${question.options.map((option, index) => `
              <label class="video-question-option">
                <input type="radio" name="video-answer" value="${index}">
                <span>${escapeHTML(option)}</span>
              </label>
            `).join('')}
          </div>
          <p id="video-question-feedback" class="form-message" role="status"></p>
          <button class="btn btn-primary" id="video-question-submit" type="submit">Check answer</button>
        </form>
      </section>
    `;
    modal.hidden = false;

    const form = document.getElementById('video-question-form');
    form.addEventListener('submit', event => {
      event.preventDefault();
      const choice = form.querySelector('input[name="video-answer"]:checked');
      if (!choice) {
        setMessage('video-question-feedback', 'Select an answer first.', 'error');
        return;
      }
      if (Number(choice.value) !== question.answer) {
        setMessage('video-question-feedback', 'Not quite. Try again after reviewing the video.', 'error');
        return;
      }

      answered.add(question.id);
      updateStatus();
      form.innerHTML = `
        <div class="video-answer-correct">
          <strong>✓ Correct!</strong>
          <p>${escapeHTML(question.explanation)}</p>
          <button class="btn btn-primary" id="resume-video" type="button">Continue video →</button>
        </div>
      `;
      document.getElementById('resume-video').focus();
      document.getElementById('resume-video').addEventListener('click', () => {
        activeQuestion = null;
        modal.hidden = true;
        if (video.ended) {
          finishVideoIfReady();
        } else {
          video.play().catch(() => {
            updateStatus('Answer saved. Press Play to continue the video.');
          });
        }
      });
    });
    const firstRadio = modal.querySelector('input[type="radio"]');
    firstRadio?.focus();
  }

  function promptIfNeeded() {
    if (activeQuestion || finished) return;
    const nextQuestion = firstUnansweredQuestion();
    if (nextQuestion && video.currentTime >= nextQuestion.time) {
      displayQuestion(nextQuestion);
    }
  }

  function finishVideoIfReady() {
    if (finished || !video.ended) return;
    const pending = firstUnansweredQuestion();
    if (pending) {
      displayQuestion(pending);
      return;
    }
    finished = true;
    updateStatus('Video completed. All checkpoint questions were answered correctly.');
    markDone(moduleId, sectionId);
  }

  // Do not let a learner scrub past a checkpoint without answering it.
  video.addEventListener('seeking', () => {
    const pending = firstUnansweredQuestion();
    if (pending && video.currentTime > pending.time + 0.35) {
      video.currentTime = pending.time;
      displayQuestion(pending);
    }
  });

  video.addEventListener('timeupdate', promptIfNeeded);
  video.addEventListener('ended', finishVideoIfReady);
  video.addEventListener('error', () => {
    updateStatus('The sample video could not load. Try opening the project with VS Code Live Server.');
  });

  speedSelect?.addEventListener('change', () => {
    const speed = Number(speedSelect.value);
    video.playbackRate = Number.isFinite(speed) ? speed : 1;
  });

  updateStatus();
}

function initDragAssessment() {
  const root = document.getElementById('drag-assessment');
  if (!root) return;
  const items = [
    ['A global network of connected computers and devices that communicate with each other.', 'internet'],
    ['A service on the Internet that lets people access information through web pages.', 'www'],
    ['It supports email, file transfers and video calls.', 'internet'],
    ['It is used to access linked websites and online content.', 'www'],
    ['It connects devices and networks around the world.', 'internet'],
    ['Web pages, blogs and online tutorials are examples associated with it.', 'www']
  ];

  root.innerHTML = `
    <div class="drag-zone">
      <div><h3>Descriptions</h3><div id="drag-bank" class="drag-bank"></div></div>
      <div><h3>Drop into the correct column</h3><div class="drop-columns" style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
        <div class="drop-column" data-kind="internet"><h3>Internet</h3><div class="drop-items"></div></div>
        <div class="drop-column" data-kind="www"><h3>World Wide Web (WWW)</h3><div class="drop-items"></div></div>
      </div></div>
    </div>
    <button id="drag-submit" class="btn btn-primary" type="button" style="margin-top:12px">Submit</button>
    <p id="drag-result" class="form-message" role="status"></p>
  `;

  const bank = document.getElementById('drag-bank');
  items.forEach((item, index) => {
    const card = document.createElement('div');
    card.className = 'draggable';
    card.draggable = true;
    card.dataset.answer = item[1];
    card.dataset.id = String(index);
    card.textContent = item[0];
    bank.appendChild(card);
  });

  let dragged = null;
  root.addEventListener('dragstart', event => {
    if (event.target.classList.contains('draggable')) dragged = event.target;
  });
  root.querySelectorAll('.drop-column').forEach(column => {
    column.addEventListener('dragover', event => event.preventDefault());
    column.addEventListener('drop', event => {
      event.preventDefault();
      if (dragged) column.querySelector('.drop-items').appendChild(dragged);
    });
  });
  bank.addEventListener('dragover', event => event.preventDefault());
  bank.addEventListener('drop', event => {
    event.preventDefault();
    if (dragged) bank.appendChild(dragged);
  });

  document.getElementById('drag-submit').addEventListener('click', () => {
    let correct = 0;
    let placed = 0;
    root.querySelectorAll('.drop-column').forEach(column => {
      column.querySelectorAll('.draggable').forEach(card => {
        placed++;
        const right = card.dataset.answer === column.dataset.kind;
        card.classList.toggle('correct', right);
        card.classList.toggle('wrong', !right);
        if (right) correct++;
      });
    });
    if (placed !== items.length) {
      setMessage('drag-result', 'Drag every description into a column before submitting.', 'error');
      return;
    }
    const passed = correct === items.length;
    recordAssessmentResult(1, correct, items.length, passed);

    if (passed) {
      setMessage('drag-result', `Excellent — ${correct}/${items.length}. Module 1 drag-and-drop assessment passed.`, 'success');
      markDone(1, 'dragdrop');
    } else {
      setMessage('drag-result', `${correct}/${items.length} correct. All six descriptions must be placed correctly to pass. Review the highlighted items and try again.`, 'error');
    }
  });
}

function arrangeAnswerChoices(question, questionIndex, seed = 0) {
  // Keep answer positions balanced so the correct option is not always first.
  const correctText = question.options[question.answer];
  const distractors = question.options.filter((_, index) => index !== question.answer);
  const correctPosition = (questionIndex * 3 + seed) % question.options.length;
  const options = [];
  let distractorIndex = 0;

  for (let position = 0; position < question.options.length; position++) {
    if (position === correctPosition) {
      options.push(correctText);
    } else {
      options.push(distractors[distractorIndex++]);
    }
  }

  return { ...question, displayedOptions: options, displayedAnswer: correctPosition };
}

function initMCQ(moduleId) {
  const root = document.getElementById('mcq-assessment');
  if (!root) return;
  const questions = MCQ_QUESTIONS[moduleId] || [];
  if (!questions.length) {
    root.innerHTML = '<p class="form-message error">Questions are not available for this assessment yet.</p>';
    return;
  }
  const displayedQuestions = questions.map((question, index) =>
    arrangeAnswerChoices(question, index, Number(moduleId))
  );

  root.innerHTML = `
    <div class="assessment-intro">
      <p><strong>${displayedQuestions.length} questions</strong> · Pass mark: <strong>${assessmentPassMark()}%</strong></p>
      <p>Select one answer for every question, then submit to see your grade.</p>
    </div>
    <div class="mcq">
      ${displayedQuestions.map((question, index) => `
        <fieldset class="panel mcq-question">
          <legend>${index + 1}. ${escapeHTML(question.question)}</legend>
          ${question.displayedOptions.map((option, optionIndex) => `
            <label class="mcq-option">
              <input type="radio" name="mcq-${index}" value="${optionIndex}">
              <span>${escapeHTML(option)}</span>
            </label>
          `).join('')}
        </fieldset>
      `).join('')}
    </div>
    <button id="mcq-submit" class="btn btn-primary" type="button">Submit assessment</button>
    <p id="mcq-result" class="form-message assessment-result" role="status" aria-live="polite"></p>
  `;

  document.getElementById('mcq-submit').addEventListener('click', () => {
    let score = 0;
    let allAnswered = true;
    displayedQuestions.forEach((question, index) => {
      const choice = root.querySelector(`input[name="mcq-${index}"]:checked`);
      if (!choice) allAnswered = false;
      else if (Number(choice.value) === question.displayedAnswer) score++;
    });

    if (!allAnswered) {
      setMessage('mcq-result', 'Answer all questions before submitting.', 'error');
      root.querySelector('input:not(:checked)')?.focus();
      return;
    }

    const percentage = Math.round((score / displayedQuestions.length) * 100);
    const passed = percentage >= assessmentPassMark();
    recordAssessmentResult(moduleId, score, displayedQuestions.length, passed);

    if (passed) {
      setMessage(
        'mcq-result',
        `Assessment passed: ${score}/${displayedQuestions.length} (${percentage}%). You have met the ${assessmentPassMark()}% pass mark.`,
        'success'
      );
      markDone(moduleId, 'assessment');
    } else {
      setMessage(
        'mcq-result',
        `Not passed yet: ${score}/${displayedQuestions.length} (${percentage}%). You need ${assessmentPassMark()}% to pass. Review the module and try again.`,
        'error'
      );
    }
  });
}

function initHTMLPreview() {
  const editor = document.getElementById('html-editor');
  const preview = document.getElementById('html-preview');
  const button = document.getElementById('preview-html');
  if (!editor || !preview || !button) return;
  const update = () => { preview.innerHTML = editor.value; };
  update();
  button.addEventListener('click', update);
}

function renderCourseFinish(root, scoreText = '') {
  let panel = root.querySelector('#course-finish-panel');
  if (!panel) {
    panel = document.createElement('section');
    panel.id = 'course-finish-panel';
    panel.className = 'course-finish-panel';
    panel.setAttribute('aria-label', 'Course completion celebration');
    root.appendChild(panel);
  }
  panel.innerHTML = `
    <div class="course-finish-stars" aria-hidden="true">✦ 🎉 ✦</div>
    <p class="course-finish-kicker">Your learning journey is complete</p>
    <h2>Congratulations, Course Champion!</h2>
    <p>You've successfully completed <strong>Chapter 13: Internet and Web Technologies</strong>.</p>
    ${scoreText ? `<p class="course-finish-score">${escapeHTML(scoreText)}</p>` : ''}
    <p>You've explored the Internet and the Web, web servers, websites, HTML and the Software Development Life Cycle. Keep experimenting, creating and learning!</p>
    <div class="course-finish-actions">
      <a class="btn btn-primary" href="course.html">Return to my courses</a>
      <button type="button" class="btn btn-outline" id="course-celebrate-again">Celebrate again 🎉</button>
    </div>
  `;
  panel.querySelector('#course-celebrate-again').addEventListener('click', () => {
    showBadgePopup('Innoloom Course Champion', 'trophy', 'Congratulations on completing Chapter 13: Internet and Web Technologies!');
  });
}

function initOverallAssessment() {
  const root = document.getElementById('overall-assessment');
  if (!root) return;
  const questions = [
    { question: 'Which statement best distinguishes the Internet from the Web?', options: ['The Internet is the network; the Web is a service using it.', 'They are exactly the same.', 'The Web is hardware.', 'The Internet is a browser.'], answer: 0 },
    { question: 'What does a browser communicate with to retrieve a webpage?', options: ['A web server', 'A printer', 'A keyboard', 'A battery'], answer: 0 },
    { question: 'Which protocol is the secure form of HTTP?', options: ['HTTPS', 'FTP', 'CSS', 'HTML'], answer: 0 },
    { question: 'What is HTML used for?', options: ['Structuring web content', 'Editing video', 'Sending email', 'Managing Wi-Fi'], answer: 0 },
    { question: 'Which SDLC stage checks whether the system meets its requirements?', options: ['Testing', 'Decoration', 'Typing', 'Browsing'], answer: 0 },
    { question: 'Which website element helps visitors move between pages?', options: ['Navigation menu', 'Background colour only', 'A decorative border', 'The file extension'], answer: 0 },
    { question: 'What does a web server send after processing a valid request?', options: ['A response containing the requested resource or status', 'A keyboard signal', 'A browser theme', 'A screen saver'], answer: 0 },
    { question: 'What does the href attribute specify in an HTML link?', options: ['The link destination', 'The text colour', 'The image height', 'The page language only'], answer: 0 },
    { question: 'What is the purpose of the design stage in the SDLC?', options: ['Plan the structure of the proposed solution', 'Skip requirements', 'Remove testing', 'Maintain a system before it exists'], answer: 0 },
    { question: 'What is a key safety practice when browsing websites?', options: ['Check the website address and think before sharing personal information', 'Assume every website is trustworthy', 'Share passwords to test a page', 'Ignore browser security warnings'], answer: 0 }
  ];
  // Include additional questions from the graded module assessments.
  const existing = new Set(questions.map(item => item.question));
  for (const moduleId of [2, 4, 5, 6]) {
    for (const item of MCQ_QUESTIONS[moduleId]) {
      if (questions.length >= 25) break;
      if (!existing.has(item.question)) { questions.push(item); existing.add(item.question); }
    }
  }
  const displayedQuestions = questions.map((question, index) =>
    arrangeAnswerChoices(question, index, 2)
  );

  root.innerHTML = `
    <div class="assessment-intro">
      <p><strong>${displayedQuestions.length} questions</strong> · Pass mark: <strong>${assessmentPassMark()}%</strong></p>
      <p>Answer every question. You may review the course and retry if you do not pass.</p>
    </div>
    <div class="mcq">
      ${displayedQuestions.map((question, index) => `
        <fieldset class="panel mcq-question">
          <legend>${index + 1}. ${escapeHTML(question.question)}</legend>
          ${question.displayedOptions.map((option, optionIndex) => `
            <label class="mcq-option">
              <input type="radio" name="overall-${index}" value="${optionIndex}">
              <span>${escapeHTML(option)}</span>
            </label>
          `).join('')}
        </fieldset>
      `).join('')}
    </div>
    <button id="overall-submit" class="btn btn-primary" type="button">Submit overall assessment</button>
    <p id="overall-result" class="form-message assessment-result" role="status" aria-live="polite"></p>
  `;

  // Keep the congratulations visible when a learner revisits a completed course.
  if (isDone(8, 'overall')) renderCourseFinish(root);

  document.getElementById('overall-submit').addEventListener('click', () => {
    if (!allModulesComplete() || !isDone(7, 'summary')) {
      setMessage('overall-result', 'Complete Modules 1–6 and mark the Course Summary complete before attempting the overall assessment.', 'error');
      return;
    }

    let score = 0;
    let allAnswered = true;
    displayedQuestions.forEach((question, index) => {
      const choice = root.querySelector(`input[name="overall-${index}"]:checked`);
      if (!choice) allAnswered = false;
      else if (Number(choice.value) === question.displayedAnswer) score++;
    });

    if (!allAnswered) {
      setMessage('overall-result', 'Answer every question before submitting.', 'error');
      return;
    }

    const percentage = Math.round((score / displayedQuestions.length) * 100);
    const passed = percentage >= assessmentPassMark();
    recordAssessmentResult('overall', score, displayedQuestions.length, passed);

    if (passed) {
      markDone(8, 'overall');
      awardCourseBadge();
      setMessage('overall-result', `Assessment passed: ${score}/${displayedQuestions.length} (${percentage}%). Course completed!`, 'success');
      renderCourseFinish(root, `Final assessment: ${score}/${displayedQuestions.length} (${percentage}%)`);
      refreshModuleIndicators();
    } else {
      setMessage('overall-result', `Not passed yet: ${score}/${displayedQuestions.length} (${percentage}%). You need ${assessmentPassMark()}% to pass. Review the modules and try again.`, 'error');
    }
  });
}

/* ------------------ Page renderers ------------------ */

function initHome() {
  const tbody = document.getElementById('achievement-rows');
  if (!tbody) return;

  const data = loadState();
  const students = data.users.filter(person => person.role === 'student').map(person => {
    const email = person.email.toLowerCase();
    const marks = data.progress[email] || {};
    const earned = data.badges[email] || {};
    const completedItems = Object.values(marks).filter(Boolean).length;
    const badgeCount = MODULES.filter(module => Boolean(earned[module.id])).length;
    const results = data.assessmentResults[email] || {};
    const assessmentsPassed = MODULES.filter(module => Boolean(results[module.id]?.passed)).length;
    return {
      name: person.name,
      email,
      progress: courseProgress(email),
      completedItems,
      badgeCount,
      assessmentsPassed
    };
  });

  const activeStudents = students.filter(student =>
    student.completedItems > 0 || student.badgeCount > 0 || student.assessmentsPassed > 0
  );

  if (!activeStudents.length) {
    tbody.innerHTML = `
      <tr><td colspan="4" class="spotlight-empty">
        Achievement criteria are ready. Learners appear here when they make progress, earn module badges, or pass assessments.
      </td></tr>`;
    return;
  }

  const highest = (metric, minimum = 1) => {
    const sorted = [...activeStudents].sort((a, b) =>
      b[metric] - a[metric] || b.completedItems - a.completedItems || a.name.localeCompare(b.name)
    );
    const top = sorted[0];
    if (!top || top[metric] < minimum) return null;
    return top;
  };

  const winners = [
    {
      criterion: 'Progress Leader',
      student: highest('progress'),
      value: student => `${student.progress}% course progress`,
      empty: 'Complete learning sections to qualify.'
    },
    {
      criterion: 'Badge Collector',
      student: highest('badgeCount'),
      value: student => `${student.badgeCount} of 6 module badges earned`,
      empty: 'Earn a module completion badge to qualify.'
    },
    {
      criterion: 'Assessment Star',
      student: highest('assessmentsPassed'),
      value: student => `${student.assessmentsPassed} of 6 module assessments passed`,
      empty: 'Pass a module assessment to qualify.'
    }
  ];

  tbody.innerHTML = winners.map((winner, index) => `
    <tr>
      <td>${winner.student ? index + 1 : '—'}</td>
      <td>${winner.student ? escapeHTML(winner.student.name) : 'Not awarded yet'}</td>
      <td><strong>${escapeHTML(winner.criterion)}</strong></td>
      <td>${winner.student ? escapeHTML(winner.value(winner.student)) : escapeHTML(winner.empty)}</td>
    </tr>
  `).join('');
}

function initLogin() {
  const form = document.getElementById('login-form');
  if (!form) return;
  const emailInput = document.getElementById('login-email');
  const passwordInput = document.getElementById('login-password');

  function checkEmail() {
    const problem = emailError(emailInput.value);
    setInputError(emailInput, problem);
    return problem;
  }
  function checkPassword() {
    let problem = '';
    if (!passwordInput.value) problem = 'Password is required.';
    else if (passwordInput.value.length > 128) problem = 'Password is too long.';
    setInputError(passwordInput, problem);
    return problem;
  }

  [emailInput, passwordInput].forEach(input => {
    input.addEventListener('blur', () => {
      input.dataset.touched = 'true';
      if (input === emailInput) checkEmail(); else checkPassword();
    });
    input.addEventListener('input', () => {
      if (input.dataset.touched === 'true') {
        if (input === emailInput) checkEmail(); else checkPassword();
      }
      setMessage('login-message', '');
    });
  });

  form.addEventListener('submit', event => {
    event.preventDefault();
    const emailProblem = checkEmail();
    const passwordProblem = checkPassword();
    const role = form.querySelector('input[name="role"]:checked')?.value;
    if (emailProblem || passwordProblem) {
      setMessage('login-message', 'Please correct the highlighted fields.', 'error');
      (emailProblem ? emailInput : passwordInput).focus();
      return;
    }
    if (!['student', 'teacher'].includes(role)) {
      setMessage('login-message', 'Please select Student or Teacher.', 'error');
      return;
    }
    const email = emailInput.value.trim().toLowerCase();
    const account = loadState().users.find(person =>
      person.email.toLowerCase() === email && person.password === passwordInput.value && person.role === role
    );
    if (!account) {
      setMessage('login-message', 'Email, password or selected account type is incorrect.', 'error');
      return;
    }
    setCurrentUser(account.email);
    setMessage('login-message', 'Login successful.', 'success');
    setTimeout(() => { location.href = account.role === 'teacher' ? 'teacher.html' : 'course.html'; }, 250);
  });
}

function initSignup() {
  const form = document.getElementById('signup-form');
  if (!form) return;
  const fields = ['name', 'school', 'gender', 'email', 'role', 'teacherCode', 'password', 'confirmPassword', 'bio'];
  const teacherCodeGroup = document.getElementById('teacher-code-group');
  const teacherCodeInput = document.getElementById('signup-teacher-code');
  function updateTeacherCodeVisibility() {
    const isTeacher = form.elements.role.value === 'teacher';
    if (teacherCodeGroup) teacherCodeGroup.hidden = !isTeacher;
    if (teacherCodeInput) {
      teacherCodeInput.disabled = !isTeacher;
      teacherCodeInput.required = isTeacher;
      if (!isTeacher) {
        teacherCodeInput.value = '';
        setFieldError(form, 'teacherCode', '');
      }
    }
  }
  form.elements.role.addEventListener('change', updateTeacherCodeVisibility);
  updateTeacherCodeVisibility();

  function values() {
    return Object.fromEntries(new FormData(form).entries());
  }
  function validateField(name, data) {
    switch (name) {
      case 'name': return validateName(data.name);
      case 'school': return validateSchool(data.school);
      case 'gender': return ['Male', 'Female', 'Prefer not to say'].includes(data.gender) ? '' : 'Please select a gender option.';
      case 'email': return emailError(data.email);
      case 'role': return ['student', 'teacher'].includes(data.role) ? '' : 'Please select Student or Teacher.';
      case 'teacherCode': return data.role !== 'teacher' || data.teacherCode === 'INNOLOOM-teach' ? '' : 'Incorrect teacher registration code.';
      case 'password': return passwordError(data.password);
      case 'confirmPassword':
        if (!data.confirmPassword) return 'Please confirm your password.';
        return data.password === data.confirmPassword ? '' : 'Passwords do not match.';
      case 'bio': return validateBio(data.bio);
      default: return '';
    }
  }
  function validateOne(name) {
    const problem = validateField(name, values());
    setFieldError(form, name, problem);
    return problem;
  }

  fields.forEach(name => {
    const field = form.querySelector(`[name="${name}"]`);
    if (!field) return;
    field.addEventListener('blur', () => {
      field.dataset.touched = 'true';
      validateOne(name);
    });
    const update = () => {
      if (field.dataset.touched === 'true') validateOne(name);
      if (name === 'password') {
        const confirmation = form.querySelector('[name="confirmPassword"]');
        if (confirmation?.dataset.touched === 'true') validateOne('confirmPassword');
      }
      setMessage('signup-message', '');
    };
    field.addEventListener('input', update);
    field.addEventListener('change', update);
  });

  form.addEventListener('submit', event => {
    event.preventDefault();
    clearFieldErrors(form);
    const data = values();
    const errors = [];
    fields.forEach(name => {
      const problem = validateField(name, data);
      setFieldError(form, name, problem);
      if (problem) errors.push({ name, problem });
    });
    if (errors.length) {
      setMessage('signup-message', 'Please fix the highlighted fields before continuing.', 'error');
      form.querySelector('[aria-invalid="true"]')?.focus();
      return;
    }

    const email = String(data.email).trim().toLowerCase();
    const saved = loadState();
    if (saved.users.some(person => person.email.toLowerCase() === email)) {
      setFieldError(form, 'email', 'An account with this email already exists.');
      setMessage('signup-message', 'Use another email or log in to your existing account.', 'error');
      document.getElementById('signup-email')?.focus();
      return;
    }

    saved.users.push({
      name: String(data.name).trim(),
      school: String(data.school).trim(),
      gender: data.gender,
      email,
      role: data.role,
      password: data.password,
      bio: String(data.bio || '').trim(),
      classes: []
    });
    if (!saveState(saved)) return;
    setCurrentUser(email);
    setMessage('signup-message', 'Your account has been created successfully.', 'success');
    setTimeout(() => { location.href = data.role === 'teacher' ? 'teacher.html' : 'course.html'; }, 400);
  });
}

function initCourse() {
  const percentage = courseProgress();
  const label = document.getElementById('course-progress-label');
  const bar = document.getElementById('course-progress-bar');
  if (label) label.textContent = `${percentage}%`;
  if (bar) bar.style.width = `${percentage}%`;
}

function initResources() {
  const host = document.getElementById('resource-grid');
  if (!host) return;

  const resources = [
    {
      icon: 'download',
      title: 'Internet and World Wide Web Infographic',
      category: 'Downloadable class infographic',
      description: 'Review the comparison between the Internet and the World Wide Web, common uses, browser access and how the Web works.',
      assetPath: 'assets/infographics/internet-world-wide-web-infographic.png',
      extension: '.png'
    },
    {
      icon: 'code',
      title: 'W3Schools — What is HTTP?',
      category: 'External learning website',
      description: 'Read an additional explanation of HTTP and how it is used when a browser communicates with a web server.',
      url: 'https://www.w3schools.com/whatis/whatis_http.asp'
    },
    {
      icon: 'browser',
      title: 'GeeksforGeeks — Web Browser',
      category: 'External learning website',
      description: 'Explore another explanation of web browsers, their purpose and how they retrieve and display web content.',
      url: 'https://www.geeksforgeeks.org/computer-networks/web-browser/'
    }
  ];

  host.innerHTML = resources.map(resource => `
    <article class="resource-card">
      <div class="resource-icon" aria-hidden="true">${iconSVG(resource.icon)}</div>
      <p class="resource-category">${escapeHTML(resource.category)}</p>
      <h2>${escapeHTML(resource.title)}</h2>
      <p>${escapeHTML(resource.description)}</p>
      <div class="resource-actions">
        ${resource.url ? `<a class="btn btn-primary" href="${resource.url}" target="_blank" rel="noopener noreferrer">Open learning website ${iconSVG('external')}</a>` : ''}
        ${resource.assetPath ? `<a class="btn btn-outline" href="${resource.assetPath}" download="internet-world-wide-web-infographic.png">Download infographic ${iconSVG('download')}</a>` : ''}
      </div>
    </article>
  `).join('');
}

function initFeedback() {
  const form = document.getElementById('feedback-form');
  if (!form) return;
  form.addEventListener('submit', event => {
    event.preventDefault();
    const topic = document.getElementById('feedback-topic').value.trim();
    const feedbackText = document.getElementById('feedback-text').value.trim();
    if (topic.length < 2 || topic.length > 120) {
      setMessage('feedback-message', 'Topic must be between 2 and 120 characters.', 'error');
      return;
    }
    if (feedbackText.length < 10 || feedbackText.length > 1000) {
      setMessage('feedback-message', 'Feedback must be between 10 and 1000 characters.', 'error');
      return;
    }
    const data = loadState();
    data.feedback.push({ topic, text: feedbackText, email: getUser()?.email || 'anonymous', createdAt: new Date().toISOString() });
    saveState(data);
    form.reset();
    setMessage('feedback-message', 'Your feedback has been submitted. Thank you!', 'success');
  });
}

function initTeacherDashboard() {
  const teacher = getUser();
  if (!teacher || teacher.role !== 'teacher') {
    alert('Teacher access only. Please log in using a teacher account.');
    location.href = 'login.html';
    return;
  }

  let selectedClass = '';
  const classList = document.getElementById('class-list');
  const classSelect = document.getElementById('student-class');
  const rows = document.getElementById('student-progress-rows');
  const classForm = document.getElementById('class-form');
  const studentForm = document.getElementById('student-form');
  if (!classList || !classSelect || !rows || !classForm || !studentForm) return;

  function teacherClasses(data) {
    return data.classes.filter(item => item.teacherEmail.toLowerCase() === teacher.email.toLowerCase());
  }

  function redraw() {
    const data = loadState();
    const classes = teacherClasses(data);
    if (!classes.some(item => item.name === selectedClass)) selectedClass = classes[0]?.name || '';

    classList.innerHTML = classes.length
      ? classes.map(item => `<button type="button" class="class-chip ${selectedClass === item.name ? 'active' : ''}" data-class="${encodeURIComponent(item.name)}">${escapeHTML(item.name)}</button>`).join('')
      : '<p class="muted">No classes yet. Create one above.</p>';

    classSelect.innerHTML = classes.map(item => `<option value="${escapeHTML(item.name)}">${escapeHTML(item.name)}</option>`).join('');
    if (selectedClass) classSelect.value = selectedClass;

    const chosen = classes.find(item => item.name === selectedClass);
    const students = chosen ? chosen.studentEmails.map(email => data.users.find(person => person.email.toLowerCase() === email.toLowerCase())).filter(Boolean) : [];
    const summary = document.getElementById('teacher-summary');
    if (summary) summary.textContent = chosen ? `${students.length} student(s) in ${chosen.name}` : '';

    rows.innerHTML = students.length ? students.map(student => {
      const percentage = courseProgress(student.email);
      const badgeCount = MODULES.filter(module => data.badges[student.email.toLowerCase()]?.[module.id]).length;
      return `<tr><td>${escapeHTML(student.name)}</td><td>${escapeHTML(student.email)}</td><td><span class="pill">${percentage >= 100 ? 'Complete' : 'Learning'}</span></td><td><span class="progress-mini"><span style="width:${percentage}%"></span></span> ${percentage}%</td><td>${badgeCount ? Array.from({ length: badgeCount }, () => `<span class="teacher-badge-icon">${iconSVG('trophy')}</span>`).join('') : '—'}</td></tr>`;
    }).join('') : '<tr><td colspan="5">No students assigned yet.</td></tr>';
  }

  classList.addEventListener('click', event => {
    const button = event.target.closest('[data-class]');
    if (!button) return;
    selectedClass = decodeURIComponent(button.dataset.class);
    redraw();
  });

  classSelect.addEventListener('change', () => {
    selectedClass = classSelect.value;
    redraw();
  });

  classForm.addEventListener('submit', event => {
    event.preventDefault();
    const input = document.getElementById('class-name');
    const name = input.value.trim();
    if (name.length < 3 || name.length > 80) {
      setMessage('class-message', 'Class name must be between 3 and 80 characters.', 'error');
      return;
    }
    const data = loadState();
    if (teacherClasses(data).some(item => item.name.toLowerCase() === name.toLowerCase())) {
      setMessage('class-message', 'That class already exists.', 'error');
      return;
    }
    data.classes.push({ name, teacherEmail: teacher.email.toLowerCase(), studentEmails: [] });
    if (!saveState(data)) return;
    selectedClass = name;
    classForm.reset();
    setMessage('class-message', 'Class created successfully.', 'success');
    redraw();
  });

  studentForm.addEventListener('submit', event => {
    event.preventDefault();
    const email = document.getElementById('student-email').value.trim().toLowerCase();
    const className = classSelect.value;
    if (emailError(email)) {
      setMessage('student-message', 'Enter a valid student email address.', 'error');
      return;
    }
    const data = loadState();
    const chosen = teacherClasses(data).find(item => item.name === className);
    if (!chosen) {
      setMessage('student-message', 'Create or select a class first.', 'error');
      return;
    }
    const student = data.users.find(person => person.email.toLowerCase() === email && person.role === 'student');
    if (!student) {
      setMessage('student-message', 'No student account was found with that email. Ask the student to sign up first.', 'error');
      return;
    }
    if (chosen.studentEmails.includes(email)) {
      setMessage('student-message', 'That student is already assigned to this class.', 'error');
      return;
    }
    chosen.studentEmails.push(email);
    student.classes ||= [];
    if (!student.classes.includes(className)) student.classes.push(className);
    if (!saveState(data)) return;
    selectedClass = className;
    studentForm.reset();
    setMessage('student-message', `${student.name} added to ${className}.`, 'success');
    redraw();
  });

  redraw();
}

function renderBrowserSectionMenu() {
  const sections = [
    { id: 'browser', title: 'Web Browser', number: '01', icon: 'browser', description: 'What a browser is, common examples, and how a browser works with a web server.' },
    { id: 'http', title: 'HTTP', number: '02', icon: 'network', description: 'Hypertext Transfer Protocol and the request-and-response process.' },
    { id: 'https', title: 'HTTPS', number: '03', icon: 'shield', description: 'Hypertext Transfer Protocol Secure and encrypted communication.' },
    { id: 'differences', title: 'Difference between HTTP and HTTPS', number: '04', icon: 'layout', description: 'Compare the two protocols using the table from the reading material.' }
  ];

  const allReadingsDone = sections.every(section => isDone(3, section.id));

  return lessonHeader(3, 'Module 3: Web Browser', 'Choose one of the four reading sections.') + `
    <p class="browser-menu-intro">Select a box to open its reading material. At the end of each reading, mark the section complete and return here to choose the next box.</p>
    <div class="browser-section-grid">
      ${sections.map(section => {
        const unlocked = canAccessItem(3, section.id);
        const completed = isDone(3, section.id);
        return `
          <a class="browser-section-tile ${unlocked ? '' : 'is-locked'} ${completed ? 'is-complete' : ''}"
             href="${itemURL(3, section.id)}"
             data-browser-section="${section.id}"
             data-locked="${unlocked ? 'false' : 'true'}"
             ${unlocked ? '' : 'aria-disabled="true" tabindex="-1"'}
             title="${unlocked ? 'Click to explore this section' : 'Complete the previous reading first'}">
            <span class="browser-tile-title">
              <span class="browser-tile-number">${section.number}</span>
              ${iconSVG(section.icon)}
              <strong>${escapeHTML(section.title)}</strong>
              ${completed ? '<span class="browser-complete-label">Completed ✓</span>' : (!unlocked ? '<span class="lock-label">Locked</span>' : '')}
            </span>
            <span class="browser-tile-arrow" aria-hidden="true"></span>
            <span class="browser-tile-action">${completed ? 'Review reading' : (unlocked ? 'Click to explore' : 'Complete previous section first')}</span>
            <span class="browser-tile-description">${escapeHTML(section.description)}</span>
          </a>`;
      }).join('')}
    </div>
    <section class="browser-assessment-gate">
      <div>
        <h2>Module 3 Grading Assessment</h2>
        <p>${allReadingsDone ? 'You have completed all four reading sections. You can now take the grading assessment.' : 'Complete all four reading sections, marking each one complete, to unlock the grading assessment.'}</p>
      </div>
      ${allReadingsDone
        ? `<a class="btn btn-primary" href="${itemURL(3, 'assessment')}">Start grading assessment →</a>`
        : `<span class="browser-assessment-locked">${iconSVG('shield')} Locked until all four sections are complete</span>`}
    </section>
  </div>`;
}

function renderModule() {
  const parameters = new URLSearchParams(location.search);
  const moduleId = Number(parameters.get('m') || '1');
  const rawSectionId = parameters.get('s') || 'intro';
  const isBrowserMenu = moduleId === 3 && (rawSectionId === 'menu' || parameters.get('view') === 'menu');
  const isBrowserDetail = moduleId === 3 && !isBrowserMenu && ['browser', 'http', 'https', 'differences'].includes(rawSectionId);
  const sectionId = isBrowserMenu ? 'menu' : rawSectionId;
  const accessSectionId = isBrowserMenu ? 'browser' : sectionId;
  const sidebarHost = document.getElementById('course-sidebar');
  const contentHost = document.getElementById('learning-content');
  if (!sidebarHost || !contentHost) return;

  // Protect both sidebar navigation and direct URL entry in this frontend prototype.
  if (!canAccessItem(moduleId, accessSectionId)) {
    const nextIncomplete = firstIncompleteItem();
    if (nextIncomplete) {
      location.replace(itemURL(nextIncomplete.moduleId, nextIncomplete.sectionId));
    } else {
      location.replace('course.html');
    }
    return;
  }

  sidebarHost.innerHTML = renderSidebar(moduleId, sectionId);
  sidebarHost.onclick = event => {
    const link = event.target.closest('a[data-course-link]');
    if (link && link.dataset.locked === 'true') {
      event.preventDefault();
      alert('This section is locked. Complete the previous section and mark it complete first.');
    }
  };

  const progressLabel = document.getElementById('progress-label');
  const progressBar = document.getElementById('progress-bar');
  if (progressLabel) progressLabel.textContent = `${courseProgress()}%`;
  if (progressBar) progressBar.style.width = `${courseProgress()}%`;

  const previousLink = document.getElementById('prev-link');
  if (previousLink) {
    previousLink.href = isBrowserMenu
      ? itemURL(2, 'assessment')
      : (moduleId === 3 ? 'module.html?m=3&s=menu' : previousURL(moduleId, sectionId));
    previousLink.textContent = isBrowserMenu ? '← Back' : '← Back';
    previousLink.style.display = isBrowserDetail ? 'none' : '';
  }

  const nextLink = document.getElementById('next-link');
  if (nextLink) {
    nextLink.href = nextURL(moduleId, sectionId);
    nextLink.style.display = (isBrowserMenu || isBrowserDetail) ? 'none' : '';
  }
  const completeButtonInNav = document.getElementById('complete-section');
  if (completeButtonInNav && (isBrowserMenu || isBrowserDetail)) completeButtonInNav.style.display = 'none';
  const learningNav = document.querySelector('.learning-nav');
  if (learningNav) learningNav.style.display = isBrowserDetail ? 'none' : '';

  let html;
  if (isBrowserMenu) {
    html = renderBrowserSectionMenu();
  } else if (moduleId === 7) {
    html = lessonHeader(7, 'Course Summary', 'Your complete Chapter 13 revision guide.') + `
<div class="revision-overview"><h2>Chapter 13 at a Glance</h2><p>Review all six learning modules, then expand any topic below for detailed notes and exam practice.</p><div class="revision-module-grid"><div class="revision-module-card"><span>Module 1</span><strong>World Wide Web</strong><small>Internet versus WWW</small></div><div class="revision-module-card"><span>Module 2</span><strong>Web Server</strong><small>How websites are delivered</small></div><div class="revision-module-card"><span>Module 3</span><strong>Web Browser</strong><small>HTTP and HTTPS</small></div><div class="revision-module-card"><span>Module 4</span><strong>Website</strong><small>Design and essential elements</small></div><div class="revision-module-card"><span>Module 5</span><strong>HTML</strong><small>Structure, tags and examples</small></div><div class="revision-module-card"><span>Module 6</span><strong>SDLC</strong><small>Eight development stages</small></div></div></div><div class="revision-notes"><h1>Chapter 13: Internet and Web Technologies</h1>
<details class="revision-topic"><summary>Complete Revision Notes</summary><div class="revision-topic-body">
<hr />
</div></details><details class="revision-topic"><summary>1. World Wide Web (WWW)</summary><div class="revision-topic-body">
<p>The <strong>World Wide Web (WWW)</strong> is an internet-based service that uses a common set of rules called <strong>Protocols</strong> to distribute documents across the Internet in a standard way. We access the WWW through <strong>web browsers</strong> (Chrome, Firefox, etc.), which let us view articles, e-books, news, and tutorials stored as web pages on <strong>web servers</strong>.</p>
<p><strong>Key distinction — don't mix these up:</strong></p>
<table>
<thead>
<tr>
  <th>Aspect</th>
  <th>Internet</th>
  <th>Web (WWW)</th>
</tr>
</thead>
<tbody>
<tr>
  <td>Definition</td>
  <td>A global network of computers connected together for sharing data</td>
  <td>A system of web pages and websites that run on the internet</td>
</tr>
<tr>
  <td>Function</td>
  <td>Infrastructure for communication (email, file transfer, browsing)</td>
  <td>Uses the internet to access web pages, websites, and content</td>
</tr>
<tr>
  <td>Example</td>
  <td>Email, video calls</td>
  <td>Wikipedia, news websites, blogs</td>
</tr>
</tbody>
</table>
<blockquote>
<p><strong>Exam tip:</strong> The Internet is the <em>network</em>; the Web is a <em>service</em> that runs on top of it.</p>
</blockquote>
<hr />
</div></details><details class="revision-topic"><summary>2. Web Server</summary><div class="revision-topic-body">
<p>A <strong>web server</strong> is a computer (or software) that <strong>stores websites and sends web pages to users</strong> when requested through a browser. It delivers content like text, images, and videos, and can also support gaming, data storage, or business applications.</p>
<p>Popular web server software: <strong>Apache, Nginx, Microsoft IIS</strong>.</p>
<hr />
</div></details><details class="revision-topic"><summary>3. Web Browser</summary><div class="revision-topic-body">
<p>A <strong>web browser</strong> is software that lets you open, view, and explore websites — it converts HTML/XML into readable pages.</p>
<p>Popular browsers: <strong>Chrome, Safari, Edge, Firefox, Opera.</strong></p>
<h3>HTTP vs HTTPS</h3>
<ul>
<li><strong>HTTP (HyperText Transfer Protocol):</strong> rules governing communication between browser (client) and server. Works on a <strong>request–response model</strong>.</li>
<li><strong>HTTPS (HTTP Secure):</strong> the secure version — uses <strong>TLS encryption</strong> to protect data like passwords and card numbers. Shown by a <strong>padlock icon</strong> in the address bar.</li>
</ul>
<table>
<thead>
<tr>
  <th>Aspect</th>
  <th>HTTP</th>
  <th>HTTPS</th>
</tr>
</thead>
<tbody>
<tr>
  <td>Security</td>
  <td>Not secure; data can be intercepted</td>
  <td>Secure; data is encrypted</td>
</tr>
<tr>
  <td>Port used</td>
  <td>Port 80</td>
  <td>Port 443</td>
</tr>
<tr>
  <td>Use case</td>
  <td>Normal, non-sensitive browsing</td>
  <td>Banking, shopping, email, secure data transfer</td>
</tr>
<tr>
  <td>Encryption</td>
  <td>None</td>
  <td>Yes</td>
</tr>
</tbody>
</table>
<hr />
</div></details><details class="revision-topic"><summary>4. Website</summary><div class="revision-topic-body">
<p>A <strong>website</strong> is a group of related web pages accessible via a unique internet address, with a <strong>home page</strong> as the main entry point.</p>
<p><strong>Key words:</strong></p>
<ul>
<li><strong>URL</strong> — the unique address used to locate a resource on the internet</li>
<li><strong>DNS</strong> — the &quot;internet's phone book&quot;; converts website names into IP addresses</li>
</ul>
<h3>Elements of a Good Website (exam favorite — know all 8!)</h3>
<table>
<thead>
<tr>
  <th>Element</th>
  <th>What it means</th>
</tr>
</thead>
<tbody>
<tr>
  <td><strong>Purpose</strong></td>
  <td>Clear goal (sell, inform, build community) — guides the design</td>
</tr>
<tr>
  <td><strong>Content</strong></td>
  <td>Text, images, videos — quality content improves SEO</td>
</tr>
<tr>
  <td><strong>Layout</strong></td>
  <td>Header, footer, nav menu, main body, sidebar</td>
</tr>
<tr>
  <td><strong>Navigation</strong></td>
  <td>Menus/links that help users move between pages easily</td>
</tr>
<tr>
  <td><strong>Visual Design</strong></td>
  <td>Images, icons, graphics that keep users engaged</td>
</tr>
<tr>
  <td><strong>Responsiveness</strong></td>
  <td>Site adjusts automatically to phones, tablets, desktops</td>
</tr>
<tr>
  <td><strong>Security</strong></td>
  <td>SSL protects user data during login/data entry</td>
</tr>
<tr>
  <td><strong>Footer</strong></td>
  <td>Contact info, privacy policy, copyright, useful links</td>
</tr>
<tr>
  <td><strong>Accessibility</strong></td>
  <td>Color contrast, alt-text for images, keyboard navigation</td>
</tr>
</tbody>
</table>
<hr />
</div></details><details class="revision-topic"><summary>5. HTML (HyperText Markup Language)</summary><div class="revision-topic-body">
<p>HTML tells the browser <strong>how to display content</strong> — text, images, sound, video, and links. A file saved as <code>filename.html</code> becomes a webpage.</p>
<p><strong>Tools needed:</strong> a text/HTML editor (e.g., VS Code, Notepad++) + a web browser.</p>
<h3>Tags and Attributes</h3>
<ul>
<li><strong>Tag</strong> — a word inside angle brackets <code>&lt; &gt;</code> that tells the browser what to do. Most tags come in <strong>pairs</strong>: <code>&lt;tagname&gt;...&lt;/tagname&gt;</code>.</li>
<li><strong>Attribute</strong> — extra info inside a tag, written as <code>name=&quot;value&quot;</code> (e.g., color, size).</li>
<li><strong>Element</strong> = start tag + content + end tag. Example: <code>&lt;p&gt;Welcome to Bhutan&lt;/p&gt;</code></li>
</ul>
<h3>Structure of an HTML Document</h3>
<pre><code class="language-html">&lt;!DOCTYPE html&gt;
&lt;html&gt;
  &lt;head&gt;
    &lt;title&gt;Page Title&lt;/title&gt;   &lt;!-- shows on browser tab --&gt;
  &lt;/head&gt;
  &lt;body&gt;
    &lt;!-- all visible content goes here --&gt;
  &lt;/body&gt;
&lt;/html&gt;
</code></pre>
<ul>
<li><strong>Head section</strong> → contains <code>&lt;title&gt;</code> (tab text), meta info — not visible on page</li>
<li><strong>Body section</strong> → all visible content (text, images, links)</li>
</ul>
<p><strong>Saving:</strong> File → Save As → filename + <code>.html</code> extension (set &quot;Save as type&quot; to <strong>All Files</strong>, not <code>.txt</code>).</p>
<h3>The Four Categories of HTML Tags (very important — commonly tested)</h3>
<table>
<thead>
<tr>
  <th>Category</th>
  <th>Description</th>
  <th>Examples</th>
</tr>
</thead>
<tbody>
<tr>
  <td><strong>Container Tags</strong></td>
  <td>Have opening + closing tag</td>
  <td><code>&lt;p&gt;...&lt;/p&gt;</code>, <code>&lt;a&gt;...&lt;/a&gt;</code></td>
</tr>
<tr>
  <td><strong>Empty Tags</strong></td>
  <td>No closing tag</td>
  <td><code>&lt;br&gt;</code>, <code>&lt;img&gt;</code>, <code>&lt;meta&gt;</code></td>
</tr>
<tr>
  <td><strong>Block-level vs Inline</strong></td>
  <td>Block = full width; Inline = sits within a line, no line break</td>
  <td>Block: <code>&lt;div&gt;</code>, <code>&lt;p&gt;</code> · Inline: <code>&lt;span&gt;</code>, <code>&lt;strong&gt;</code></td>
</tr>
<tr>
  <td><strong>Semantic vs Non-Semantic</strong></td>
  <td>Semantic = describes meaning; Non-semantic = just for layout/styling</td>
  <td>Semantic: <code>&lt;header&gt;</code>, <code>&lt;footer&gt;</code>, <code>&lt;nav&gt;</code>, <code>&lt;article&gt;</code> · Non-semantic: <code>&lt;div&gt;</code>, <code>&lt;span&gt;</code></td>
</tr>
</tbody>
</table>
<h3>Common Empty Tags</h3>
<ul>
<li><code>&lt;!DOCTYPE html&gt;</code> — declares HTML5 version</li>
<li><code>&lt;meta&gt;</code> — hidden info for browsers/search engines (charset, author, viewport)</li>
<li><code>&lt;img src=&quot;...&quot; alt=&quot;...&quot; width=&quot;&quot; height=&quot;&quot;&gt;</code> — embeds an image</li>
<li><code>&lt;link rel=&quot;stylesheet&quot; href=&quot;styles.css&quot;&gt;</code> — links external CSS</li>
</ul>
<h3>Semantic Tags (know the layout structure!)</h3>
<p><code>&lt;header&gt;</code> → <code>&lt;nav&gt;</code> → <code>&lt;section&gt;</code>/<code>&lt;article&gt;</code> → <code>&lt;aside&gt;</code> → <code>&lt;footer&gt;</code></p>
<table>
<thead>
<tr>
  <th>Tag</th>
  <th>Purpose</th>
</tr>
</thead>
<tbody>
<tr>
  <td><code>&lt;header&gt;</code></td>
  <td>Top section — title/logo</td>
</tr>
<tr>
  <td><code>&lt;nav&gt;</code></td>
  <td>Major navigation links/menu</td>
</tr>
<tr>
  <td><code>&lt;article&gt;</code></td>
  <td>Self-contained content (blog post, news story)</td>
</tr>
<tr>
  <td><code>&lt;section&gt;</code></td>
  <td>Groups related content around a theme</td>
</tr>
<tr>
  <td><code>&lt;aside&gt;</code></td>
  <td>Side content (e.g., sidebar)</td>
</tr>
<tr>
  <td><code>&lt;footer&gt;</code></td>
  <td>Bottom — copyright, contact info, links</td>
</tr>
</tbody>
</table>
<h3>Other Key Tags</h3>
<ul>
<li><strong>Anchor tag:</strong> <code>&lt;a href=&quot;#&quot; target=&quot;_blank&quot;&gt;Home&lt;/a&gt;</code> → creates a hyperlink</li>
<li><strong>Heading tags:</strong> <code>&lt;h1&gt;</code> (biggest/most important) down to <code>&lt;h6&gt;</code> (smallest)</li>
<li><strong>Paragraph tag:</strong> <code>&lt;p&gt;...&lt;/p&gt;</code> → block-level, adds spacing before/after</li>
</ul>
<hr />
</div></details><details class="revision-topic"><summary>6. System Development Life Cycle (SDLC) — 8 Stages</summary><div class="revision-topic-body">
<p><em>&quot;If you fail to plan, you are planning to fail.&quot; — Benjamin Franklin</em></p>
<p>The SDLC is the step-by-step process used to <strong>plan, build, and improve</strong> an IT system.</p>
<table>
<thead>
<tr>
  <th>#</th>
  <th>Stage</th>
  <th>What happens</th>
</tr>
</thead>
<tbody>
<tr>
  <td>1</td>
  <td><strong>Systems Analysis</strong></td>
  <td>Study the existing system, find problems/deficiencies</td>
</tr>
<tr>
  <td>2</td>
  <td><strong>Requirement Validation</strong></td>
  <td>Check requirements with users/stakeholders — must be correct, complete, clear, realistic</td>
</tr>
<tr>
  <td>3</td>
  <td><strong>Solution &amp; System Design</strong></td>
  <td>Plan structure: inputs, processing, database, outputs — creates a design blueprint</td>
</tr>
<tr>
  <td>4</td>
  <td><strong>Implementation</strong></td>
  <td>Programmers build the system, install hardware/software, migrate data, train users</td>
</tr>
<tr>
  <td>5</td>
  <td><strong>Testing</strong></td>
  <td>Check the system works correctly before release; find and fix bugs</td>
</tr>
<tr>
  <td>6</td>
  <td><strong>Evaluation</strong></td>
  <td>Compare finished system against original requirements — was it successful?</td>
</tr>
<tr>
  <td>7</td>
  <td><strong>Quality Refinement</strong></td>
  <td>Ongoing improvement of performance, security, usability, accessibility, maintainability</td>
</tr>
<tr>
  <td>8</td>
  <td><strong>Documentation</strong></td>
  <td>Written record of how the system works and how to use/maintain it</td>
</tr>
</tbody>
</table>
<blockquote>
<p><strong>Memory trick:</strong> <strong>A</strong>nalysis → <strong>R</strong>equirement Validation → <strong>D</strong>esign → <strong>I</strong>mplementation → <strong>T</strong>esting → <strong>E</strong>valuation → <strong>Q</strong>uality Refinement → <strong>D</strong>ocumentation → <em>(&quot;ARDITEQD&quot; — read it a few times and it'll stick!)</em></p>
</blockquote>
<hr />
</div></details><details class="revision-topic"><summary>Quick-Fire Facts for Last-Minute Recall</summary><div class="revision-topic-body">
<ul>
<li>WWW ≠ Internet (Web is a <em>service on</em> the Internet)</li>
<li>Web server software: Apache, Nginx, IIS</li>
<li>HTTP = Port 80 (insecure) | HTTPS = Port 443 (secure, padlock icon)</li>
<li>HTML file extension: <code>.html</code></li>
<li>4 tag categories: Container / Empty / Block vs Inline / Semantic vs Non-semantic</li>
<li><code>&lt;h1&gt;</code> = biggest heading, <code>&lt;h6&gt;</code> = smallest</li>
<li>SDLC has <strong>8 stages</strong>, starting with Systems Analysis and ending with Documentation</li>
<li>SSL = protects user data on websites; padlock = HTTPS active</li>
</ul>
<hr />
<h3>Likely Exam-Style Questions to Self-Check</h3>
<ol>
<li>Define WWW and explain how it differs from the Internet.</li>
<li>Explain the difference between HTTP and HTTPS (give 2 differences).</li>
<li>List and briefly explain 3 elements that make a website user-friendly.</li>
<li>Name the tag used to insert an image, and write its syntax.</li>
<li>List all 8 stages of the SDLC in the correct order.</li>
<li>What is the difference between a container tag and an empty tag? Give one example of each.</li>
</ol>
<hr />
</div></details></div><div class="callout"><strong>Ready to test yourself?</strong> Mark the Course Summary complete to unlock the Overall Assessment.</div>
    </div>`;
  } else if (moduleId === 8) {
    html = lessonHeader(8, 'Overall Assessment', 'Check your understanding across the full course.') + '<div id="overall-assessment"></div></div>';
  } else {
    html = CONTENT[moduleId]?.[sectionId]?.() || lessonHeader(moduleId, 'Learning Page') + '<p>Section not found.</p></div>';
  }
  contentHost.innerHTML = html;

  if (isBrowserDetail) {
    const markReadingButton = contentHost.querySelector('[data-browser-mark]');
    const returnToMenuLink = contentHost.querySelector('[data-browser-return]');

    if (markReadingButton) {
      markReadingButton.addEventListener('click', () => {
        markDone(3, sectionId);
        renderModule();
      });
    }

    if (returnToMenuLink) {
      returnToMenuLink.addEventListener('click', event => {
        if (!isDone(3, sectionId)) {
          event.preventDefault();
          alert('First click “Mark this reading complete”. Then return to the four sections and choose the next topic.');
        }
      });
    }
  }

  const completeButton = document.getElementById('complete-section');
  if (completeButton) {
    const buttonState = completeButtonState(moduleId, sectionId);
    completeButton.disabled = buttonState.disabled;
    completeButton.textContent = buttonState.label;
    completeButton.title = buttonState.disabled ? buttonState.label : 'Mark this section complete to unlock Next.';
    completeButton.onclick = () => {
      if (isAssessmentSection(moduleId, sectionId)) {
        alert('Complete and pass this assessment to mark it complete.');
        return;
      }
      if (isVideoSection(moduleId, sectionId)) {
        alert('Play the video through to the end to complete this section.');
        return;
      }
      if (moduleId === 5 && sectionId === 'stepbystep' && !htmlCodingLabIsComplete()) {
        alert('Complete all four coding challenges and pass the Quick Check first.');
        return;
      }
      if (moduleId === 7 && !allModulesComplete()) {
        alert('Complete Modules 1–6 first.');
        return;
      }
      if (moduleId === 8 && !isDone(7, 'summary')) {
        alert('Complete the Course Summary first.');
        return;
      }
      markDone(moduleId, sectionId);
      renderModule();
    };
  }

  const badgeArea = document.getElementById('badge-area');
  // Badge congratulations are shown as a pop-up at the moment they are earned.
  if (badgeArea) badgeArea.innerHTML = '';

  if (nextLink) nextLink.style.display = isBrowserMenu ? 'none' : '';
  if (isBrowserMenu) {
    const tiles = contentHost.querySelectorAll('[data-browser-section]');
    tiles.forEach(tile => tile.addEventListener('click', event => {
      if (tile.dataset.locked === 'true') {
        event.preventDefault();
        alert('This section is locked. Complete and mark the previous section first.');
      }
    }));
  }

  if (moduleId === 1 && sectionId === 'dragdrop') initDragAssessment();
  if (moduleId >= 2 && moduleId <= 6 && sectionId === 'assessment') initMCQ(moduleId);
  if (isVideoSection(moduleId, sectionId)) initVideo(moduleId, sectionId);
  if (moduleId === 5 && sectionId === 'firstsite') initHTMLPreview();
  if (moduleId === 5 && sectionId === 'stepbystep') initHTMLCodingLab();
  if (moduleId === 8) initOverallAssessment();

  refreshModuleIndicators();
}
function init() {
  const page = document.body.dataset.page;
  // Redirect unauthenticated visitors before protected content is rendered.
  if (['course', 'module', 'teacher'].includes(page) && !getUser()) {
    location.replace('login.html');
    return;
  }
  if (page === 'teacher' && getUser()?.role !== 'teacher') {
    location.replace('course.html');
    return;
  }
  initShell();
  if (page === 'home') initHome();
  if (page === 'login') initLogin();
  if (page === 'signup') initSignup();
  if (page === 'course') initCourse();
  if (page === 'module') renderModule();
  if (page === 'resources') initResources();
  if (page === 'feedback') initFeedback();
  if (page === 'teacher') initTeacherDashboard();
}

document.addEventListener('DOMContentLoaded', init);
