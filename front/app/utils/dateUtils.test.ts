// moment-timezone extends the regular moment library,
// so there's no need to import both moment and moment-timezone
import moment from 'moment-timezone';

import {
  pastPresentOrFuture,
  getIsoDateUtc,
  getIsoDate,
  getIsoDateForToday,
  timeAgo,
} from './dateUtils';

// test date is 1AM June 15 2020 UTC time (Z)
const testDateStr = '2020-06-15T01:00:00Z';

// timeAgo should report the elapsed time since a given date correctly
describe('timeAgo is reported correctly', () => {
  it('should accurately return seconds passed since a date', () => {
    let date = new Date();
    date.setSeconds(date.getSeconds() - 1);
    let timeAgoResponse = timeAgo(date.valueOf(), 'en') || '';
    expect(timeAgoResponse).toEqual('1 second ago');

    date = new Date();
    date.setSeconds(date.getSeconds() - 2);
    timeAgoResponse = timeAgo(date.valueOf(), 'en') || '';
    expect(timeAgoResponse).toEqual('2 seconds ago');
  });

  it('should accurately return minutes passed since a date', () => {
    let date = new Date();
    date.setMinutes(date.getMinutes() - 1);
    let timeAgoResponse = timeAgo(date.valueOf(), 'en') || '';
    expect(timeAgoResponse).toEqual('1 minute ago');

    date = new Date();
    date.setMinutes(date.getMinutes() - 2);
    timeAgoResponse = timeAgo(date.valueOf(), 'en') || '';
    expect(timeAgoResponse).toEqual('2 minutes ago');
  });

  it('should accurately return hours passed since a date', () => {
    let date = new Date();
    date.setHours(date.getHours() - 1);
    let timeAgoResponse = timeAgo(date.valueOf(), 'en') || '';
    expect(timeAgoResponse).toEqual('1 hour ago');

    date = new Date();
    date.setHours(date.getHours() - 2);
    timeAgoResponse = timeAgo(date.valueOf(), 'en') || '';
    expect(timeAgoResponse).toEqual('2 hours ago');
  });

  it('should accurately return days passed since a date', () => {
    let date = new Date();
    date.setHours(date.getHours() - 24);
    let timeAgoResponse = timeAgo(date.valueOf(), 'en') || '';
    expect(timeAgoResponse).toEqual('1 day ago');

    date = new Date();
    date.setHours(date.getHours() - 48);
    timeAgoResponse = timeAgo(date.valueOf(), 'en') || '';
    expect(timeAgoResponse).toEqual('2 days ago');
  });

  it('should accurately return weeks passed since a date', () => {
    let date = new Date();
    date.setHours(date.getHours() - 168);
    let timeAgoResponse = timeAgo(date.valueOf(), 'en') || '';
    expect(timeAgoResponse).toEqual('1 week ago');

    date = new Date();
    date.setHours(date.getHours() - 336);
    timeAgoResponse = timeAgo(date.valueOf(), 'en') || '';
    expect(timeAgoResponse).toEqual('2 weeks ago');
  });

  it('should accurately return months passed since a date', () => {
    // Use a consistent test date that won't have month boundary issues
    // Set current date to July 15th, 2024 - one month ago would be June 15th
    const testDate = new Date('2024-07-15T12:00:00Z');
    jest.useFakeTimers();
    jest.setSystemTime(testDate);

    // We set a date to avoid this test returning different results on different days
    const oneMonthAgo = new Date(2024, 5, 15); // June 15th, 2024
    let timeAgoResponse = timeAgo(oneMonthAgo.valueOf(), 'en') || '';
    expect(timeAgoResponse).toEqual('1 month ago');

    const twoMonthsAgo = new Date(2024, 4, 15); // May 15th, 2024
    timeAgoResponse = timeAgo(twoMonthsAgo.valueOf(), 'en') || '';
    expect(timeAgoResponse).toEqual('2 months ago');

    // Clean up
    jest.useRealTimers();
  });

  it('should handle edge case where subtracting one month results in invalid date (e.g., July 31 -> June 31)', () => {
    // This test replicates the July 31st failure
    // When you subtract 1 month from July 31st, you get June 31st which doesn't exist
    // JavaScript automatically adjusts this to July 1st, making it exactly 4 weeks ago

    // Set the current date to July 31st, 2024
    const july31st2024 = new Date('2024-07-31T12:00:00Z');
    jest.useFakeTimers();
    jest.setSystemTime(july31st2024);

    // Create a date that would cause this issue (like July 31st)
    const problematicDate = new Date(2024, 6, 31); // July 31st, 2024
    const oneMonthBefore = new Date(
      problematicDate.getFullYear(),
      problematicDate.getMonth() - 1,
      problematicDate.getDate()
    );

    // Verify that the date was adjusted (should be July 1st, not June 31st)
    expect(oneMonthBefore.getMonth()).toBe(6); // July (0-indexed)
    expect(oneMonthBefore.getDate()).toBe(1);

    // The timeAgo function should correctly report this as "4 weeks ago"
    // because that's more accurate than "1 month ago"
    const timeAgoResponse = timeAgo(oneMonthBefore.valueOf(), 'en') || '';
    expect(timeAgoResponse).toEqual('4 weeks ago');

    // Clean up
    jest.useRealTimers();
  });

  it('should handle edge case where subtracting one month results in invalid date (e.g., March 31 -> February 31)', () => {
    // This test covers the March 31st -> February scenario
    // When you subtract 1 month from March 31st, you get February 31st which doesn't exist
    // JavaScript automatically adjusts this to March 2nd (in leap year) or March 2nd (in non-leap year)

    // Set the current date to March 31st, 2024 (leap year)
    const march31st2024 = new Date('2024-03-31T12:00:00Z');
    jest.useFakeTimers();
    jest.setSystemTime(march31st2024);

    // Create a date that would cause this issue (like March 31st)
    const problematicDate = new Date(2024, 2, 31); // March 31st, 2024
    const oneMonthBefore = new Date(
      problematicDate.getFullYear(),
      problematicDate.getMonth() - 1,
      problematicDate.getDate()
    );

    // Verify that the date was adjusted (should be March 2nd in leap year)
    expect(oneMonthBefore.getMonth()).toBe(2); // March (0-indexed)
    expect(oneMonthBefore.getDate()).toBe(2); // March 2nd in leap year

    // The timeAgo function should correctly report this as "4 weeks ago"
    // because that's more accurate than "1 month ago"
    const timeAgoResponse = timeAgo(oneMonthBefore.valueOf(), 'en') || '';
    expect(timeAgoResponse).toEqual('4 weeks ago');

    // Clean up
    jest.useRealTimers();
  });

  it('should handle edge case where subtracting one month results in invalid date (e.g., March 31 -> February 31 in non-leap year)', () => {
    // This test covers the March 31st -> February scenario in a non-leap year
    // When you subtract 1 month from March 31st, you get February 31st which doesn't exist
    // JavaScript automatically adjusts this to March 3rd

    // Set the current date to March 31st, 2023 (non-leap year)
    const march31st2023 = new Date('2023-03-31T12:00:00Z');
    jest.useFakeTimers();
    jest.setSystemTime(march31st2023);

    // Create a date that would cause this issue (like March 31st)
    const problematicDate = new Date(2023, 2, 31); // March 31st, 2023
    const oneMonthBefore = new Date(
      problematicDate.getFullYear(),
      problematicDate.getMonth() - 1,
      problematicDate.getDate()
    );

    // Verify that the date was adjusted (should be March 3rd in non-leap year)
    expect(oneMonthBefore.getMonth()).toBe(2); // March (0-indexed)
    expect(oneMonthBefore.getDate()).toBe(3); // March 3rd in non-leap year

    // The timeAgo function should correctly report this as "4 weeks ago"
    // because that's more accurate than "1 month ago"
    const timeAgoResponse = timeAgo(oneMonthBefore.valueOf(), 'en') || '';
    expect(timeAgoResponse).toEqual('4 weeks ago');

    // Clean up
    jest.useRealTimers();
  });

  it('should accurately return years passed since a date', () => {
    let date = new Date();
    date.setMonth(date.getMonth() - 12);
    let timeAgoResponse = timeAgo(date.valueOf(), 'en') || '';
    expect(timeAgoResponse).toEqual('1 year ago');

    date = new Date();
    date.setMonth(date.getMonth() - 24);
    timeAgoResponse = timeAgo(date.valueOf(), 'en') || '';
    expect(timeAgoResponse).toEqual('2 years ago');
  });

  it('should accurately return time passed since a date in specified language', () => {
    let date = new Date();
    date.setMonth(date.getMonth() - 12);
    let timeAgoResponse = timeAgo(date.valueOf(), 'fr-BE') || '';
    expect(timeAgoResponse).toEqual('il y a 1 an');

    date = new Date();
    date.setMonth(date.getMonth() - 24);
    timeAgoResponse = timeAgo(date.valueOf(), 'fr-BE') || '';
    expect(timeAgoResponse).toEqual('il y a 2 ans');
  });
});

