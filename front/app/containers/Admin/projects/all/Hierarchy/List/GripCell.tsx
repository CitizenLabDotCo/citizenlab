import React from 'react';

import { Td } from '@citizenlab/cl2-component-library';
import { ConnectDragSource } from 'react-dnd';

import DragHandle from '../Arrange/DragHandle';

interface Props {
  // Left out when the row can't be dragged; the cell stays, to keep the
  // columns in line.
  handle?: ConnectDragSource;
}

// The row's drag grip, in the column before its title.
const GripCell = ({ handle }: Props) => (
  <Td>
    <DragHandle handle={handle} />
  </Td>
);

export default GripCell;
