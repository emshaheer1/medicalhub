const token = localStorage.getItem('mth_token');
if (!token) window.location.href = '/login';

const admin = JSON.parse(localStorage.getItem('mth_admin') || '{}');
document.querySelector('#adminName span').textContent = admin.name || admin.email || 'Admin';

function icon(name, className = '') {
  return `<i data-lucide="${name}" class="lucide-icon ${className}"></i>`;
}

function refreshIcons(root = document) {
  if (window.lucide) lucide.createIcons({ attrs: { class: 'lucide-icon' }, nameAttr: 'data-lucide', root });
}

refreshIcons();

const mainContent = document.getElementById('mainContent');
const detailModal = document.getElementById('detailModal');
let currentView = 'overview';
let currentPage = 1;
let currentSearch = '';
let currentCourse = '';
let selectedEntryId = null;
let selectedEntryType = null;
let currentModalEntry = null;

function renderHeaderActions() {
  return `
    <div class="page-actions">
      <button class="btn btn-outline btn-sm btn-icon" onclick="refreshCurrentView()" id="refreshBtn">
        ${icon('refresh-cw')} Refresh
      </button>
    </div>`;
}

window.refreshCurrentView = async function () {
  const btn = document.getElementById('refreshBtn');
  if (btn) {
    btn.disabled = true;
    btn.innerHTML = `${icon('loader-2', 'spin')} Refreshing...`;
    refreshIcons(btn);
  }

  if (currentView === 'overview') await renderOverview();
  else if (currentView === 'registrations') await renderRegistrations();
  else if (currentView === 'agreements') await renderAgreements();

  if (typeof pollNotifications === 'function') await pollNotifications();
};

window.downloadAllRegistrationsPdf = async function () {
  const btn = document.getElementById('downloadAllPdfBtn');
  if (btn) {
    btn.disabled = true;
    btn.innerHTML = `${icon('loader-2', 'spin')} Preparing PDF...`;
    refreshIcons(btn);
  }

  try {
    const data = await api('/api/registrations/export/all');
    if (!data?.success) {
      alert('Could not load registrations for export.');
      return;
    }
    generateAllRegistrationsPdf(data.data, REGISTRATION_SECTIONS, formatDate);
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = `${icon('download')} Download PDF`;
      refreshIcons(btn);
    }
  }
};

window.downloadEntryPdf = async function (type, id) {
  const endpoint = type === 'registration' ? `/api/registrations/${id}` : `/api/agreements/${id}`;
  const data = await api(endpoint);
  if (!data?.success) {
    alert('Could not load entry for PDF export.');
    return;
  }

  const sections = type === 'registration' ? REGISTRATION_SECTIONS : AGREEMENT_SECTIONS;
  generateEntryPdf(data.data, type, sections, formatDate);
};

