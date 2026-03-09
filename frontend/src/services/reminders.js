const STORAGE_KEY = 'remmy_checkin_reminder_at';
const REMINDER_TITLE = 'Remmy check-in reminder';
const REMINDER_BODY = 'Protect your streak. Open Remmy and finish your next check-in.';
const REMINDER_TAG = 'remmy-checkin-reminder';
const REMINDER_ICON = '/icons/icon-192.png';
const REMINDER_BADGE = '/icons/icon-96.png';

let reminderTimerId = null;

const supportsNotifications = () =>
  typeof window !== 'undefined' && 'Notification' in window;

const safeGetStoredReminder = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const date = new Date(raw);
    if (Number.isNaN(date.getTime())) {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
    return date;
  } catch {
    return null;
  }
};

const safeStoreReminder = (date) => {
  try {
    localStorage.setItem(STORAGE_KEY, date.toISOString());
  } catch {
    // ignore storage issues
  }
};

const showReminderNotification = (body = REMINDER_BODY) => {
  if (!supportsNotifications() || Notification.permission !== 'granted') {
    return false;
  }

  try {
    new Notification(REMINDER_TITLE, {
      body,
      icon: REMINDER_ICON,
      badge: REMINDER_BADGE,
      tag: REMINDER_TAG,
      renotify: true,
    });
    return true;
  } catch {
    return false;
  }
};

const clearExistingTimer = () => {
  if (reminderTimerId) {
    clearTimeout(reminderTimerId);
    reminderTimerId = null;
  }
};

const scheduleInSessionReminder = (date) => {
  clearExistingTimer();

  const delayMs = date.getTime() - Date.now();
  if (delayMs <= 0) {
    return;
  }

  const MAX_TIMEOUT_MS = 2147483647;
  if (delayMs > MAX_TIMEOUT_MS) {
    reminderTimerId = setTimeout(() => {
      scheduleInSessionReminder(date);
    }, MAX_TIMEOUT_MS);
    return;
  }

  reminderTimerId = setTimeout(() => {
    const shown = showReminderNotification();
    if (shown) {
      clearCheckinReminder();
    }
  }, delayMs);
};

const getDefaultReminderDate = () => {
  const date = new Date();
  date.setDate(date.getDate() + 1);
  date.setHours(9, 0, 0, 0);
  return date;
};

export const getNotificationPermissionState = () => {
  if (!supportsNotifications()) return 'unsupported';
  return Notification.permission;
};

export const requestReminderPermission = async () => {
  if (!supportsNotifications()) {
    return { ok: false, message: 'Browser notifications are not supported on this device.' };
  }

  if (Notification.permission === 'granted') {
    return { ok: true, permission: 'granted' };
  }

  if (Notification.permission === 'denied') {
    return {
      ok: false,
      message: 'Notifications are blocked. Enable them in browser settings to receive reminders.',
    };
  }

  const permission = await Notification.requestPermission();
  if (permission !== 'granted') {
    return {
      ok: false,
      message: 'Reminder not enabled. Please allow notifications to get check-in nudges.',
    };
  }

  return { ok: true, permission };
};

export const enableCheckinReminder = (targetDate) => {
  if (!supportsNotifications()) {
    return { ok: false, message: 'Browser notifications are not supported on this device.' };
  }

  if (Notification.permission !== 'granted') {
    return { ok: false, message: 'Notification permission is required first.' };
  }

  const date = targetDate ? new Date(targetDate) : getDefaultReminderDate();
  if (Number.isNaN(date.getTime())) {
    return { ok: false, message: 'Invalid reminder date.' };
  }

  safeStoreReminder(date);
  scheduleInSessionReminder(date);

  return { ok: true, scheduledAt: date };
};

export const clearCheckinReminder = () => {
  clearExistingTimer();
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore storage issues
  }
};

export const initializeReminderScheduler = () => {
  const stored = safeGetStoredReminder();
  if (stored) {
    scheduleInSessionReminder(stored);
  }
};

export const maybeFireDueReminder = () => {
  const stored = safeGetStoredReminder();
  if (!stored) return false;

  if (stored.getTime() > Date.now()) {
    scheduleInSessionReminder(stored);
    return false;
  }

  const shown = showReminderNotification();
  clearCheckinReminder();
  return shown;
};


