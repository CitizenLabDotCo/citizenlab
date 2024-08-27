import React, { ReactNode } from 'react';

import { Icon, colors } from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

import { Row } from 'components/admin/ResourceList';

const LockedDragHandle = styled.div`
  cursor: not-allowed;
  padding: 1rem 0;
  height: 100%;
  margin-right: 16px !important;
`;

const LockIcon = styled(Icon)`
  transform: translate(2px, -3px);
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
        <LockIcon
          name="lock"
          width="20px"
          height="20px"
          fill={colors.textSecondary}
        />
      </LockedDragHandle>
      {children}
    </Row>
  </div>
);
