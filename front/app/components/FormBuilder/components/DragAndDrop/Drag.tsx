import React, { useEffect, useState } from 'react';

import { Box, colors } from '@citizenlab/cl2-component-library';
import {
  Draggable,
  type DraggableProvided,
  type DraggableProvidedDragHandleProps,
  type DraggableStateSnapshot,
} from '@hello-pangea/dnd';

export type DragHandleProps =
  | (DraggableProvidedDragHandleProps & { 'aria-describedby'?: string })
  | null
  | undefined;

type DragChildren =
  | React.ReactNode
  | ((props: { dragHandleProps: DragHandleProps }) => React.ReactNode);

type DraggableItemProps = {
  id: string;
  children: DragChildren;
  provided: DraggableProvided;
  snapshot: DraggableStateSnapshot;
  useBorder: boolean;
  onDraggingChange: (isDragging: boolean) => void;
};

const DraggableItem = ({
  id,
  children,
  provided,
  snapshot,
  useBorder,
  onDraggingChange,
}: DraggableItemProps) => {
  useEffect(() => {
    onDraggingChange(snapshot.isDragging);
  }, [snapshot.isDragging, onDraggingChange]);

  // Override the library's aria-describedby so the default drag-and-drop
  // screen reader instructions aren't announced — we provide an alternative
  // select-based UI for keyboard users.
  const dragHandleProps: DragHandleProps = provided.dragHandleProps
    ? { ...provided.dragHandleProps, 'aria-describedby': '' }
    : provided.dragHandleProps;

  const border =
    snapshot.isDragging && useBorder ? `1px solid ${colors.teal}` : undefined;

  return (
    <div ref={provided.innerRef} id={id} {...provided.draggableProps}>
      {typeof children === 'function' ? (
        <Box border={border}>{children({ dragHandleProps })}</Box>
      ) : (
        <div {...dragHandleProps}>
          <Box border={border}>{children}</Box>
        </div>
      )}
    </div>
  );
};

type DragProps = {
  id: string;
  index: number;
  children: DragChildren;
  useBorder?: boolean;
  isDragDisabled?: boolean;
  keepElementsWhileDragging?: boolean;
};

export const Drag = ({
  id,
  index,
  children,
  useBorder = true,
  isDragDisabled = false,
  keepElementsWhileDragging = false,
}: DragProps) => {
  const [isDragging, setIsDragging] = useState(false);

  return (
    <>
      {isDragging &&
        keepElementsWhileDragging &&
        typeof children !== 'function' && <>{children}</>}

      <Draggable draggableId={id} index={index} isDragDisabled={isDragDisabled}>
        {(provided, snapshot) => (
          <DraggableItem
            id={id}
            provided={provided}
            snapshot={snapshot}
            useBorder={useBorder}
            onDraggingChange={setIsDragging}
          >
            {children}
          </DraggableItem>
        )}
      </Draggable>
    </>
  );
};
