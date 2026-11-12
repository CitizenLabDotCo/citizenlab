import React, { useRef } from 'react';

import { Icon } from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

import useSortableItem from 'hooks/useSortableItem';

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

const itemType = 'ROW';

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
  const { drag, drop, preview, isDragging, handlerId } = useSortableItem({
    type: itemType,
    item: { id, index },
    ref,
    moveRow,
    onDrop: (item) => dropRow?.(item.id, item.index),
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
