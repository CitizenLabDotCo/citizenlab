import React, { useEffect } from 'react';

import { Box, colors } from '@citizenlab/cl2-component-library';
import { Draggable } from 'react-beautiful-dnd';

type DragProps = {
  id: string;
  index: number;
  children: React.ReactNode;
  useBorder?: boolean;
};

export const Drag = ({ id, index, useBorder = true, children }: DragProps) => {
  const draggableRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Since we provide an alternative way to reorder items using select dropdowns,
    // we want to override the react-beautiful-dnd aria description for the drag handle to reduce confusion.
    draggableRef.current?.setAttribute('aria-describedby', '');
  }, []);

  return (
    <Draggable draggableId={id} index={index}>
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
