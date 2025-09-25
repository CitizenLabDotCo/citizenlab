import React, { useEffect, useState, useRef } from 'react';

import { Box, colors } from '@citizenlab/cl2-component-library';
import {
  Draggable,
  type DraggableProvided,
  type DraggableStateSnapshot,
} from '@hello-pangea/dnd';

type DraggableItemProps = {
  id: string;
  children: React.ReactNode;
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
  const draggableRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    onDraggingChange(snapshot.isDragging);
  }, [snapshot.isDragging, onDraggingChange]);

  useEffect(() => {
    // Since we provide an alternative way to reorder items using select dropdowns,
    // we want to override the @hello-pangea/dnd aria description for the drag handle to reduce confusion.
    draggableRef.current?.setAttribute('aria-describedby', '');
  }, []);

  return (
    <div ref={provided.innerRef} id={id} {...provided.draggableProps}>
      <div ref={draggableRef} {...provided.dragHandleProps}>
        <Box
          border={
            snapshot.isDragging && useBorder
              ? `1px solid ${colors.teal}`
              : undefined
          }
        >
          {children}
        </Box>
      </div>
    </div>
  );
};

type DragProps = {
  id: string;
  index: number;
  children: React.ReactNode;
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
      {isDragging && keepElementsWhileDragging && <>{children}</>}

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
