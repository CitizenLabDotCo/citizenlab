import { MessageDescriptor } from 'react-intl';

import messages from '../../messages';

import { MapInputType } from './utils';

// Touch devices are told to tap, pointer devices to click, so each input type
// needs both wordings. A multipoint is not in here: what it says depends on
// its limit and on the view, so getInstructionMessage works it out.
const INSTRUCTION_MESSAGES: {
  [key in Exclude<MapInputType, 'multipoint'>]: {
    tap: MessageDescriptor;
    click: MessageDescriptor;
  };
} = {
  point: {
    tap: messages.tapOnMapToAddOrType,
    click: messages.clickOnMapToAddOrType,
  },
  line: {
    tap: messages.tapOnMapMultipleToAdd,
    click: messages.clickOnMapMultipleToAdd,
  },
  polygon: {
    tap: messages.tapOnMapMultipleToAdd,
    click: messages.clickOnMapMultipleToAdd,
  },
};

// getInstructionMessage
// Description: Picks the line above the map. A multipoint says more than the
// other inputs: it can only promise the address field on the views that show
// one, and it only names a number of locations when there is a limit.
const getInstructionMessage = ({
  inputType,
  maxPins,
  limitReached,
  hasAddressRows,
  isTabletOrSmaller,
}: {
  inputType: MapInputType;
  maxPins?: number;
  limitReached: boolean;
  hasAddressRows: boolean;
  isTabletOrSmaller: boolean;
}): MessageDescriptor => {
  if (inputType !== 'multipoint') {
    const instruction = INSTRUCTION_MESSAGES[inputType];
    return isTabletOrSmaller ? instruction.tap : instruction.click;
  }

  if (!hasAddressRows) {
    // Pins are added in the fullscreen map here, and taken off with Undo.
    return limitReached
      ? messages.maximumPinsReachedTap
      : messages.tapOnMapToAddMultiplePins;
  }

  if (limitReached) {
    return messages.maximumLocationsReached;
  }

  if (!maxPins) {
    return isTabletOrSmaller
      ? messages.tapOnMapToAddLocations
      : messages.clickOnMapToAddLocations;
  }

  return isTabletOrSmaller
    ? messages.tapOnMapToAddMultiplePins2
    : messages.clickOnMapToAddMultiplePins3;
};

export default getInstructionMessage;
