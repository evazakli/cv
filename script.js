/**
 * EMRE VAHİT AZAKLI — "KARADENİZ ESİNTİSİ"
 * Data-Driven Kişisel Portföy Motoru (Vanilla JavaScript)
 */

document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initMobileMenu();
  loadDataAndRender();
});

/* --------------------------------------------------------------------------
   1. TEMA YÖNETİMİ (AÇIK / KOYU MOD & LOCALSTORAGE & SYSTEM SCHEME)
   -------------------------------------------------------------------------- */
function initTheme() {
  const themeToggleBtn = document.getElementById('themeToggleBtn');
  const storedTheme = localStorage.getItem('theme');
  const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  
  const currentTheme = storedTheme || (prefersDark ? 'dark' : 'light');
  applyTheme(currentTheme);

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
      const activeTheme = document.body.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      applyTheme(activeTheme);
      localStorage.setItem('theme', activeTheme);
    });
  }

  // Sistem teması değiştiğinde ve kullanıcı manuel seçim yapmamışsa uyarla
  if (window.matchMedia) {
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      if (!localStorage.getItem('theme')) {
        applyTheme(e.matches ? 'dark' : 'light');
      }
    });
  }
}

function applyTheme(theme) {
  document.body.setAttribute('data-theme', theme);
}

/* --------------------------------------------------------------------------
   2. MOBİL MENÜ YÖNETİMİ
   -------------------------------------------------------------------------- */
function initMobileMenu() {
  const mobileBtn = document.getElementById('mobileMenuBtn');
  const mobileDrawer = document.getElementById('mobileNavDrawer');
  const mobileLinks = document.querySelectorAll('.mobile-nav-link');

  if (!mobileBtn || !mobileDrawer) return;

  mobileBtn.addEventListener('click', () => {
    const isExpanded = mobileBtn.getAttribute('aria-expanded') === 'true';
    mobileBtn.setAttribute('aria-expanded', !isExpanded);
    mobileDrawer.classList.toggle('open');
  });

  mobileLinks.forEach(link => {
    link.addEventListener('click', () => {
      mobileBtn.setAttribute('aria-expanded', 'false');
      mobileDrawer.classList.remove('open');
    });
  });

  // Sayfa dışına tıklandığında menüyü kapat
  document.addEventListener('click', (e) => {
    if (!mobileDrawer.contains(e.target) && !mobileBtn.contains(e.target) && mobileDrawer.classList.contains('open')) {
      mobileBtn.setAttribute('aria-expanded', 'false');
      mobileDrawer.classList.remove('open');
    }
  });
}

/* --------------------------------------------------------------------------
   3. DATA.JSON FETCH & DİNAMİK DOM RENDER
   -------------------------------------------------------------------------- */
