import React, { useEffect } from 'react';

import { Box, colors } from '@citizenlab/cl2-component-library';
import { Draggable } from '@hello-pangea/dnd';

type DragProps = {
  id: string;
  index: number;
  children: React.ReactNode;
  useBorder?: boolean;
  isDragDisabled?: boolean;
};

export const Drag = ({
  id,
  index,
  useBorder = true,
  children,
  isDragDisabled = false,
}: DragProps) => {
  const draggableRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Since we provide an alternative way to reorder items using select dropdowns,
    // we want to override the @hello-pangea/dnd aria description for the drag handle to reduce confusion.
    draggableRef.current?.setAttribute('aria-describedby', '');
  }, []);

  return (
    <Draggable draggableId={id} index={index} isDragDisabled={isDragDisabled}>
      {(provided, snapshot) => {
        return (
          <div ref={provided.innerRef} {...provided.draggableProps}>
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
      }}
    </Draggable>
  );
};