function escapeHtml(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function formatFieldValue(key, value, formatDateFn) {
  if (value === null || value === undefined || value === '') {
    return '<span class="answer-empty">Not answered</span>';
  }
  if (key === 'createdAt' || key === 'updatedAt') {
    return escapeHtml(formatDateFn(value));
  }
  return escapeHtml(String(value));
}

function getKnownFieldKeys(sections) {
  return new Set(sections.flatMap((s) => s.fields.map((f) => f.key)));
}

function renderEntrySections(entry, sections, formatDateFn) {
  const knownKeys = getKnownFieldKeys(sections);
  const skipKeys = new Set(['_id', '__v']);

  const sectionsHtml = sections
    .map((section) => {
      const rows = section.fields
        .map(
          (field) => `
        <div class="qa-row">
          <div class="qa-question">${escapeHtml(field.label)}</div>
          <div class="qa-answer">${formatFieldValue(field.key, entry[field.key], formatDateFn)}</div>
        </div>`
        )
        .join('');

      return `
      <div class="answer-section">
        <div class="answer-section-header">
          ${icon(section.icon)}
          <h4>${escapeHtml(section.title)}</h4>
        </div>
        <div class="qa-list">${rows}</div>
      </div>`;
    })
    .join('');

  const extraFields = Object.entries(entry).filter(
    ([k, v]) => !knownKeys.has(k) && !skipKeys.has(k) && v !== null && v !== undefined && v !== ''
  );

  const extraHtml = extraFields.length
    ? `
    <div class="answer-section">
      <div class="answer-section-header">
        ${icon('list')}
        <h4>Additional Fields</h4>
      </div>
      <div class="qa-list">
        ${extraFields
          .map(
            ([k, v]) => `
          <div class="qa-row">
            <div class="qa-question">${escapeHtml(k.replace(/_/g, ' '))}</div>
            <div class="qa-answer">${formatFieldValue(k, v, formatDateFn)}</div>
          </div>`
          )
          .join('')}
      </div>
    </div>`
    : '';

  return `<div class="entry-answers">${sectionsHtml}${extraHtml}</div>`;
}

function renderRegistrationCard(entry) {
  const name = `${entry.first_name || ''} ${entry.last_name || ''}`.trim() || 'Unknown Student';
  return `
    <article class="entry-card" id="entry-${entry._id}">
      <div class="entry-card-header">
        <div class="entry-card-title">
          <h3>${escapeHtml(name)}</h3>
          <div class="entry-card-meta">
            ${courseBadge(entry.course_selected)}
            <span class="entry-date">${icon('clock')} ${formatDate(entry.createdAt)}</span>
          </div>
        </div>
        <div class="entry-card-actions">
          <button class="btn btn-outline btn-sm btn-icon" onclick="toggleEntryCard('${entry._id}')" id="toggle-${entry._id}">
            ${icon('chevron-up')} Collapse
          </button>
          <button class="btn btn-primary btn-sm btn-icon entry-pdf-btn" onclick="downloadEntryPdf('registration','${entry._id}')">
            ${icon('download')} PDF
          </button>
          <button class="btn btn-outline btn-sm btn-icon" onclick="viewEntry('registration','${entry._id}')">
            ${icon('maximize-2')} Full View
          </button>
          <button class="btn btn-danger btn-sm btn-icon" onclick="deleteEntry('registration','${entry._id}')">
            ${icon('trash-2')} Delete
          </button>
        </div>
      </div>
      <div class="entry-card-body" id="body-${entry._id}">
        ${renderEntrySections(entry, REGISTRATION_SECTIONS, formatDate)}
      </div>
    </article>`;
}

function renderAgreementCard(entry) {
  return `
    <article class="entry-card" id="entry-${entry._id}">
      <div class="entry-card-header">
        <div class="entry-card-title">
          <h3>${escapeHtml(entry.name || 'Unknown Student')}</h3>
          <div class="entry-card-meta">
            <span class="badge badge-cyan">Phlebotomy Agreement</span>
            <span class="entry-date">${icon('clock')} ${formatDate(entry.createdAt)}</span>
          </div>
        </div>
        <div class="entry-card-actions">
          <button class="btn btn-outline btn-sm btn-icon" onclick="toggleEntryCard('${entry._id}')" id="toggle-${entry._id}">
            ${icon('chevron-up')} Collapse
          </button>
          <button class="btn btn-primary btn-sm btn-icon entry-pdf-btn" onclick="downloadEntryPdf('agreement','${entry._id}')">
            ${icon('download')} PDF
          </button>
          <button class="btn btn-outline btn-sm btn-icon" onclick="viewEntry('agreement','${entry._id}')">
            ${icon('maximize-2')} Full View
          </button>
          <button class="btn btn-danger btn-sm btn-icon" onclick="deleteEntry('agreement','${entry._id}')">
            ${icon('trash-2')} Delete
          </button>
        </div>
      </div>
      <div class="entry-card-body" id="body-${entry._id}">
        ${renderEntrySections(entry, AGREEMENT_SECTIONS, formatDate)}
      </div>
    </article>`;
}

window.toggleEntryCard = (id) => {
  const body = document.getElementById(`body-${id}`);
  const btn = document.getElementById(`toggle-${id}`);
  if (!body || !btn) return;
  const collapsed = body.classList.toggle('collapsed');
  btn.innerHTML = collapsed
    ? `${icon('chevron-down')} Expand Answers`
    : `${icon('chevron-up')} Collapse`;
  refreshIcons(btn);
};

window.deleteEntry = async (type, id) => {
  if (!confirm('Are you sure you want to delete this entry?')) return;
  const endpoint =
    type === 'registration' ? `/api/registrations/${id}` : `/api/agreements/${id}`;
  const data = await api(endpoint, { method: 'DELETE' });
  if (data?.success) {
    if (currentView === 'registrations') renderRegistrations();
    else if (currentView === 'agreements') renderAgreements();
    else renderOverview();
  }
};

async function api(path, options = {}) {
  const res = await fetch(path, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  });

  if (res.status === 401) {
    localStorage.removeItem('mth_token');
    localStorage.removeItem('mth_admin');
    window.location.href = '/login';
    return;
  }

  return res.json();
}

function formatDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function courseBadge(course) {
  const colors = { Phlebotomy: 'badge-cyan', CNA: 'badge-green', CPR: 'badge-navy', EKG: 'badge-navy' };
  const cls = colors[course] || 'badge-cyan';
  return `<span class="badge ${cls}">${course || 'N/A'}</span>`;
}

// ── Overview ──

async function renderOverview() {
  mainContent.innerHTML = `<div class="loading-state">${icon('loader-2', 'spin')} Loading dashboard...</div>`;
  refreshIcons(mainContent);
  const data = await api('/api/admin/stats');

  if (!data?.success) {
    mainContent.innerHTML = '<p>Failed to load stats</p>';
    return;
  }

  const { stats } = data;
  const courseList = (stats.courseBreakdown || [])
    .map((c) => `<div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #eef1f6"><span>${c._id || 'Unknown'}</span><strong>${c.count}</strong></div>`)
    .join('');

  mainContent.innerHTML = `
    <div class="page-header">
      <div>
        <h2>Dashboard Overview</h2>
        <p>Welcome back, ${admin.name || 'Admin'}</p>
      </div>
      ${renderHeaderActions()}
    </div>
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-card-top">
          <div class="stat-icon cyan">${icon('users')}</div>
          <div class="stat-label">Total Registrations</div>
        </div>
        <div class="stat-value">${stats.totalRegistrations}</div>
      </div>
      <div class="stat-card green">
        <div class="stat-card-top">
          <div class="stat-icon green">${icon('file-check')}</div>
          <div class="stat-label">Phlebotomy Agreements</div>
        </div>
        <div class="stat-value">${stats.totalAgreements}</div>
      </div>
      <div class="stat-card navy">
        <div class="stat-card-top">
          <div class="stat-icon navy">${icon('calendar-days')}</div>
          <div class="stat-label">This Week</div>
        </div>
        <div class="stat-value">${stats.recentRegistrations}</div>
      </div>
    </div>
    <div class="data-table-wrapper panel-card">
      <div class="panel-header">
        ${icon('pie-chart')}
        <h3>Registrations by Course</h3>
      </div>
      <div class="panel-body">
        ${courseList || `<div class="empty-state">${icon('inbox', 'empty-icon')}<p>No registrations yet</p></div>`}
      </div>
    </div>
  `;
  refreshIcons(mainContent);
}

// ── Registrations Table ──

