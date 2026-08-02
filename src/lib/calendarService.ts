import { CodeforcesContest } from '../types';

/**
 * Format date to ISO string without hyphens/colons for Google Calendar & iCal
 * e.g., 20260801T153000Z
 */
function formatDateToICal(date: Date): string {
  return date.toISOString().replace(/-|:|\.\d+/g, '');
}

/**
 * Generates Google Calendar event URL
 */
export function getGoogleCalendarUrl(contest: CodeforcesContest): string {
  if (!contest.startTimeSeconds) return 'https://calendar.google.com';

  const startDate = new Date(contest.startTimeSeconds * 1000);
  const endDate = new Date((contest.startTimeSeconds + contest.durationSeconds) * 1000);

  const startStr = formatDateToICal(startDate);
  const endStr = formatDateToICal(endDate);

  const title = encodeURIComponent(`[Codeforces] ${contest.name}`);
  const details = encodeURIComponent(
    `Codeforces Contest: ${contest.name}\n\n` +
    `Duration: ${Math.round(contest.durationSeconds / 60)} minutes\n` +
    `Link: https://codeforces.com/contest/${contest.id}\n\n` +
    `Set up with Codeforces Contest Reminder`
  );
  const location = encodeURIComponent(`https://codeforces.com/contest/${contest.id}`);

  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startStr}/${endStr}&details=${details}&location=${location}`;
}

/**
 * Generates and downloads an .ics file for iCal / Apple Calendar / Outlook / Android
 */
export function downloadICalFile(contest: CodeforcesContest) {
  if (!contest.startTimeSeconds) return;

  const startDate = new Date(contest.startTimeSeconds * 1000);
  const endDate = new Date((contest.startTimeSeconds + contest.durationSeconds) * 1000);

  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Codeforces Contest Reminder//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:codeforces-contest-${contest.id}@codeforces.com`,
    `DTSTAMP:${formatDateToICal(new Date())}`,
    `DTSTART:${formatDateToICal(startDate)}`,
    `DTEND:${formatDateToICal(endDate)}`,
    `SUMMARY:Codeforces: ${contest.name}`,
    `DESCRIPTION:Codeforces Contest: ${contest.name}\\nLink: https://codeforces.com/contest/${contest.id}`,
    `URL:https://codeforces.com/contest/${contest.id}`,
    'BEGIN:VALARM',
    'TRIGGER:-PT20M', // 20 minute before alarm in calendar app!
    'ACTION:DISPLAY',
    `DESCRIPTION:Reminder: Codeforces Contest ${contest.name} starts in 20 minutes!`,
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\r\n');

  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `codeforces_contest_${contest.id}.ics`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
