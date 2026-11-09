import { RefObject } from 'react';

import { Identifier } from 'dnd-core';
import { useDrag, useDrop } from 'react-dnd';

interface DragItem {
  index: number;
}

interface Params<T extends DragItem> {
  type: string;
  item: T;
  ref: RefObject<HTMLElement>;
  moveRow: (fromIndex: number, toIndex: number) => void;
  onDrop?: (item: T) => void;
  canDrag?: boolean;
}

// Used as reference: https://react-dnd.github.io/react-dnd/examples/sortable/simple
const useSortableItem = <T extends DragItem>({
  type,
  item: dragItem,
  ref,
  moveRow,
  onDrop,
  canDrag = true,
}: Params<T>) => {
  const { index } = dragItem;

  const [{ handlerId }, drop] = useDrop<
    T,
    void,
    { handlerId: Identifier | null }
  >({
    accept: type,
    collect(monitor) {
      return {
        handlerId: monitor.getHandlerId(),
      };
    },
    hover(item: T, monitor) {
      if (!ref.current) {
        return;
      }
      const dragIndex = item.index;
      const hoverIndex = index;

      // Don't replace items with themselves
      if (dragIndex === hoverIndex) {
        return;
      }

      // Determine rectangle on screen
      const hoverBoundingRect = ref.current.getBoundingClientRect();

      // Get vertical middle
      const hoverMiddleY =
        (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;

      // Determine mouse position
      const clientOffset = monitor.getClientOffset();
      if (!clientOffset) {
        return;
      }

      // Get pixels to the top
      const hoverClientY = clientOffset.y - hoverBoundingRect.top;

      // Only perform the move when the mouse has crossed half of the items height
      // When dragging downwards, only move when the cursor is below 50%
      // When dragging upwards, only move when the cursor is above 50%

      // Dragging downwards
      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
        return;
      }

      // Dragging upwards
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
        return;
      }

      // Time to actually perform the action
      moveRow(dragIndex, hoverIndex);

      // Note: we're mutating the monitor item here!
      // Generally it's better to avoid mutations,
      // but it's good here for the sake of performance
      // to avoid expensive index searches.
      item.index = hoverIndex;
    },
  });

  const [{ isDragging }, drag, preview] = useDrag({
    type,
    item: dragItem,
    canDrag,
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
    end: (_item, monitor) => {
      if (onDrop) {
        onDrop(monitor.getItem());
      }
    },
  });

  return { drag, drop, preview, isDragging, handlerId };
};

export default useSortableItem;
