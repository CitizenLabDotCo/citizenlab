import { frameScale, placeStory, renderOrder, thumbScale } from './gallery';

describe('thumbScale', () => {
  it('scales down to the box, never up', () => {
    expect(thumbScale(160, 320)).toBe(0.5);
    expect(thumbScale(640, 320)).toBe(1);
  });

  it('falls back before the box is measured', () => {
    expect(thumbScale(0, 320)).toBe(0.75);
  });
});

describe('frameScale', () => {
  it('scales the frame from the stories width to the grid', () => {
    expect(frameScale(1280, 320)).toBe(4);
    expect(frameScale(0, 320)).toBe(1);
  });
});

describe('placeStory', () => {
  it('puts the story over the box, laid out as in a frame of its own', () => {
    const p = placeStory({ x: 400, y: 80, width: 160, height: 100 }, 320, 4);
    expect(p.box).toEqual({ x: 100, y: 20, width: 40, height: 25 });
    // Laid out at 320 x 200, shown at half size on the page.
    expect(p.width).toBe(320);
    expect(p.height).toBe(200);
    expect(p.scale * 4).toBe(0.5);
  });

  it('takes the scale from the given width', () => {
    const p = placeStory(
      { x: 0, y: 0, width: 160.5, height: 100 },
      320,
      1,
      160
    );
    expect(p.scale).toBe(0.5);
    expect(p.width).toBe(321);
  });
});

describe('renderOrder', () => {
  it('puts cards near the viewport first, each in gallery order', () => {
    expect(renderOrder(['a', 'b', 'c', 'd'], new Set(['d', 'b']))).toEqual([
      'b',
      'd',
      'a',
      'c',
    ]);
  });
});