// the local time in Santiago should be June 14th 2022, 9pm,
// since Santiago is -0400 hour offset from UTC time
describe('in America/Santiago time zone', () => {
  beforeAll(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date(testDateStr));
    moment.tz.setDefault('America/Santiago');
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  describe('general time safety checks', () => {
    it('gets the day and time correctly for the America/Santiago timezone', () => {
      expect(
        new Date().toLocaleString('en-US', { timeZone: 'America/Santiago' })
      ).toBe('6/14/2020, 9:00:00 PM');
    });
  });

  describe('getIsoDateUtc', () => {
    it('returns the correct date formatted, ignoring timezone', () => {
      expect(getIsoDateUtc('2020-06-15')).toEqual('2020-06-15');
    });
  });

  describe('getIsoDate', () => {
    it('returns the correct date formatted, taking into account user timezone', () => {
      expect(getIsoDate('2020-06-15')).toEqual('2020-06-14');
    });
  });

  describe('getIsoDateForToday', () => {
    it('returns the correct date formatted', () => {
      expect(getIsoDateForToday()).toEqual('2020-06-14');
    });
  });

  describe('pastPresentOrFuture', () => {
    describe('with a single input datetime', () => {
      it('reports a datetime earlier today as past', () => {
        expect(pastPresentOrFuture('2020-06-15T00:30:00Z')).toEqual('past');
      });

      it('reports a datetime equal to now as present', () => {
        expect(pastPresentOrFuture('2020-06-15T01:00:00Z')).toEqual('present');
      });

      it('reports a datetime later today as future', () => {
        expect(pastPresentOrFuture('2020-06-15T01:30:00Z')).toEqual('future');
      });
    });

    describe('with an input datetime range', () => {
      it('reports a range fully in the past as past', () => {
        expect(
          pastPresentOrFuture(['2020-06-10T00:00:00Z', '2020-06-14T00:00:00Z'])
        ).toEqual('past');
      });

      it('reports a range containing now as present', () => {
        expect(
          pastPresentOrFuture(['2020-06-10T00:00:00Z', '2020-06-20T00:00:00Z'])
        ).toEqual('present');
      });

      it('reports a range whose end is earlier today as past (the bug)', () => {
        // Phase ended 30 minutes ago; before the fix this returned 'present'
        // because day-granularity treated the whole day as in-range.
        expect(
          pastPresentOrFuture(['2020-06-10T00:00:00Z', '2020-06-15T00:30:00Z'])
        ).toEqual('past');
      });

      it('reports a range whose end is later today as present', () => {
        expect(
          pastPresentOrFuture(['2020-06-10T00:00:00Z', '2020-06-15T05:00:00Z'])
        ).toEqual('present');
      });

      it('reports a range whose start equals now as present (start inclusive)', () => {
        expect(
          pastPresentOrFuture(['2020-06-15T01:00:00Z', '2020-06-20T00:00:00Z'])
        ).toEqual('present');
      });

      it('reports a range whose start is later today as future', () => {
        expect(
          pastPresentOrFuture(['2020-06-15T05:00:00Z', '2020-06-20T00:00:00Z'])
        ).toEqual('future');
      });

      it('reports null end with past start as present', () => {
        expect(pastPresentOrFuture(['2020-06-10T00:00:00Z', null])).toEqual(
          'present'
        );
      });

      it('reports null end with future start as future', () => {
        expect(pastPresentOrFuture(['2020-06-20T00:00:00Z', null])).toEqual(
          'future'
        );
      });
    });
  });
});

