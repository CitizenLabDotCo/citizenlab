import React, { useRef } from 'react';
import styled from 'styled-components';
import { useDrag, useDrop } from 'react-dnd';
import { Row } from 'components/admin/ResourceList';
import { Icon } from '@citizenlab/cl2-component-library';
import { Identifier, XYCoord } from 'dnd-core';

const DragHandle = styled.div`
  cursor: move;
  padding: 1rem 0;
  height: 100%;
`;

interface Props {
  index: number;
  id: string;
  className?: string;
  isLastItem?: boolean;
  moveRow: (fromIndex: number, toIndex: number) => void;
  dropRow: (itemId: string, toIndex: number) => void;
  children?: React.ReactNode;
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
}: Props) => {
  const ref = useRef<HTMLDivElement | null>(null);
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

  const [{ isDragging }, drag] = useDrag({
    type: itemType,
    item: {
      id,
      index,
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
    end: (_item, monitor) => {
      const { id, index } = monitor.getItem();
      dropRow(id, index);
    },
  });

  const opacity = isDragging ? 0 : 1;

  drag(drop(ref));

  return children ? (
    <div
      style={{ opacity }}
      className={className}
      ref={ref}
      data-handler-id={handlerId}
    >
      <Row isLastItem={isLastItem}>
        <DragHandle className="sortablerow-draghandle">
          <Icon width="12px" name="sort" />
        </DragHandle>
        {children}
      </Row>
    </div>
  ) : null;
};

export default SortableRow;