async function renderRegistrations() {
  mainContent.innerHTML = `<div class="loading-state">${icon('loader-2', 'spin')} Loading registrations...</div>`;
  refreshIcons(mainContent);

  const params = new URLSearchParams({ page: currentPage, limit: 5 });
  if (currentSearch) params.set('search', currentSearch);
  if (currentCourse) params.set('course', currentCourse);

  const data = await api(`/api/registrations?${params}`);
  if (!data?.success) {
    mainContent.innerHTML = '<p>Failed to load registrations</p>';
    return;
  }

  const { data: entries, pagination } = data;

  const cards = entries.length
    ? entries.map((e) => renderRegistrationCard(e)).join('')
    : `<div class="empty-state">${icon('inbox', 'empty-icon')}<p>No registrations found</p></div>`;

  mainContent.innerHTML = `
    <div class="page-header">
      <div>
        <h2>Course Registrations</h2>
        <p>Every form submission with all question answers</p>
      </div>
      <div class="page-header-right">
        ${pagination ? `<span class="entry-count">${icon('files')} ${pagination.total} total entries</span>` : ''}
        ${renderHeaderActions()}
      </div>
    </div>
    <div class="toolbar">
      <div class="search-wrap">
        ${icon('search')}
        <input class="search-input" type="search" placeholder="Search by name, email, or phone..." value="${currentSearch}" id="searchInput" />
      </div>
      <select class="filter-select" id="courseFilter">
        <option value="">All Courses</option>
        <option value="Phlebotomy" ${currentCourse === 'Phlebotomy' ? 'selected' : ''}>Phlebotomy</option>
        <option value="CNA" ${currentCourse === 'CNA' ? 'selected' : ''}>CNA</option>
        <option value="CPR" ${currentCourse === 'CPR' ? 'selected' : ''}>CPR</option>
        <option value="EKG" ${currentCourse === 'EKG' ? 'selected' : ''}>EKG</option>
      </select>
    </div>
    <div class="entry-cards-list">
      ${cards}
    </div>
    ${entries.length ? `<div class="data-table-wrapper">${renderPagination(pagination)}</div>` : ''}
  `;

  document.getElementById('searchInput').addEventListener(
    'input',
    debounce((e) => {
      currentSearch = e.target.value;
      currentPage = 1;
      renderRegistrations();
    }, 400)
  );

  document.getElementById('courseFilter').addEventListener('change', (e) => {
    currentCourse = e.target.value;
    currentPage = 1;
    renderRegistrations();
  });

  refreshIcons(mainContent);
}

// ── Agreements Table ──

async function renderAgreements() {
  mainContent.innerHTML = `<div class="loading-state">${icon('loader-2', 'spin')} Loading agreements...</div>`;
  refreshIcons(mainContent);

  const params = new URLSearchParams({ page: currentPage, limit: 5 });
  if (currentSearch) params.set('search', currentSearch);

  const data = await api(`/api/agreements?${params}`);
  if (!data?.success) {
    mainContent.innerHTML = '<p>Failed to load agreements</p>';
    return;
  }

  const { data: entries, pagination } = data;

  const cards = entries.length
    ? entries.map((e) => renderAgreementCard(e)).join('')
    : `<div class="empty-state">${icon('inbox', 'empty-icon')}<p>No agreements found</p></div>`;

  mainContent.innerHTML = `
    <div class="page-header">
      <div>
        <h2>Phlebotomy Agreements</h2>
        <p>Every agreement submission with all answers</p>
      </div>
      <div class="page-header-right">
        ${pagination ? `<span class="entry-count">${icon('files')} ${pagination.total} total entries</span>` : ''}
        ${renderHeaderActions()}
      </div>
    </div>
    <div class="toolbar">
      <div class="search-wrap">
        ${icon('search')}
        <input class="search-input" type="search" placeholder="Search by name, email, or city..." value="${currentSearch}" id="searchInput" />
      </div>
    </div>
    <div class="entry-cards-list">
      ${cards}
    </div>
    ${entries.length ? `<div class="data-table-wrapper">${renderPagination(pagination)}</div>` : ''}
  `;

  document.getElementById('searchInput').addEventListener(
    'input',
    debounce((e) => {
      currentSearch = e.target.value;
      currentPage = 1;
      renderAgreements();
    }, 400)
  );

  refreshIcons(mainContent);
}

function renderPagination(pagination) {
  if (!pagination || pagination.pages <= 1) return '';
  const { page, pages, total } = pagination;
  return `
    <div class="pagination">
      <button class="btn-icon" ${page <= 1 ? 'disabled' : ''} onclick="goToPage(${page - 1})">${icon('chevron-left')} Prev</button>
      <span class="page-info">Page ${page} of ${pages} (${total} total)</span>
      <button class="btn-icon" ${page >= pages ? 'disabled' : ''} onclick="goToPage(${page + 1})">Next ${icon('chevron-right')}</button>
    </div>
  `;
}

window.goToPage = (p) => {
  currentPage = p;
  if (currentView === 'registrations') renderRegistrations();
  else if (currentView === 'agreements') renderAgreements();
};

