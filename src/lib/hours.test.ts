import { describe, expect, test } from 'vitest';
import { formatClock, officeStatus, type Weekday } from './hours';

const weekdays: Weekday[] = ['mon', 'tue', 'wed', 'thu', 'fri'];
const schedule = [{ days: weekdays, open: '08:00', close: '17:00' }];

describe('officeStatus (Asia/Manila time)', () => {
  test('is unknown when the office has no structured schedule', () => {
    expect(officeStatus([], new Date('2026-10-05T02:00:00Z'))).toBeNull();
  });

  test('is open during opening hours, with the closing time', () => {
    // Monday 10:00 in Manila
    expect(officeStatus(schedule, new Date('2026-10-05T02:00:00Z'))).toEqual({
      open: true,
      closes: '17:00',
    });
  });

  test('after closing, opens again the next working day', () => {
    // Monday 17:30 in Manila
    expect(officeStatus(schedule, new Date('2026-10-05T09:30:00Z'))).toEqual({
      open: false,
      opens: { day: 'tue', time: '08:00', today: false },
    });
  });

  test('before opening, opens later today', () => {
    // Monday 07:00 in Manila
    expect(officeStatus(schedule, new Date('2026-10-04T23:00:00Z'))).toEqual({
      open: false,
      opens: { day: 'mon', time: '08:00', today: true },
    });
  });

  test('over the weekend, opens on Monday', () => {
    // Friday 18:00 and Sunday 10:00 in Manila
    for (const now of ['2026-10-09T10:00:00Z', '2026-10-04T02:00:00Z']) {
      expect(officeStatus(schedule, new Date(now))).toEqual({
        open: false,
        opens: { day: 'mon', time: '08:00', today: false },
      });
    }
  });

  test('closes exactly at the closing minute', () => {
    // Monday 17:00 in Manila
    expect(officeStatus(schedule, new Date('2026-10-05T09:00:00Z'))?.open).toBe(false);
  });
});

describe('formatClock', () => {
  test('writes 24-hour times the way residents read them', () => {
    expect(formatClock('08:00')).toBe('8:00 AM');
    expect(formatClock('12:30')).toBe('12:30 PM');
    expect(formatClock('17:00')).toBe('5:00 PM');
    expect(formatClock('00:15')).toBe('12:15 AM');
  });
});
