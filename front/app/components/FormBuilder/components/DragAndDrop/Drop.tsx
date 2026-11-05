import React from 'react';

import { Droppable } from '@hello-pangea/dnd';

type DropProps = {
  id: string;
  type: string;
  children: React.ReactNode;
  isDropDisabled?: boolean;
  'data-cy'?: string;
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
