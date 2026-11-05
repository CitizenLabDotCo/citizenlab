import { parseMargin } from './utils';

describe('parseMargin', () => {
  describe('without legend or custom margin', () => {
    it('returns recharts default margins', () => {
      const margin = parseMargin(undefined, undefined, undefined, 10);
      expect(margin).toEqual({ top: 5, bottom: 5, left: 5, right: 5 });
    });
  });

  describe('with legend only', () => {
    it('adds legend height to bottom margin using default offset', () => {
      const margin = parseMargin(
        undefined,
        { position: 'bottom-left', items: [] },
        { height: 40, width: 100, itemCoordinates: [] },
        10
      );
      expect(margin).toEqual({ top: 5, bottom: 55, left: 5, right: 5 });
    });

    it('adds legend height to bottom margin using custom marginTop', () => {
      const margin = parseMargin(
        undefined,
        { position: 'bottom-left', items: [], marginTop: 20 },
        { height: 40, width: 100, itemCoordinates: [] },
        10
      );
      expect(margin).toEqual({ top: 5, bottom: 65, left: 5, right: 5 });
    });

    it('adds legend width to right margin using default offset', () => {
      const margin = parseMargin(
        undefined,
        { position: 'right-center', items: [] },
        { height: 100, width: 40, itemCoordinates: [] },
        10
      );
      expect(margin).toEqual({ top: 5, bottom: 5, left: 5, right: 55 });
    });

    it('adds legend width to right margin using custom marginLeft', () => {
      const margin = parseMargin(
        undefined,
        { position: 'right-center', items: [], marginLeft: 20 },
        { height: 100, width: 40, itemCoordinates: [] },
        10
      );
      expect(margin).toEqual({ top: 5, bottom: 5, left: 5, right: 65 });
    });
  });

  describe('with custom margin only', () => {
    it('preserves custom values and fills missing with defaults', () => {
      const margin = parseMargin(
        { top: 10, bottom: 20, right: 30 },
        undefined,
        undefined,
        10
      );

      expect(margin).toEqual({ top: 10, bottom: 20, left: 5, right: 30 });
    });
  });

  describe('with legend and custom margin', () => {
    it('combines custom bottom margin with legend offset', () => {
      const margin = parseMargin(
        { bottom: 5, right: 15 },
        { position: 'bottom-left', items: [] },
        { height: 40, width: 100, itemCoordinates: [] },
        10
      );
      expect(margin).toEqual({ top: 5, bottom: 55, left: 5, right: 15 });
    });

    it('combines custom bottom margin with legend offset using custom marginTop', () => {
      const margin = parseMargin(
        { bottom: 5, right: 15 },
        { position: 'bottom-left', items: [], marginTop: 20 },
        { height: 40, width: 100, itemCoordinates: [] },
        10
      );
      expect(margin).toEqual({ top: 5, bottom: 65, left: 5, right: 15 });
    });

    it('combines custom right margin with legend offset', () => {
      const margin = parseMargin(
        { bottom: 5, right: 15 },
        { position: 'right-center', items: [] },
        { height: 100, width: 40, itemCoordinates: [] },
        10
      );
      expect(margin).toEqual({ top: 5, bottom: 5, left: 5, right: 65 });
    });

    it('combines custom right margin with legend offset using custom marginLeft', () => {
      const margin = parseMargin(
        { bottom: 5, right: 15 },
        { position: 'right-center', items: [], marginLeft: 20 },
        { height: 100, width: 40, itemCoordinates: [] },
        10
      );
      expect(margin).toEqual({ top: 5, bottom: 5, left: 5, right: 75 });
    });
  });
});
