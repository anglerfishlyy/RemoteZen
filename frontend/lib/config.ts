// Timer configuration constants
export const TIMER_CONFIG = {
  FOCUS_DURATION: 25 * 60, // 25 minutes in seconds
  BREAK_DURATION: 5 * 60,  // 5 minutes in seconds
  LONG_BREAK_DURATION: 15 * 60, // 15 minutes in seconds
  SESSIONS_BEFORE_LONG_BREAK: 4,
  BREAK_REMINDER_DELAY: 5 * 60 * 1000, // 5 minutes in milliseconds
} as const;

// Productivity targets
export const PRODUCTIVITY_CONFIG = {
  DAILY_FOCUS_TARGET: 4 * 60 * 60, // 4 hours in seconds
  WEEKLY_FOCUS_TARGET: 40 * 60 * 60, // 40 hours in seconds
  TASKS_PER_DAY_TARGET: 8,
} as const;

// UI configuration
export const UI_CONFIG = {
  POLLING_INTERVAL: 5000, // 5 seconds
  SIDEBAR_ANIMATION_DURATION: 300, // milliseconds
  NOTIFICATION_MAX_HISTORY: 100,
} as const;
