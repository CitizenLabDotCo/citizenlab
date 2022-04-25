import { pastPresentOrFuture, getIsoDate } from './dateUtils';
import moment from 'moment';
import 'moment-timezone';

// test date is 1am June 15 UTC time
const testDateStr = '2020-06-15T01:00:00Z';

// the local time in Santiago should be on the 14th, since they are -0400
// hour offset from UTC time
describe('in Santiago time zone', () => {
  beforeAll(() => {
    jest.useFakeTimers('modern');
    jest.setSystemTime(new Date(testDateStr));
    moment.tz.setDefault('America/Santiago');
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  describe('getISODate', () => {
    it('returns the correct date formatted', () => {
      const result = getIsoDate('2020-06-15');
      expect(result).toEqual('2020-06-15');
    });
  });

  describe('pastPresentOrFuture', () => {
    describe('with a single input date', () => {
      it('should accurately report a past date', () => {
        const result = pastPresentOrFuture('2020-06-13');
        expect(result).toEqual('past');
      });

      it('should accurately report a present date', () => {
        const result = pastPresentOrFuture('2020-06-14');
        expect(result).toEqual('present');
      });

      it('should accurately report a future date', () => {
        const result = pastPresentOrFuture('2020-06-15');
        expect(result).toEqual('future');
      });
    });

    describe('with an input date range', () => {
      it('should accurately report a past date', () => {
        const result = pastPresentOrFuture(['2020-06-10', '2020-06-13']);
        expect(result).toEqual('past');
      });

      it('should accurately report a present date when in range', () => {
        const result = pastPresentOrFuture(['2020-06-10', '2020-06-20']);
        expect(result).toEqual('present');
      });

      it('should accurately report a present date, including start date', () => {
        const result = pastPresentOrFuture(['2020-06-14', '2020-06-20']);
        expect(result).toEqual('present');
      });

      it('should accurately report a present date, including end date', () => {
        const result = pastPresentOrFuture(['2020-06-10', '2020-06-14']);
        expect(result).toEqual('present');
      });

      it('should accurately report a future date', () => {
        const result = pastPresentOrFuture(['2020-06-15', '2020-06-20']);
        expect(result).toEqual('future');
      });
    });
  });
});

// the local time in Tokyo should be on the 15th, since they are +0900
// hour offset from UTC time
describe('in Tokyo time zone', () => {
  beforeAll(() => {
    jest.useFakeTimers('modern');
    jest.setSystemTime(new Date(testDateStr));
    moment.tz.setDefault('Asia/Tokyo');
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  describe('getISODate', () => {
    it('returns the correct date formatted', () => {
      const result = getIsoDate('2020-06-15');
      expect(result).toEqual('2020-06-15');
    });
  });

  describe('pastPresentOrFuture', () => {
    describe('with a single input date', () => {
      it('should accurately report a past date', () => {
        const result = pastPresentOrFuture('2020-06-14');
        expect(result).toEqual('past');
      });

      it('should accurately report a present date', () => {
        const result = pastPresentOrFuture('2020-06-15');
        expect(result).toEqual('present');
      });

      it('should accurately report a future date', () => {
        const result = pastPresentOrFuture('2020-06-16');
        expect(result).toEqual('future');
      });
    });

    describe('with an input date range', () => {
      it('should accurately report a past date', () => {
        const result = pastPresentOrFuture(['2020-06-10', '2020-06-14']);
        expect(result).toEqual('past');
      });

      it('should accurately report a present date when in range', () => {
        const result = pastPresentOrFuture(['2020-06-10', '2020-06-20']);
        expect(result).toEqual('present');
      });

      it('should accurately report a present date, including start date', () => {
        const result = pastPresentOrFuture(['2020-06-15', '2020-06-20']);
        expect(result).toEqual('present');
      });

      it('should accurately report a present date, including end date', () => {
        const result = pastPresentOrFuture(['2020-06-10', '2020-06-15']);
        expect(result).toEqual('present');
      });

      it('should accurately report a future date', () => {
        const result = pastPresentOrFuture(['2020-06-16', '2020-06-20']);
        expect(result).toEqual('future');
      });
    });
  });
});
