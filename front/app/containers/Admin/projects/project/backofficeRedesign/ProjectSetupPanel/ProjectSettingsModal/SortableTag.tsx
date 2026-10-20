import React, { ReactNode, RefObject, useRef } from 'react';

import { Box, Icon, colors } from '@citizenlab/cl2-component-library';
import { useDrag, useDrop } from 'react-dnd';

export const ROOT_TAG_TYPE = 'tag-root';

interface DragItem {
  id: string;
  index: number;
}

export interface SortableTagRenderProps {
  rowRef: RefObject<HTMLDivElement>;
  handle: ReactNode;
}

interface Props {
  id: string;
  index: number;
  // Rows only accept drops of the same type, so each group gets its own and
  // a subtag cannot be dragged into another group.
  type: string;
  dragLabel: string;
  moveRow: (fromIndex: number, toIndex: number) => void;
  dropRow: (id: string) => void;
  cancelDrag: () => void;
  children: (renderProps: SortableTagRenderProps) => ReactNode;
}

// Not ResourceList's SortableRow/SortableList: those render their own row,
// handle and DndProvider, and the nested groups here need a custom row and
// one shared provider.
const SortableTag = ({
  id,
  index,
  type,
  dragLabel,
  moveRow,
  dropRow,
  cancelDrag,
  children,
}: Props) => {
  const ref = useRef<HTMLDivElement>(null);
  const rowRef = useRef<HTMLDivElement>(null);

  const [, drop] = useDrop<DragItem>({
    accept: type,
    hover(item, monitor) {
      const rect = ref.current?.getBoundingClientRect();
      const offset = monitor.getClientOffset();
      if (!rect || !offset || item.index === index) return;

      // Swap once the pointer crosses the middle of the hovered tag. This only
      // stays stable when tags are the same height, which is why groups
      // collapse while a root tag is dragged.
      const middle = rect.top + rect.height / 2;
      if (item.index < index && offset.y < middle) return;
      if (item.index > index && offset.y > middle) return;

      moveRow(item.index, index);
      item.index = index;
    },
  });

  const [{ isDragging }, drag, preview] = useDrag({
    type,
    item: { id, index },
    collect: (monitor) => ({ isDragging: monitor.isDragging() }),
    end: (item, monitor) => {
      if (monitor.didDrop()) {
        dropRow(item.id);
      } else {
        cancelDrag();
      }
    },
  });

  drag(rowRef);
  drop(preview(ref));

  const handle = (
    <Box
      display="flex"
      alignItems="center"
      flexShrink={0}
      aria-label={dragLabel}
    >
      <Icon name="sort" width="10px" height="16px" fill={colors.coolGrey500} />
    </Box>
  );

  return (
    <Box ref={ref} opacity={isDragging ? 0.4 : 1}>
      {children({ rowRef, handle })}
    </Box>
  );
};

export default SortableTag;
