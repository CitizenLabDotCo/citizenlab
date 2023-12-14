import React from 'react';
import { Draggable } from 'react-beautiful-dnd';
import { Box, colors } from '@citizenlab/cl2-component-library';

type DragProps = {
  id: string;
  index: number;
  children: React.ReactNode;
};

export const Drag = ({ id, index, ...props }: DragProps) => {
  return (
    <Draggable draggableId={id} index={index}>
      {(provided, snapshot) => {
        return (
          <div ref={provided.innerRef} {...provided.draggableProps} {...props}>
            <div {...provided.dragHandleProps}>
              <Box
                border={
                  snapshot.isDragging ? `1px solid ${colors.teal}` : undefined
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
