import { newNumberedPinGraphics } from 'components/EsriMap/utils';

import {
  fakeMapViewWith,
  userInputLayerWith,
  userInputLayerWithPins,
} from './testUtils';
import { getUserInputPoints } from './utils';

describe('getUserInputPoints', () => {
  it('returns the coordinates of the pins a user dropped', () => {
    const layer = userInputLayerWithPins([
      [4.35, 50.85],
      [4.36, 50.86],
    ]);

    expect(getUserInputPoints(fakeMapViewWith(layer))).toEqual([
      [4.35, 50.85],
      [4.36, 50.86],
    ]);
  });

  it('does not count a pin twice because of the number drawn on it', () => {
    const { pin, label } = newNumberedPinGraphics(
      { type: 'Point', coordinates: [4.35, 50.85] },
      '#123456',
      1
    );

    // The number sits at the pin's own coordinates, so counting it would read
    // one pin as two and block the next one against the pin limit.
    const layer = userInputLayerWith([pin, label]);

    expect(getUserInputPoints(fakeMapViewWith(layer))).toEqual([[4.35, 50.85]]);
  });
});
