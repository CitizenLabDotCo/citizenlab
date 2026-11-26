import GraphicsLayer from '@arcgis/core/layers/GraphicsLayer';

import { newNumberedPinGraphics } from 'components/EsriMap/utils';

import { clearPointData } from './pointUtils';
import { fakeMapViewWith, userInputLayerWith } from './testUtils';

describe('clearPointData', () => {
  it('empties the layer the pins of a multi-pin answer live in', () => {
    const { pin, label } = newNumberedPinGraphics(
      { type: 'Point', coordinates: [4.35, 50.85] },
      '#123456',
      1
    );
    const layer = userInputLayerWith([pin, label]);

    clearPointData(fakeMapViewWith(layer));

    // Without this, taking the last pin off empties its row but leaves the pin
    // itself on the map.
    expect(layer.graphics.length).toBe(0);
  });

  it('clears the address of a single point answer', () => {
    const setAddress = jest.fn();

    clearPointData(
      fakeMapViewWith(new GraphicsLayer({ title: 'User Input' })),
      setAddress
    );

    expect(setAddress).toHaveBeenCalledWith({ value: '', label: '' });
  });
});
