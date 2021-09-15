import React, { ReactNode } from 'react';
import styled from 'styled-components';
import { Row } from 'components/admin/ResourceList';
import { Icon } from 'cl2-component-library';

const LockedDragHandle = styled.div`
  cursor: not-allowed;
  padding: 1rem 0;
  height: 100%;
`;

const LockIcon = styled(Icon)`
  height: 18px;
  transform: translate(2px, -3px);
`;

interface Props {
  lastItem: boolean;
  className?: string;
  children: ReactNode;
}

export default ({ lastItem, className, children }: Props) => (
  <div className={className}>
    <Row isLastItem={lastItem}>
      <LockedDragHandle className="sortablerow-draghandle">
        <LockIcon name="lock" />
      </LockedDragHandle>
      {children}
    </Row>
  </div>
);
