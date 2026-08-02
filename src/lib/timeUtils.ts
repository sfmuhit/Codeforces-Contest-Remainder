export function formatTimeRemaining(secondsRemaining: number): {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  formatted: string;
} {
  if (secondsRemaining <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, formatted: '00m 00s' };
  }

  const days = Math.floor(secondsRemaining / (3600 * 24));
  const hours = Math.floor((secondsRemaining % (3600 * 24)) / 3600);
  const minutes = Math.floor((secondsRemaining % 3600) / 60);
  const seconds = Math.floor(secondsRemaining % 60);

  const parts: string[] = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0 || days > 0) parts.push(`${hours.toString().padStart(2, '0')}h`);
  parts.push(`${minutes.toString().padStart(2, '0')}m`);
  parts.push(`${seconds.toString().padStart(2, '0')}s`);

  return {
    days,
    hours,
    minutes,
    seconds,
    formatted: parts.join(' '),
  };
}

export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);

  if (hours > 0 && mins > 0) {
    return `${hours} hrs ${mins} mins`;
  } else if (hours > 0) {
    return `${hours} hrs`;
  }
  return `${mins} mins`;
}

export function formatEpochToDateTime(epochSeconds: number, timezone: string = 'local'): {
  dateStr: string;
  timeStr: string;
  fullStr: string;
  relativeDay: string;
} {
  const date = new Date(epochSeconds * 1000);
  const timeZoneOptions: Intl.DateTimeFormatOptions = {
    timeZone: timezone === 'local' ? undefined : timezone,
  };

  const fullFormatter = new Intl.DateTimeFormat('en-US', {
    ...timeZoneOptions,
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });

  const dateFormatter = new Intl.DateTimeFormat('en-US', {
    ...timeZoneOptions,
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  const timeFormatter = new Intl.DateTimeFormat('en-US', {
    ...timeZoneOptions,
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });

  // Calculate if today, tomorrow, or later
  const now = new Date();
  const todayStr = new Intl.DateTimeFormat('en-US', { ...timeZoneOptions, month: 'numeric', day: 'numeric', year: 'numeric' }).format(now);
  const contestDateStr = new Intl.DateTimeFormat('en-US', { ...timeZoneOptions, month: 'numeric', day: 'numeric', year: 'numeric' }).format(date);

  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowDateStr = new Intl.DateTimeFormat('en-US', { ...timeZoneOptions, month: 'numeric', day: 'numeric', year: 'numeric' }).format(tomorrow);

  let relativeDay = '';
  if (todayStr === contestDateStr) {
    relativeDay = 'TODAY';
  } else if (tomorrowDateStr === contestDateStr) {
    relativeDay = 'TOMORROW';
  }

  return {
    dateStr: dateFormatter.format(date),
    timeStr: timeFormatter.format(date),
    fullStr: fullFormatter.format(date),
    relativeDay,
  };
}

export function getUserLocalTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
  } catch {
    return 'UTC';
  }
}

export const COMMON_TIMEZONES = [
  { value: 'local', label: `Device Timezone (${getUserLocalTimezone()})` },
  { value: 'Asia/Kolkata', label: 'Asia/Kolkata (IST +5:30)' },
  { value: 'Asia/Dhaka', label: 'Asia/Dhaka (BST +6:00)' },
  { value: 'Europe/Moscow', label: 'Europe/Moscow (MSK +3:00)' },
  { value: 'UTC', label: 'UTC (GMT +0:00)' },
  { value: 'America/New_York', label: 'America/New_York (EDT/EST -4/-5)' },
  { value: 'America/Los_Angeles', label: 'America/Los_Angeles (PDT/PST -7/-8)' },
  { value: 'Europe/London', label: 'Europe/London (BST/GMT +1/+0)' },
  { value: 'Asia/Tokyo', label: 'Asia/Tokyo (JST +9:00)' },
  { value: 'Asia/Shanghai', label: 'Asia/Shanghai (CST +8:00)' },
];
