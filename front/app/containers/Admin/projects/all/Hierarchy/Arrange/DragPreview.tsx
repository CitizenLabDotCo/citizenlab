import React, { useCallback } from 'react';

import {
  Box,
  bo,
  colors,
  defaultStyles,
} from '@citizenlab/cl2-component-library';
import { useDragLayer } from 'react-dnd';

import { DraggedItem } from './useDragArrange';

// A copy of the dragged item, as it looks on the page. A table row only lays
// out inside a table, so it gets one, with its cells as wide as the row's.
export const copyOf = (node: HTMLElement) => {
  const copy = node.cloneNode(true);
  if (!(copy instanceof HTMLElement)) return copy;
  // The item fades where it would land; the copy doesn't.
  copy.classList.remove('dragging');
  if (!(node instanceof HTMLTableRowElement)) return copy;

  const widths = [...node.cells].map((cell) => cell.offsetWidth);
  [...copy.children].forEach((cell, index) => {
    if (cell instanceof HTMLElement) cell.style.width = `${widths[index]}px`;
  });
  const table = document.createElement('table');
  table.style.tableLayout = 'fixed';
  table.style.width = `${node.offsetWidth}px`;
  table.style.borderCollapse = 'collapse';
  const body = document.createElement('tbody');
  body.appendChild(copy);
  table.appendChild(body);
  return table;
};

// What follows the pointer while an item is dragged: the item itself, raised
// above the page, rather than the browser's faint picture of it.
const DragPreview = () => {
  const { dragged, offset } = useDragLayer((monitor) => ({
    dragged: monitor.isDragging()
      ? monitor.getItem<DraggedItem | null>() ?? null
      : null,
    offset: monitor.getSourceClientOffset(),
  }));
  const source = dragged?.node;

  // Copied once per drag, when the layer appears.
  const fill = useCallback(
    (layer: HTMLDivElement | null) => {
      if (layer && source) layer.replaceChildren(copyOf(source));
    },
    [source]
  );

  if (!source || !offset) return null;

  // Only a picture of the item: its links and buttons stay with the item.
  return (
    <Box
      aria-hidden
      position="fixed"
      top="0"
      left="0"
      zIndex="1000"
      pointerEvents="none"
      transform={`translate(${offset.x}px, ${offset.y}px)`}
    >
      <Box
        ref={fill}
        width={`${source.offsetWidth}px`}
        bgColor={colors.white}
        borderRadius={bo.borderRadius}
        boxShadow={defaultStyles.boxShadowHoverBig}
      />
    </Box>
  );
};

export default DragPreview;
