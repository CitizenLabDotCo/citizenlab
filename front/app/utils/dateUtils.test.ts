import {
  pastPresentOrFuture,
  getIsoDateUtc,
  getIsoDate,
  getIsoDateForToday,
} from './dateUtils';
import moment from 'moment';
import 'moment-timezone';

// test date is 1AM June 15 2020 UTC time (Z)
const testDateStr = '2020-06-15T01:00:00Z';

// the local time in Santiago should be June 14th 2022, 9pm,
// since Santiago is -0400 hour offset from UTC time
describe('in America/Santiago time zone', () => {
  beforeAll(() => {
    jest.useFakeTimers('modern');
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
    describe('with a single input date', () => {
      it('should accurately report a past date', () => {
        expect(pastPresentOrFuture('2020-06-13')).toEqual('past');
      });

      it('should accurately report a present date', () => {
        expect(pastPresentOrFuture('2020-06-14')).toEqual('present');
      });

      it('should accurately report a future date', () => {
        expect(pastPresentOrFuture('2020-06-15')).toEqual('future');
      });
    });

    describe('with an input date range', () => {
      it('should accurately report a past date', () => {
        expect(pastPresentOrFuture(['2020-06-10', '2020-06-13'])).toEqual(
          'past'
        );
      });

      it('should accurately report a present date when in range', () => {
        expect(pastPresentOrFuture(['2020-06-10', '2020-06-20'])).toEqual(
          'present'
        );
      });

      it('should accurately report a present date, including start date', () => {
        expect(pastPresentOrFuture(['2020-06-14', '2020-06-20'])).toEqual(
          'present'
        );
      });

      it('should accurately report a present date, including end date', () => {
        expect(pastPresentOrFuture(['2020-06-10', '2020-06-14'])).toEqual(
          'present'
        );
      });

      it('should accurately report a future date', () => {
        expect(pastPresentOrFuture(['2020-06-15', '2020-06-20'])).toEqual(
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
    jest.useFakeTimers('modern');
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

  describe('pastPresentOrFuture', () => {
    describe('with a single input date', () => {
      it('should accurately report a past date', () => {
        expect(pastPresentOrFuture('2020-06-14')).toEqual('past');
      });

      it('should accurately report a present date', () => {
        expect(pastPresentOrFuture('2020-06-15')).toEqual('present');
      });

      it('should accurately report a future date', () => {
        expect(pastPresentOrFuture('2020-06-16')).toEqual('future');
      });
    });

    describe('with an input date range', () => {
      it('should accurately report a past date', () => {
        expect(pastPresentOrFuture(['2020-06-10', '2020-06-14'])).toEqual(
          'past'
        );
      });

      it('should accurately report a present date when in range', () => {
        expect(pastPresentOrFuture(['2020-06-10', '2020-06-20'])).toEqual(
          'present'
        );
      });

      it('should accurately report a present date, including start date', () => {
        expect(pastPresentOrFuture(['2020-06-15', '2020-06-20'])).toEqual(
          'present'
        );
      });

      it('should accurately report a present date, including end date', () => {
        expect(pastPresentOrFuture(['2020-06-10', '2020-06-15'])).toEqual(
          'present'
        );
      });

      it('should accurately report a future date', () => {
        expect(pastPresentOrFuture(['2020-06-16', '2020-06-20'])).toEqual(
          'future'
        );
      });
    });
  });
});
