type Box = { left: number; top: number; width: number; height: number };

// Whether the pointer has passed the middle of the item it's over, coming from
// the side the dragged item is on. Swapping any sooner sends the item under
// the pointer straight back, so the two flicker as they pass. Cards and tiles
// flow across a row, so beside the dragged item the middle is across;
// anywhere else, as for table rows, it's down.
export const hasCrossed = ({
  over,
  dragged,
  pointer,
  forward,
}: {
  over: Box;
  // Where the dragged item shows now.
  dragged: Box;
  pointer: { x: number; y: number };
  // Whether the dragged item comes before the one it's over.
  forward: boolean;
}) => {
  const sameRow = Math.abs(over.top - dragged.top) < over.height / 2;
  const offset = sameRow
    ? pointer.x - (over.left + over.width / 2)
    : pointer.y - (over.top + over.height / 2);
  return forward ? offset > 0 : offset < 0;
};