// ── Detail Modal ──

window.viewEntry = async (type, id) => {
  selectedEntryType = type;
  selectedEntryId = id;

  const endpoint = type === 'registration' ? `/api/registrations/${id}` : `/api/agreements/${id}`;
  const data = await api(endpoint);
  if (!data?.success) return;

  const entry = data.data;
  currentModalEntry = { entry, type };
  const sections = type === 'registration' ? REGISTRATION_SECTIONS : AGREEMENT_SECTIONS;
  document.getElementById('modalTitle').textContent =
    type === 'registration'
      ? `${entry.first_name || ''} ${entry.last_name || ''} — Full Registration`
      : `${entry.name || 'Agreement'} — Full Phlebotomy Agreement`;

  document.getElementById('modalBody').innerHTML = renderEntrySections(entry, sections, formatDate);
  detailModal.classList.add('open');
  refreshIcons(detailModal);
};

function closeModal() {
  detailModal.classList.remove('open');
  selectedEntryId = null;
  selectedEntryType = null;
  currentModalEntry = null;
}

document.getElementById('modalPdfBtn').addEventListener('click', () => {
  if (!currentModalEntry) return;
  const { entry, type } = currentModalEntry;
  const sections = type === 'registration' ? REGISTRATION_SECTIONS : AGREEMENT_SECTIONS;
  generateEntryPdf(entry, type, sections, formatDate);
});

document.getElementById('modalClose').addEventListener('click', closeModal);
document.getElementById('modalCloseBtn').addEventListener('click', closeModal);
detailModal.addEventListener('click', (e) => {
  if (e.target === detailModal) closeModal();
});

document.getElementById('modalDeleteBtn').addEventListener('click', async () => {
  if (!selectedEntryId || !confirm('Are you sure you want to delete this entry?')) return;

  const endpoint =
    selectedEntryType === 'registration'
      ? `/api/registrations/${selectedEntryId}`
      : `/api/agreements/${selectedEntryId}`;

  const data = await api(endpoint, { method: 'DELETE' });
  if (data?.success) {
    closeModal();
    if (currentView === 'registrations') renderRegistrations();
    else if (currentView === 'agreements') renderAgreements();
    else renderOverview();
  }
});

// ── Navigation ──

const TOP_BAR_TITLES = {
  overview: 'Dashboard Overview',
  registrations: 'Course Registrations',
  agreements: 'Phlebotomy Agreements',
};

function updateTopBarTitle(view) {
  const el = document.getElementById('topBarTitle');
  if (el) el.textContent = TOP_BAR_TITLES[view] || 'Dashboard';
}

function switchView(view) {
  currentView = view;
  currentPage = 1;
  currentSearch = '';
  currentCourse = '';

  document.querySelectorAll('.nav-item').forEach((el) => {
    el.classList.toggle('active', el.dataset.view === view);
  });

  updateTopBarTitle(view);

  if (view === 'overview') renderOverview();
  else if (view === 'registrations') renderRegistrations();
  else if (view === 'agreements') renderAgreements();

  document.getElementById('sidebar').classList.remove('open');
}

document.querySelectorAll('.nav-item').forEach((el) => {
  el.addEventListener('click', () => switchView(el.dataset.view));
});

document.getElementById('logoutBtn').addEventListener('click', () => {
  localStorage.removeItem('mth_token');
  localStorage.removeItem('mth_admin');
  window.location.href = '/login';
});

document.getElementById('sidebarToggle').addEventListener('click', () => {
  document.getElementById('sidebar').classList.toggle('open');
});

document.getElementById('downloadAllPdfBtn').addEventListener('click', downloadAllRegistrationsPdf);

document.getElementById('topRefreshBtn').addEventListener('click', refreshCurrentView);

document.addEventListener('click', (e) => {
  const wrap = document.querySelector('.notification-wrap');
  const panel = document.getElementById('notificationDropdown');
  if (wrap && panel && panel.classList.contains('open') && !wrap.contains(e.target)) {
    panel.classList.remove('open');
  }
});

function debounce(fn, ms) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  };
}

window.switchView = switchView;

switchView('overview');
initNotifications();
