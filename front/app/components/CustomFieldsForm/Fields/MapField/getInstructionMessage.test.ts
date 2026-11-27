import messages from '../../messages';

import getInstructionMessage from './getInstructionMessage';

// The address rows are what a multipoint instruction can promise, and they
// only exist on the desktop and tablet view.
const onDesktop = { hasAddressRows: true, isTabletOrSmaller: false };
const onTablet = { hasAddressRows: true, isTabletOrSmaller: true };
const onPhone = { hasAddressRows: false, isTabletOrSmaller: true };

describe('getInstructionMessage', () => {
  describe('for a multipoint', () => {
    const multipoint = {
      inputType: 'multipoint' as const,
      limitReached: false,
    };

    it('names the limit and the address field on desktop', () => {
      expect(
        getInstructionMessage({ ...multipoint, ...onDesktop, maxPins: 3 })
      ).toBe(messages.clickOnMapToAddMultiplePins3);
    });

    it('asks a tablet to tap rather than click', () => {
      expect(
        getInstructionMessage({ ...multipoint, ...onTablet, maxPins: 3 })
      ).toBe(messages.tapOnMapToAddMultiplePins2);
    });

    it('names no number when there is no limit', () => {
      expect(getInstructionMessage({ ...multipoint, ...onDesktop })).toBe(
        messages.clickOnMapToAddLocations
      );
    });

    it('treats a limit of zero as no limit, like the pin count itself does', () => {
      expect(
        getInstructionMessage({ ...multipoint, ...onDesktop, maxPins: 0 })
      ).toBe(messages.clickOnMapToAddLocations);
    });

    it('says to remove one first once the limit is reached', () => {
      expect(
        getInstructionMessage({
          ...multipoint,
          ...onDesktop,
          maxPins: 3,
          limitReached: true,
        })
      ).toBe(messages.maximumLocationsReached);
    });

    it('promises no address field on a phone, which has none', () => {
      expect(
        getInstructionMessage({ ...multipoint, ...onPhone, maxPins: 3 })
      ).toBe(messages.tapOnMapToAddMultiplePins);
    });

    it('points a phone at the Undo button it still has', () => {
      expect(
        getInstructionMessage({
          ...multipoint,
          ...onPhone,
          maxPins: 3,
          limitReached: true,
        })
      ).toBe(messages.maximumPinsReachedTap);
    });
  });

  describe('for the other map inputs', () => {
    it.each([
      ['point', messages.clickOnMapToAddOrType],
      ['line', messages.clickOnMapMultipleToAdd],
      ['polygon', messages.clickOnMapMultipleToAdd],
    ] as const)('leaves %s as it was', (inputType, expected) => {
      expect(
        getInstructionMessage({ inputType, limitReached: false, ...onDesktop })
      ).toBe(expected);
    });

    it('still offers the tap wording on touch', () => {
      expect(
        getInstructionMessage({
          inputType: 'point',
          limitReached: false,
          ...onPhone,
        })
      ).toBe(messages.tapOnMapToAddOrType);
    });
  });
});
