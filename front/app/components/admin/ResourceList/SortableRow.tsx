import React, { useRef } from 'react';

import { Icon } from '@citizenlab/cl2-component-library';
import { Identifier, XYCoord } from 'dnd-core';
import { useDrag, useDrop } from 'react-dnd';
import styled from 'styled-components';

import { Row } from 'components/admin/ResourceList';

// Geometry of the handle column on the left of every row. The icon is centred
// in a band of DRAG_HANDLE_HEIGHT, and because that band is taller than most row
// content it also sets the row's minimum content height — that centring is what
// lines the two up. A row whose content outgrows the band (an expanded dropdown,
// a folder with child projects) is no longer centred against it, so it has to
// hold its own first line to the same height. LockedRow reuses all three so a
// locked row's icon lands exactly where a drag handle would.
export const DRAG_HANDLE_HEIGHT = 52;
export const HANDLE_ICON_WIDTH = 12;
export const HANDLE_ICON_HEIGHT = 24;

export const handleColumnStyles = `
  padding: ${(DRAG_HANDLE_HEIGHT - HANDLE_ICON_HEIGHT) / 2}px 0;
  height: 100%;
  align-self: flex-start;
`;

const DragHandle = styled.div`
  cursor: move;
  ${handleColumnStyles}
`;

interface Props {
  index: number;
  id: string;
  className?: string;
  isLastItem?: boolean;
  moveRow: (fromIndex: number, toIndex: number) => void;
  dropRow?: (itemId: string, toIndex: number) => void;
  children?: React.ReactNode;
  dataTestid?: string;
  dragByHandle?: boolean;
  disableNestedStyles?: boolean;
}

interface DragItem {
  index: number;
  id: string;
  type: string;
}

const itemType = 'ROW';

// Used as reference: https://react-dnd.github.io/react-dnd/examples/sortable/simple
const SortableRow = ({
  isLastItem,
  className,
  children,
  id,
  index,
  dropRow,
  moveRow,
  dataTestid,
  dragByHandle = false,
  disableNestedStyles,
}: Props) => {
  const ref = useRef<HTMLDivElement | null>(null);
  const handleRef = useRef<HTMLDivElement | null>(null);
  const [{ handlerId }, drop] = useDrop<
    DragItem,
    void,
    { handlerId: Identifier | null }
  >({
    accept: itemType,
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
      // TODO: Fix this the next time the file is edited.
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      const hoverBoundingRect = ref.current?.getBoundingClientRect();

      // Get vertical middle
      const hoverMiddleY =
        (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;

      // Determine mouse position
      const clientOffset = monitor.getClientOffset();

      // Get pixels to the top
      const hoverClientY = (clientOffset as XYCoord).y - hoverBoundingRect.top;

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
    type: itemType,
    item: {
      id,
      index,
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
    end: (_item, monitor) => {
      if (dropRow) {
        const { id, index } = monitor.getItem();
        dropRow(id, index);
      }
    },
  });

  const opacity = isDragging ? 0 : 1;

  if (dragByHandle) {
    drag(drop(handleRef));
    preview(ref);
  } else {
    drag(drop(ref));
  }

  return children ? (
    <div
      style={{ opacity }}
      className={className}
      ref={ref}
      data-handler-id={handlerId}
      data-testid={dataTestid}
    >
      <Row isLastItem={isLastItem} disableNestedStyles={disableNestedStyles}>
        <DragHandle className="sortablerow-draghandle" ref={handleRef}>
          <Icon
            width={`${HANDLE_ICON_WIDTH}px`}
            height={`${HANDLE_ICON_HEIGHT}px`}
            name="sort"
          />
        </DragHandle>
        {children}
      </Row>
    </div>
  ) : null;
};

export default SortableRow;
