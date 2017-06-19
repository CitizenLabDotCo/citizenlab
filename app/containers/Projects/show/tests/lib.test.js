import { generateResourcesPhaseValue } from 'utils/testing/mocks';
import { stringMock } from 'utils/testing/constants';
import { getCurrentPhaseId, getPhaseType, parseDate, parseTime } from '../lib';

describe('ProjectsTimeline/lib.js', () => {
  describe('getPhaseType', () => {
    it('should return past if ending date before current date', () => {
      const phase = generateResourcesPhaseValue(stringMock, 'past').data;
      const startingDate = phase.attributes.start_at;
      const endingDate = phase.attributes.end_at;

      expect(getPhaseType(startingDate, endingDate)).toEqual('past');
    });

    it('should return current if ending date not before current date and starting date not after current date', () => {
      const phase = generateResourcesPhaseValue(stringMock, 'current').data;
      const startingDate = phase.attributes.start_at;
      const endingDate = phase.attributes.end_at;

      expect(getPhaseType(startingDate, endingDate)).toEqual('current');
    });

    it('should return coming if starting date after current date', () => {
      const phase = generateResourcesPhaseValue(stringMock, 'coming').data;
      const startingDate = phase.attributes.start_at;
      const endingDate = phase.attributes.end_at;

      expect(getPhaseType(startingDate, endingDate)).toEqual('coming');
    });
  });

  describe('getCurrentPhaseId', () => {
    it('should return current phase\'s id if any', () => {
      const phases = [];

      phases.push(generateResourcesPhaseValue('1', 'past').data);
      phases.push(generateResourcesPhaseValue('2', 'current').data);
      phases.push(generateResourcesPhaseValue('3', 'coming').data);
      phases.push(generateResourcesPhaseValue('4', 'coming').data);

      expect(getCurrentPhaseId(phases)).toEqual('2');
    });

    it('should return -1 if phases is not defined', () => {
      expect(getCurrentPhaseId(undefined)).toEqual(-1);
    });

    it('should return an undefined value if no current phase', () => {
      const phases = [];

      phases.push(generateResourcesPhaseValue('1', 'past').data);
      phases.push(generateResourcesPhaseValue('2', 'coming').data);
      phases.push(generateResourcesPhaseValue('4', 'coming').data);

      expect(getCurrentPhaseId(phases)).not.toBeDefined();
    });
  });

  describe('parseDate', () => {
    it('should return the date in -DD short month- format and in current locale', () => {
      // br
      expect(parseDate('2017-04-30', 'br')).toEqual('30 Ebr');

      // en
      expect(parseDate('2017-04-30', 'en')).toEqual('30 Apr');
    });
  });

  describe('parseTime', () => {
    it('should return the time in -x[x]:y[y] [a|m]- format', () => {
      // AM
      expect(parseTime('2018-01-31T02:00:00.000Z')).toEqual('3.01 AM');

      // PM
      it('should return the time in -x[x]:y[y] [a|m]- format', () => {
        expect(parseTime('2018-01-31T12:00:00.000Z')).toEqual('1.01 PM');
      });
    });
  });
});
