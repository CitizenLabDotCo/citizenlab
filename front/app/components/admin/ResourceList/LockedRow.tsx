import React, { ReactNode } from 'react';

import { Icon, colors } from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

import { Row } from 'components/admin/ResourceList';
import {
  handleColumnStyles,
  HANDLE_ICON_HEIGHT,
  HANDLE_ICON_WIDTH,
} from 'components/admin/ResourceList/SortableRow';

// The lock reads better a bit larger than the drag arrows, so rather than box it
// into the handle column it is centred on the column's axis and allowed to
// overhang. Locked and sortable rows sit in the same list, so this keeps both
// icons on one vertical line and every row title at the same offset.
const LOCK_ICON_WIDTH = 20;

const LockedDragHandle = styled.div`
  cursor: not-allowed;
  ${handleColumnStyles}
  width: ${HANDLE_ICON_WIDTH}px;
  display: flex;
  justify-content: center;

  /* Being wider than the column, the lock has to be allowed to overhang it —
     without this it is shrunk down to the column's width instead. */
  > svg {
    flex-shrink: 0;
  }
`;

interface Props {
  isLastItem: boolean;
  className?: string;
  children: ReactNode;
  'data-testid'?: string;
}

export default ({
  isLastItem,
  className,
  children,
  'data-testid': dataTestId,
}: Props) => (
  <div className={className} data-testid={dataTestId}>
    <Row isLastItem={isLastItem}>
      <LockedDragHandle className="sortablerow-draghandle">
        {/* The shared icon-box height is what puts the lock on the drag
            handle's baseline; only the width differs. */}
        <Icon
          name="lock"
          width={`${LOCK_ICON_WIDTH}px`}
          height={`${HANDLE_ICON_HEIGHT}px`}
          fill={colors.textSecondary}
        />
      </LockedDragHandle>
      {children}
    </Row>
  </div>
);
