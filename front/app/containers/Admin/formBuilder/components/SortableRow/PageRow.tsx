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
import { colors, defaultStyles } from 'utils/styleUtils';

// components
import { Box } from '@citizenlab/cl2-component-library';

export interface SortableRowProps {
  id: string;
  index: number;
  pageIndex: number;
  fieldIndex: number;
  isLastItem?: boolean;
  rowHeight?: string;
  py?: string;
  children?: React.ReactNode;
  moveRow?: (dragIndex: number, hoverIndex: number) => void;
  dropRow?: (initialIndex: number, finalIndex: number) => void;
  handleReorder: (
    initialFieldIndex: number,
    finalFieldIndex: number,
    initialPageIndex: number,
    finalPageIndex: number
  ) => void;
}

interface DragItem {
  index: number;
  pageIndex: number;
  fieldIndex: number;
  id: string;
  type: string;
}

export const PageRow: FC<SortableRowProps> = ({
  id,
  index,
  isLastItem,
  rowHeight,
  py,
  children,
  pageIndex,
  fieldIndex,
  moveRow,
  dropRow,
  handleReorder,
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [{ handlerId, isOver }, drop] = useDrop<
    DragItem,
    void,
    { handlerId: Identifier | null; isOver: boolean }
  >({
    accept: ['PAGEROW', 'ROW'],
    collect(monitor) {
      return {
        handlerId: monitor.getHandlerId(),
        isOver: !!monitor.isOver() && pageIndex !== monitor.getItem().pageIndex,
        // isOver: !!monitor.isOver(),
      };
    },
    drop: (item, monitor) => {
      // if (!ref.current) {
      //   return;
      // }
      // if (dropRow) {
      //   const dragPageIndex = item.pageIndex;
      //   const hoverPageIndex = pageIndex;
      //   const dragFieldIndex = item.fieldIndex;
      //   const hoverFieldIndex = fieldIndex;

      //   dropRow(dragPageIndex, hoverPageIndex);
      //   item.pageIndex = hoverPageIndex;
      //   item.fieldIndex = hoverFieldIndex;
      // }
      console.log('drop', item);
      console.log('pageIndex', pageIndex);
      console.log('fieldIndex', fieldIndex);
      console.log('index', index);
      handleReorder(item.fieldIndex, fieldIndex, item.pageIndex, pageIndex);
    },
    hover(item: DragItem, monitor) {
      if (!ref.current) {
        return;
      }
      const dragPageIndex = item.pageIndex;
      const hoverPageIndex = pageIndex;
      const dragFieldIndex = item.fieldIndex;
      const hoverFieldIndex = fieldIndex;

      // console.log('item', item)
      // console.log('fieldIndex', fieldIndex)
      // console.log('dragPageIndex', dragPageIndex)
      // console.log('hoverPageIndex', hoverPageIndex)
      // console.log('dragFieldIndex', dragFieldIndex)
      // console.log('hoverFieldIndex', hoverFieldIndex)

      // Don't replace items with themselves
      if (
        dragPageIndex === hoverPageIndex &&
        dragFieldIndex === hoverFieldIndex
      ) {
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
      if (dragPageIndex < hoverPageIndex && hoverClientY < hoverMiddleY) {
        return;
      }
      // Dragging upwards
      // if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
      //   return;
      // }

      // Perform the move action
      if (moveRow) {
        moveRow(dragPageIndex, hoverPageIndex);
      }
      // console.log('hoverIndex', hoverPageIndex);
      // console.log('dragIndex', dragPageIndex);
      item.pageIndex = hoverPageIndex;
      item.fieldIndex = hoverFieldIndex;
    },
  });

  const [{ isDragging }, drag] = useDrag({
    item: { type: 'PAGEROW', id, pageIndex, fieldIndex } as DragObjectWithType,
    collect: (monitor: DragSourceMonitor) => ({
      isDragging: monitor.isDragging(),
    }),
    end(item: DragItem) {
      // console.log('item on Drop', item)
      // console.log('pageIndex on Drop', pageIndex)
      if (dropRow) {
        dropRow(pageIndex, item.pageIndex);
      }
    },
  });

  const opacity = isDragging ? 0.8 : 1;

  drag(drop(ref));

  return (
    <>
      <div
        ref={ref}
        style={{ cursor: 'move', opacity }}
        data-handler-id={handlerId}
      >
        <Box boxShadow={isOver ? `0 0 2px 2px ${colors.teal300}` : undefined}>
          <FlexibleRow
            rowHeight={rowHeight}
            isLastItem={isLastItem}
            flexDirection="column"
            py={py}
            // isOver={isOver}
          >
            {children}
          </FlexibleRow>

          {isOver && (
            <Box height="1px" borderTop={`1px solid ${colors.divider}`} />
          )}
        </Box>
      </div>
    </>
  );
};
