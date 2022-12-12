// Implementation based on simple sorting example from docs
// https://react-dnd.github.io/react-dnd/examples/sortable/simple

import React, { useRef, FC } from 'react';
import {
  DragObjectWithType,
  DragSourceMonitor,
  useDrag,
  useDrop,
} from 'react-dnd-cjs';
import type { Identifier, XYCoord } from 'dnd-core';
import { FlexibleRow } from './FlexibleRow';
import { colors } from 'utils/styleUtils';

// components
import { Box } from '@citizenlab/cl2-component-library';

export interface SortableRowProps {
  id: string;
  index: number;
  pageIndex: number;
  isLastItem?: boolean;
  rowHeight?: string;
  children?: React.ReactNode;
  moveRow?: (
    dragIndex: number,
    hoverIndex: number,
    dragPageIndex?: number,
    hoverPageIndex?: number
  ) => void;
  dropRow?: (
    initialFieldIndex: number,
    finalFieldIndex: number,
    nextFieldId: string,
    initialPageIndex: number,
    finalPageIndex: number
  ) => void;
  accept?: string | string[];
  dragType?: string;
  nextFieldId: string;
}

interface DragItem {
  index: number;
  pageIndex: number;
  id: string;
  type: string;
  nextFieldId: string;
}

export const SortableRow: FC<SortableRowProps> = ({
  id,
  isLastItem,
  rowHeight,
  children,
  index,
  pageIndex,
  moveRow,
  dropRow,
  nextFieldId,
  accept,
  dragType,
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [{ handlerId, isOver }, drop] = useDrop<
    DragItem,
    void,
    { handlerId: Identifier | null; isOver: boolean }
  >({
    accept: 'ROW',
    collect(monitor) {
      const isOnSamePage = monitor.getItem()?.pageIndex === pageIndex;
      const isSameField = monitor.getItem()?.index === index && isOnSamePage;
      return {
        handlerId: monitor.getHandlerId(),
        isOver: !!monitor.isOver() && !isSameField,
      };
    },
    // canDrop(item, monitor) {
    //   return item.pageIndex !== 0;
    //   // return item.pageIndex === pageIndex;
    // },
    hover(item: DragItem, monitor) {
      if (!ref.current) {
        return;
      }
      const dragIndex = item.index;
      const hoverIndex = index;
      const dragPageIndex = item.pageIndex;
      const hoverPageIndex = pageIndex;

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
      if (moveRow) {
        moveRow(dragIndex, hoverIndex, dragPageIndex, hoverPageIndex);
      }
      item.index = hoverIndex;
      item.pageIndex = hoverPageIndex;
    },
  });

  const [{ isDragging }, drag] = useDrag({
    item: { type: 'ROW', id, index, pageIndex } as DragObjectWithType,
    collect: (monitor: DragSourceMonitor) => ({
      isDragging: monitor.isDragging(),
    }),
    end(item: DragItem) {
      // console.log('end dropped on', item);
      if (dropRow) {
        dropRow(index, item.index, nextFieldId, pageIndex, item.pageIndex);
      }
    },
  });

  const opacity = isDragging ? 0.8 : 1;
  const marginTop = isOver ? '8px' : '0px';

  drag(drop(ref));

  return (
    <>
      <div
        ref={ref}
        style={{ cursor: 'move', opacity }}
        data-handler-id={handlerId}
      >
        <FlexibleRow
          rowHeight={rowHeight}
          isLastItem={isLastItem}
          // isOver={isOver}
        >
          {children}
        </FlexibleRow>
        {isOver && <Box height="3px" border={`4px solid ${colors.divider}`} />}
      </div>
    </>
  );
};
