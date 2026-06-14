let notificationItems = JSON.parse(localStorage.getItem('mth_notifications') || '[]');
let notificationPollTimer = null;

function getUnreadCount() {
  return notificationItems.filter((n) => !n.read).length;
}

function saveNotifications() {
  localStorage.setItem('mth_notifications', JSON.stringify(notificationItems.slice(0, 50)));
}

function updateNotificationBadge() {
  const badge = document.getElementById('notificationBadge');
  if (!badge) return;
  const count = getUnreadCount();
  badge.textContent = count > 9 ? '9+' : String(count);
  badge.hidden = count === 0;
}

function renderNotificationList() {
  const list = document.getElementById('notificationList');
  if (!list) return;

  if (!notificationItems.length) {
    list.innerHTML = '<div class="notification-empty">No notifications yet</div>';
    return;
  }

  list.innerHTML = notificationItems
    .map(
      (n) => `
    <button class="notification-item ${n.read ? '' : 'unread'}" onclick="openNotification('${n.id}')">
      <div class="notification-item-title">${escapeHtml(n.name)}</div>
      <div class="notification-item-meta">${escapeHtml(n.course || 'Registration')} · ${formatDate(n.createdAt)}</div>
      <div class="notification-item-text">New course registration submitted</div>
    </button>`
    )
    .join('');
}

function showNotificationToast(name, course) {
  const toast = document.getElementById('notificationToast');
  if (!toast) return;

  toast.innerHTML = `
    <div class="toast-icon"><i data-lucide="bell-ring" class="lucide-icon"></i></div>
    <div>
      <strong>New Registration</strong>
      <p>${escapeHtml(name)} registered for ${escapeHtml(course || 'a course')}</p>
    </div>`;
  toast.classList.add('show');
  refreshIcons(toast);

  setTimeout(() => toast.classList.remove('show'), 5000);
}

function addNotifications(registrations) {
  let added = false;

  registrations.forEach((r) => {
    if (notificationItems.some((n) => n.id === r.id)) return;

    notificationItems.unshift({
      id: r.id,
      name: r.name,
      email: r.email,
      course: r.course,
      createdAt: r.createdAt,
      read: false,
    });
    added = true;
    showNotificationToast(r.name, r.course);
  });

  if (added) {
    saveNotifications();
    updateNotificationBadge();
    renderNotificationList();
  }
}

window.toggleNotificationPanel = function () {
  const panel = document.getElementById('notificationDropdown');
  if (!panel) return;

  const isOpen = panel.classList.toggle('open');
  if (isOpen) {
    notificationItems = notificationItems.map((n) => ({ ...n, read: true }));
    saveNotifications();
    updateNotificationBadge();
    renderNotificationList();
  }
};

window.openNotification = function (id) {
  const panel = document.getElementById('notificationDropdown');
  if (panel) panel.classList.remove('open');

  notificationItems = notificationItems.map((n) => (n.id === id ? { ...n, read: true } : n));
  saveNotifications();
  updateNotificationBadge();

  if (typeof switchView === 'function') {
    switchView('registrations');
    setTimeout(() => {
      if (typeof viewEntry === 'function') viewEntry('registration', id);
    }, 600);
  }
};

window.markAllNotificationsRead = function () {
  notificationItems = notificationItems.map((n) => ({ ...n, read: true }));
  saveNotifications();
  updateNotificationBadge();
  renderNotificationList();
};

async function pollNotifications() {
  const since = localStorage.getItem('mth_last_check');
  if (!since) return;

  try {
    const res = await fetch(`/api/admin/notifications?since=${encodeURIComponent(since)}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('mth_token')}` },
    });

    if (res.status === 401) {
      localStorage.removeItem('mth_token');
      window.location.href = '/login';
      return;
    }

    const data = await res.json();
    if (data?.success && data.data?.length) {
      addNotifications(data.data);
    }

    localStorage.setItem('mth_last_check', data.checkedAt || new Date().toISOString());
  } catch {
    // silent fail on poll
  }
}

function initNotifications() {
  if (!localStorage.getItem('mth_last_check')) {
    localStorage.setItem('mth_last_check', new Date().toISOString());
  }

  updateNotificationBadge();
  renderNotificationList();

  if (notificationPollTimer) clearInterval(notificationPollTimer);
  notificationPollTimer = setInterval(pollNotifications, 15000);
  pollNotifications();
}

function stopNotifications() {
  if (notificationPollTimer) {
    clearInterval(notificationPollTimer);
    notificationPollTimer = null;
  }
}

window.pollNotifications = pollNotifications;