async function loadDataAndRender() {
  try {
    const response = await fetch('./data.json', {
      headers: {
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`data.json yüklenemedi: HTTP ${response.status}`);
    }

    const data = await response.json();
    
    // Verileri ilgili bölümlere bas
    renderProfile(data.profile);
    renderExperience(data.experience);
    renderEducation(data.education);
    renderProjects(data.projects);
    renderCourses(data.courses);
    renderSkills(data.skills);
    renderLanguages(data.languages);
    renderExams(data.exams);
    renderContact(data.profile);

    // Render tamamlandıktan sonra scroll observer & animasyonları başlat
    initScrollObservers();

  } catch (error) {
    console.error('Veri yükleme hatası:', error);
    showDataErrorNotice();
  }
}

/* --------------------------------------------------------------------------
   4. BÖLÜM RENDER FONKSİYONLARI (XSS GÜVENLİ & TEMİZ ŞABLONLAR)
   -------------------------------------------------------------------------- */

// HTML Kaçış Yardımcısı
function escapeHTML(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function renderProfile(profile) {
  if (!profile) return;

  const heroName = document.getElementById('heroName');
  const heroTitle = document.getElementById('heroTitle');
  const heroBrief = document.getElementById('heroBrief');
  const aboutSummary = document.getElementById('aboutSummary');
  const heroGithubBtn = document.getElementById('heroGithubBtn');

  if (heroName) heroName.textContent = profile.name;
  if (heroTitle) heroTitle.textContent = profile.title;
  if (heroBrief) heroBrief.textContent = profile.summary;
  if (aboutSummary) aboutSummary.textContent = profile.summary;

  if (heroGithubBtn && profile.github) {
    heroGithubBtn.href = profile.github;
  }
}

function renderExperience(experienceList) {
  const container = document.getElementById('experienceContainer');
  if (!container || !experienceList) return;

  container.innerHTML = experienceList.map(item => `
    <article class="tech-card reveal-on-scroll">
      <div class="card-top-meta">
        <time class="card-period">${escapeHTML(item.period)}</time>
      </div>
      <h3 class="card-title">${escapeHTML(item.role)}</h3>
      <h4 class="card-subtitle">${escapeHTML(item.company)}</h4>
      <p class="card-description">${escapeHTML(item.description)}</p>
    </article>
  `).join('');
}

function renderEducation(educationList) {
  const container = document.getElementById('educationContainer');
  if (!container || !educationList) return;

  container.innerHTML = educationList.map(item => {
    const detailsHtml = (item.details && item.details.length > 0)
      ? `<ul class="card-details-list">
          ${item.details.map(d => `
            <li class="card-detail-item">
              <span class="detail-marker">›</span>
              <span>${escapeHTML(d)}</span>
            </li>
          `).join('')}
        </ul>`
      : '';

    return `
      <article class="tech-card reveal-on-scroll">
        <div class="card-top-meta">
          <time class="card-period">${escapeHTML(item.period)}</time>
        </div>
        <h3 class="card-title">${escapeHTML(item.school)}</h3>
        <h4 class="card-subtitle">${escapeHTML(item.degree)}</h4>
        ${detailsHtml}
      </article>
    `;
  }).join('');
}

function renderProjects(projectsList) {
  const container = document.getElementById('projectsContainer');
  if (!container || !projectsList) return;

  container.innerHTML = projectsList.map(item => {
    const outcomesHtml = (item.outcomes && item.outcomes.length > 0)
      ? `<ul class="card-details-list">
          ${item.outcomes.map(o => `
            <li class="card-detail-item">
              <span class="detail-marker">✓</span>
              <span>${escapeHTML(o)}</span>
            </li>
          `).join('')}
        </ul>`
      : '';

    return `
      <article class="tech-card reveal-on-scroll">
        <div class="card-top-meta">
          <time class="card-period">${escapeHTML(item.period)}</time>
        </div>
        <h3 class="card-title">${escapeHTML(item.name)}</h3>
        <p class="card-description">${escapeHTML(item.description)}</p>
        ${outcomesHtml}
      </article>
    `;
  }).join('');
}

function renderCourses(coursesList) {
  const container = document.getElementById('coursesContainer');
  if (!container || !coursesList) return;

  container.innerHTML = coursesList.map(item => {
    const detailsHtml = (item.details && item.details.length > 0)
      ? `<ul class="card-details-list">
          ${item.details.map(d => `
            <li class="card-detail-item">
              <span class="detail-marker">›</span>
              <span>${escapeHTML(d)}</span>
            </li>
          `).join('')}
        </ul>`
      : '';

    return `
      <article class="tech-card reveal-on-scroll">
        <div class="card-top-meta">
          <time class="card-period">${escapeHTML(item.period)}</time>
        </div>
        <h3 class="card-title">${escapeHTML(item.name)}</h3>
        <h4 class="card-subtitle">${escapeHTML(item.institution)}</h4>
        ${detailsHtml}
      </article>
    `;
  }).join('');
}

function renderSkills(skillsList) {
  const container = document.getElementById('skillsContainer');
  if (!container || !skillsList) return;

  container.innerHTML = skillsList.map(skill => `
    <span class="skill-pill">${escapeHTML(skill)}</span>
  `).join('');
}

function renderLanguages(languagesList) {
  const container = document.getElementById('languagesContainer');
  if (!container || !languagesList) return;

  container.innerHTML = languagesList.map(lang => `
    <div class="lang-item">
      <span class="lang-name">${escapeHTML(lang.name)}</span>
      <span class="lang-level">${escapeHTML(lang.level)}</span>
    </div>
  `).join('');
}

function renderExams(examsList) {
  const container = document.getElementById('examsContainer');
  if (!container || !examsList) return;

  container.innerHTML = examsList.map(exam => `
    <div class="exam-card reveal-on-scroll">
      <div class="exam-meta">
        <span class="exam-name">${escapeHTML(exam.name)}</span>
      </div>
      <div class="exam-score-box">
        <span class="score-num">${escapeHTML(exam.score)}</span>
        <span class="score-unit">PUAN</span>
      </div>
    </div>
  `).join('');
}

function renderContact(profile) {
  const container = document.getElementById('contactContainer');
  if (!container || !profile) return;

  container.innerHTML = `
    <a href="mailto:${escapeHTML(profile.email)}" class="contact-item">
      <span class="contact-label">E-POSTA</span>
      <span class="contact-value">${escapeHTML(profile.email)}</span>
      <span class="contact-action-hint">Doğrudan mesaj gönder ›</span>
    </a>

    <a href="tel:${escapeHTML(profile.phone)}" class="contact-item">
      <span class="contact-label">TELEFON</span>
      <span class="contact-value">${escapeHTML(profile.phone)}</span>
      <span class="contact-action-hint">Arama başlat ›</span>
    </a>

    <a href="${escapeHTML(profile.github)}" target="_blank" rel="noopener noreferrer" class="contact-item">
      <span class="contact-label">GITHUB</span>
      <span class="contact-value">github.com/evazakli</span>
      <span class="contact-action-hint">Depoları ve projeleri incele ›</span>
    </a>
  `;
}

function showDataErrorNotice() {
  const main = document.getElementById('mainContent');
  if (!main) return;
  
  const notice = document.createElement('div');
  notice.style.cssText = `
    margin: 2rem auto;
    max-width: 600px;
    padding: 1.5rem;
    background: #ffebe8;
    color: #c53030;
    border: 1px solid #feb2b2;
    border-radius: 6px;
    font-family: sans-serif;
    font-size: 0.9rem;
    text-align: center;
  `;
  notice.innerHTML = `
    <strong>⚠️ Veri Yüklenemedi:</strong> <code>data.json</code> dosyası yerel tarayıcı güvenlik kısıtlaması (CORS) nedeniyle doğrudan açılamamış olabilir.
    <br><br>
    Lütfen yerel test için terminalde <code>python -m http.server</code> komutunu çalıştırıp <code>http://localhost:8000</code> adresinden açınız.
  `;
  main.prepend(notice);
}

/* --------------------------------------------------------------------------
   5. SCROLL OBSERVER & AKTİF MENÜ İZLEYİCİSİ (SCROLL SPY)
   -------------------------------------------------------------------------- */
function initScrollObservers() {
  // 1. Kartların yumuşakça görünmesi (Reveal on Scroll)
  const revealElements = document.querySelectorAll('.reveal-on-scroll');
  
  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, {
      root: null,
      threshold: 0.1,
      rootMargin: '0px 0px -40px 0px'
    });

    revealElements.forEach(el => revealObserver.observe(el));
  } else {
    // Fallback: Eski tarayıcılarda direkt görünür yap
    revealElements.forEach(el => el.classList.add('is-visible'));
  }

  // 2. Aktif Navigasyon Bağlantısı (Scroll Spy)
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');

  if ('IntersectionObserver' in window && sections.length > 0) {
    const sectionObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const currentId = entry.target.getAttribute('id');
          navLinks.forEach(link => {
            if (link.getAttribute('href') === `#${currentId}`) {
              link.classList.add('active');
            } else {
              link.classList.remove('active');
            }
          });
        }
      });
    }, {
      root: null,
      threshold: 0.25,
      rootMargin: '-70px 0px -40% 0px'
    });

    sections.forEach(sec => sectionObserver.observe(sec));
  }
}
