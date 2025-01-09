import React from 'react';

import { Box, colors } from '@citizenlab/cl2-component-library';
import { Draggable } from 'react-beautiful-dnd';

type DragProps = {
  id: string;
  index: number;
  children: React.ReactNode;
  useBorder?: boolean;
};

export const Drag = ({ id, index, useBorder = true, ...props }: DragProps) => {
  return (
    <Draggable draggableId={id} index={index}>
      {(provided, snapshot) => {
        return (
          <div ref={provided.innerRef} {...provided.draggableProps} {...props}>
            <div {...provided.dragHandleProps}>
              <Box
                border={
                  snapshot.isDragging && useBorder
                    ? `1px solid ${colors.teal}`
                    : undefined
                }
              >
                {props.children}
              </Box>
            </div>
          </div>
        );
      }}
    </Draggable>
  );
};
