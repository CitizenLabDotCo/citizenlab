// The gallery shows every card's story in one Storybook preview frame,
// overlaid on the grid, instead of a frame per card (each frame booted the
// whole preview). The frame is laid out at the stories' width (so media
// queries see the same phone-sized viewport a card's own frame had) and
// scaled up to the grid; inside it, each story is placed over its card's
// preview box and scaled back down to the card. These are the numbers.

export type Rect = { x: number; y: number; width: number; height: number };

// The scale of a story laid out at `frameWidth` in a box `width` wide:
// down to the box, never above 100%.
export const thumbScale = (width: number, frameWidth: number) =>
  width > 0 ? Math.min(1, width / frameWidth) : 0.75;

// The frame's own scale: its viewport is `frameWidth` wide, its box is the
// grid's width.
export const frameScale = (gridWidth: number, frameWidth: number) =>
  gridWidth > 0 ? gridWidth / frameWidth : 1;

export type Placement = {
  // The card's preview box, in frame pixels.
  box: Rect;
  // The story's own layout size, before it is scaled to the box.
  width: number;
  height: number;
  // From the story's layout size to frame pixels.
  scale: number;
};

// Where a card's story goes in a frame scaled by `k`, given the card's
// preview box `rect` in grid pixels. The scale comes from `scaleWidth`:
// the gallery passes the box's whole-pixel clientWidth, which a card's own
// frame scales by, so a story looks the same in either.
export const placeStory = (
  rect: Rect,
  frameWidth: number,
  k: number,
  scaleWidth = rect.width
): Placement => {
  const s = thumbScale(scaleWidth, frameWidth);
  return {
    box: {
      x: rect.x / k,
      y: rect.y / k,
      width: rect.width / k,
      height: rect.height / k,
    },
    width: rect.width / s,
    height: rect.height / s,
    scale: s / k,
  };
};

// The order stories render in: cards near the viewport first, then the
// rest, each in the gallery's own order.
export const renderOrder = (ids: string[], near: Set<string>): string[] => [
  ...ids.filter((id) => near.has(id)),
  ...ids.filter((id) => !near.has(id)),
];
