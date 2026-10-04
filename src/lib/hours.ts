export const weekdays = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'] as const;
export type Weekday = (typeof weekdays)[number];

export interface ScheduleSlot {
  days: readonly Weekday[];
  open: string;
  close: string;
}

export type OfficeStatus =
  | { open: true; closes: string }
  | { open: false; opens: { day: Weekday; time: string; today: boolean } };

const manilaClock = new Intl.DateTimeFormat('en-US', {
  timeZone: 'Asia/Manila',
  weekday: 'short',
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
});

function manilaNow(now: Date): { day: Weekday; time: string } {
  const parts = Object.fromEntries(manilaClock.formatToParts(now).map((p) => [p.type, p.value]));
  return {
    day: String(parts.weekday).toLowerCase().slice(0, 3) as Weekday,
    time: `${parts.hour}:${parts.minute}`,
  };
}

/** Whether the office is open at `now` (Manila time), and when it opens next if not. */
export function officeStatus(schedule: readonly ScheduleSlot[], now: Date): OfficeStatus | null {
  if (schedule.length === 0) return null;
  const { day, time } = manilaNow(now);

  const current = schedule.find((s) => s.days.includes(day) && s.open <= time && time < s.close);
  if (current) return { open: true, closes: current.close };

  const start = weekdays.indexOf(day);
  for (let offset = 0; offset < 7; offset++) {
    const next = weekdays[(start + offset) % 7]!;
    const opening = schedule
      .filter((s) => s.days.includes(next) && (offset > 0 || s.open > time))
      .map((s) => s.open)
      .sort()[0];
    if (opening) return { open: false, opens: { day: next, time: opening, today: offset === 0 } };
  }
  return null;
}

/** "17:00" → "5:00 PM". */
export function formatClock(time: string): string {
  const [hours = 0, minutes = 0] = time.split(':').map(Number);
  const suffix = hours < 12 ? 'AM' : 'PM';
  return `${hours % 12 || 12}:${String(minutes).padStart(2, '0')} ${suffix}`;
}
