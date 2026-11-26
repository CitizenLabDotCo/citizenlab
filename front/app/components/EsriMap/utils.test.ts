import { newNumberedPinGraphics, PIN_NUMBER_ATTRIBUTE } from './utils';

describe('newNumberedPinGraphics', () => {
  const PARK_LANE: GeoJSON.Point = {
    type: 'Point',
    coordinates: [4.35, 50.85],
  };

  it('puts the number on the same spot as the pin it belongs to', () => {
    const { pin, label } = newNumberedPinGraphics(PARK_LANE, '#123456', 2);

    expect(pin.geometry).toMatchObject({ longitude: 4.35, latitude: 50.85 });
    expect(label.geometry).toMatchObject({ longitude: 4.35, latitude: 50.85 });
  });

  it('shows the number it was given', () => {
    const { label } = newNumberedPinGraphics(PARK_LANE, '#123456', 2);

    expect(label.symbol).toMatchObject({ text: '2' });
  });

  it('puts the number on both halves, so a drag can pick up either and keep it', () => {
    const { pin, label } = newNumberedPinGraphics(PARK_LANE, '#123456', 2);

    expect(pin.attributes[PIN_NUMBER_ATTRIBUTE]).toBe(2);
    expect(label.attributes[PIN_NUMBER_ATTRIBUTE]).toBe(2);
  });

  it('leaves the pin head solid, so the number is not punched out of it', () => {
    const { pin } = newNumberedPinGraphics(PARK_LANE, '#123456', 1);

    // The ring subpath is the second move command in the full pin path.
    expect(pin.symbol).toMatchObject({
      path: expect.not.stringContaining('z M'),
    });
  });
});