// the local time in Tokyo should be June 15th 2022, 10am,
// since Tokyo is +0900 hour offset from UTC time
describe('in Asia/Tokyo time zone', () => {
  beforeAll(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date(testDateStr));
    moment.tz.setDefault('Asia/Tokyo');
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  describe('general time safety checks', () => {
    it('gets the day and time correctly for the Asia/Tokyo timezone', () => {
      expect(
        new Date().toLocaleString('en-US', { timeZone: 'Asia/Tokyo' })
      ).toBe('6/15/2020, 10:00:00 AM');
    });
  });

  describe('getIsoDateForToday', () => {
    it('returns the correct date formatted', () => {
      expect(getIsoDateForToday()).toEqual('2020-06-15');
    });
  });

  describe('getIsoDateUtc', () => {
    it('returns the correct date formatted, ignoring timezone', () => {
      expect(getIsoDateUtc('2020-06-15')).toEqual('2020-06-15');
    });
  });

  describe('getIsoDate', () => {
    it('returns the correct date formatted, taking into account user timezone', () => {
      expect(getIsoDate('2020-06-15')).toEqual('2020-06-15');
    });
  });

  // pastPresentOrFuture compares absolute instants, so the same datetime
  // inputs must produce identical results regardless of the default timezone.
  describe('pastPresentOrFuture', () => {
    describe('with a single input datetime', () => {
      it('reports a datetime earlier today as past', () => {
        expect(pastPresentOrFuture('2020-06-15T00:30:00Z')).toEqual('past');
      });

      it('reports a datetime equal to now as present', () => {
        expect(pastPresentOrFuture('2020-06-15T01:00:00Z')).toEqual('present');
      });

      it('reports a datetime later today as future', () => {
        expect(pastPresentOrFuture('2020-06-15T01:30:00Z')).toEqual('future');
      });
    });

    describe('with an input datetime range', () => {
      it('reports a range whose end is earlier today as past (the bug)', () => {
        expect(
          pastPresentOrFuture(['2020-06-10T00:00:00Z', '2020-06-15T00:30:00Z'])
        ).toEqual('past');
      });

      it('reports a range whose end is later today as present', () => {
        expect(
          pastPresentOrFuture(['2020-06-10T00:00:00Z', '2020-06-15T05:00:00Z'])
        ).toEqual('present');
      });

      it('reports a range whose start is later today as future', () => {
        expect(
          pastPresentOrFuture(['2020-06-15T05:00:00Z', '2020-06-20T00:00:00Z'])
        ).toEqual('future');
      });
    });
  });
});
