import { parseMargin } from './utils';

describe('parseMargin', () => {
  describe('no legend, no margin', () => {
    it('works', () => {
      const margin = parseMargin(undefined, undefined, undefined, 10);
      expect(margin).toBeUndefined();
    });
  });

  describe('legend, no margin', () => {
    it('works for bottom legend (no marginTop)', () => {
      const margin = parseMargin(
        undefined,
        { position: 'bottom-left', items: [] },
        { height: 40, width: 100, itemCoordinates: [] },
        10
      );
      expect(margin).toEqual({ bottom: 50 });
    });

    it('works for bottom legend (with marginTop)', () => {
      const margin = parseMargin(
        undefined,
        { position: 'bottom-left', items: [], marginTop: 20 },
        { height: 40, width: 100, itemCoordinates: [] },
        10
      );
      expect(margin).toEqual({ bottom: 60 });
    });

    it('works for right legend (no marginLeft)', () => {
      const margin = parseMargin(
        undefined,
        { position: 'right-center', items: [] },
        { height: 100, width: 40, itemCoordinates: [] },
        10
      );
      expect(margin).toEqual({ right: 50 });
    });

    it('works for right legend (with marginLeft)', () => {
      const margin = parseMargin(
        undefined,
        { position: 'right-center', items: [], marginLeft: 20 },
        { height: 100, width: 40, itemCoordinates: [] },
        10
      );
      expect(margin).toEqual({ right: 60 });
    });
  });

  describe('no legend, margin', () => {
    it('works', () => {
      const margin = parseMargin(
        { top: 10, bottom: 20, right: 30 },
        undefined,
        undefined,
        10
      );

      expect(margin).toEqual({ top: 10, bottom: 20, right: 30 });
    });
  });

  describe('legend and margin', () => {
    it('works for bottom legend (no marginTop)', () => {
      const margin = parseMargin(
        { bottom: 5, right: 15 },
        { position: 'bottom-left', items: [] },
        { height: 40, width: 100, itemCoordinates: [] },
        10
      );
      expect(margin).toEqual({ bottom: 55, right: 15 });
    });

    it('works for bottom legend (with marginTop)', () => {
      const margin = parseMargin(
        { bottom: 5, right: 15 },
        { position: 'bottom-left', items: [], marginTop: 20 },
        { height: 40, width: 100, itemCoordinates: [] },
        10
      );
      expect(margin).toEqual({ bottom: 65, right: 15 });
    });

    it('works for right legend (no marginLeft)', () => {
      const margin = parseMargin(
        { bottom: 5, right: 15 },
        { position: 'right-center', items: [] },
        { height: 100, width: 40, itemCoordinates: [] },
        10
      );
      expect(margin).toEqual({ bottom: 5, right: 65 });
    });

    it('works for right legend (with marginLeft)', () => {
      const margin = parseMargin(
        { bottom: 5, right: 15 },
        { position: 'right-center', items: [], marginLeft: 20 },
        { height: 100, width: 40, itemCoordinates: [] },
        10
      );
      expect(margin).toEqual({ bottom: 5, right: 75 });
    });
  });
});
