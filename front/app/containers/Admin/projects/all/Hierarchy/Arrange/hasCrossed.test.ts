import { hasCrossed } from './hasCrossed';

// Two cards side by side, 200 wide, and a third on the next row.
const first = { left: 0, top: 0, width: 200, height: 160 };
const second = { left: 220, top: 0, width: 200, height: 160 };
const below = { left: 0, top: 180, width: 200, height: 160 };

describe('hasCrossed', () => {
  it('waits for the middle of a card beside the dragged one', () => {
    const over = second;
    expect(
      hasCrossed({
        over,
        dragged: first,
        pointer: { x: 300, y: 80 },
        forward: true,
      })
    ).toBe(false);
    expect(
      hasCrossed({
        over,
        dragged: first,
        pointer: { x: 340, y: 80 },
        forward: true,
      })
    ).toBe(true);
  });

  it('waits for the middle from the other side when going back', () => {
    const over = first;
    expect(
      hasCrossed({
        over,
        dragged: second,
        pointer: { x: 150, y: 80 },
        forward: false,
      })
    ).toBe(false);
    expect(
      hasCrossed({
        over,
        dragged: second,
        pointer: { x: 60, y: 80 },
        forward: false,
      })
    ).toBe(true);
  });

  it('goes by the height for an item on another row', () => {
    const over = below;
    expect(
      hasCrossed({
        over,
        dragged: first,
        pointer: { x: 100, y: 200 },
        forward: true,
      })
    ).toBe(false);
    expect(
      hasCrossed({
        over,
        dragged: first,
        pointer: { x: 100, y: 300 },
        forward: true,
      })
    ).toBe(true);
  });
});
