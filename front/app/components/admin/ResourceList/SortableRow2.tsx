// Implementation based on simple sorting example from docs
// https://react-dnd.github.io/react-dnd/examples/sortable/simple

import React, { useRef, FC } from 'react';
import { DragObjectWithType, useDrag, useDrop } from 'react-dnd-cjs';
import type { Identifier, XYCoord } from 'dnd-core';
import { FlexibleRow } from './FlexibleRow';

const style = {
  cursor: 'move',
};

export interface SortableRowProps {
  id: any;
  text: string;
  index: number;
  isLastItem?: boolean;
  rowHeight?: string;
  children?: React.ReactNode;
  moveRow: (dragIndex: number, hoverIndex: number) => void;
}

interface DragItem {
  index: number;
  id: string;
  type: string;
}

export const SortableRow2: FC<SortableRowProps> = ({
  id,
  isLastItem,
  rowHeight,
  children,
  index,
  moveRow,
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [{ handlerId }, drop] = useDrop<
    DragItem,
    void,
    { handlerId: Identifier | null }
  >({
    accept: 'ROW',
    collect(monitor) {
      return {
        handlerId: monitor.getHandlerId(),
      };
    },
    hover(item: DragItem, monitor) {
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
      const hoverBoundingRect = ref.current?.getBoundingClientRect();

      // Get vertical middle
      const hoverMiddleY =
        (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;

      // Determine mouse position
      const clientOffset = monitor.getClientOffset();

      // Get pixels to the top
      const hoverClientY = (clientOffset as XYCoord).y - hoverBoundingRect.top;

      // Only perform the move when the mouse has crossed half of the items height
      // Dragging downwards
      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
        return;
      }
      // Dragging upwards
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
        return;
      }

      // Perform the move action
      moveRow(dragIndex, hoverIndex);
      item.index = hoverIndex;
    },
  });

  const [{ isDragging }, drag] = useDrag({
    item: { type: 'ROW', id, index } as DragObjectWithType,
    collect: (monitor: any) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const opacity = isDragging ? 0.8 : 1;

  drag(drop(ref));

  return (
    <>
      <div ref={ref} style={{ ...style, opacity }} data-handler-id={handlerId}>
        <FlexibleRow rowHeight={rowHeight} isLastItem={isLastItem}>
          {children}
        </FlexibleRow>
      </div>
    </>
  );
};
