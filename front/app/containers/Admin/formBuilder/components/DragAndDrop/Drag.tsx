import React from 'react';
import { Draggable } from 'react-beautiful-dnd';

export const Drag = ({ id, index, ...props }) => {
  return (
    <Draggable draggableId={id} index={index}>
      {(provided) => {
        return (
          <div ref={provided.innerRef} {...provided.draggableProps} {...props}>
            <div {...provided.dragHandleProps}>{props.children}</div>
          </div>
        );
      }}
    </Draggable>
  );
};
