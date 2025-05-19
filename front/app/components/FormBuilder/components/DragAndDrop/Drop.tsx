import React from 'react';

import { Droppable } from 'react-beautiful-dnd';

type DropProps = {
  id: string;
  type: string;
  children: React.ReactNode;
  isDropDisabled?: boolean;
};

export const Drop = ({
  id,
  type,
  isDropDisabled = false,
  ...props
}: DropProps) => {
  return (
    <Droppable droppableId={id} type={type} isDropDisabled={isDropDisabled}>
      {(provided) => {
        return (
          <div ref={provided.innerRef} {...provided.droppableProps} {...props}>
            {props.children}
            {provided.placeholder}
          </div>
        );
      }}
    </Droppable>
  );
};
