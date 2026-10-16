import React, { ReactNode, useEffect, useRef } from 'react';

import { Tr, colors } from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

import { DragArrange } from '../Arrange/useDragArrange';
import { dragStates, itemFocusRingInset, revealActions } from '../itemStyles';

import GripCell from './GripCell';

// A space, folder or project row. Its title link stretches over the whole row,
// so the row opens with one click and is one stop for the keyboard. The cells
// clip their overflow, which would cut the link's own focus ring, so the row
// shows it instead, inside its edges.
const Row = styled(Tr)`
  position: relative;

  &:hover {
    background: ${colors.grey50};
  }

  ${itemFocusRingInset}
  ${revealActions}
  ${dragStates}

  td {
    height: 36px;
    padding: 0 8px;
    white-space: nowrap;
    overflow: hidden;
  }

  /* The grip's own narrow column. */
  td:first-of-type {
    padding: 0 2px;
  }
`;

interface Props {
  drag: DragArrange;
  children: ReactNode;
}

const ItemRow = ({ drag, children }: Props) => {
  const row = useRef<HTMLTableRowElement>(null);
  const { item } = drag;

  // The library's row only takes a ref object, so the drag and drop connect
  // to the row once it's there.
  useEffect(() => {
    item(row.current);
  }, [item]);

  return (
    <Row innerRef={row} className={drag.dragging ? 'dragging' : undefined}>
      <GripCell handle={drag.handle} />
      {children}
    </Row>
  );
};

export default ItemRow;
