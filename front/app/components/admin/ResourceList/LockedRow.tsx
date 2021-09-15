import React, { ReactNode } from 'react';
import styled from 'styled-components';
import { Row } from 'components/admin/ResourceList';
import { Icon } from 'cl2-component-library';

const LockedDragHandle = styled.div`
  cursor: not-allowed;
  padding: 1rem 0;
  height: 100%;
  margin-right: 16px !important;
`;

const LockIcon = styled(Icon)`
  height: 18px;
  transform: translate(2px, -3px);
`;

interface Props {
  isLastItem: boolean;
  className?: string;
  children: ReactNode;
}

export default ({ isLastItem, className, children }: Props) => (
  <div className={className}>
    <Row isLastItem={isLastItem}>
      <LockedDragHandle className="sortablerow-draghandle">
        <LockIcon name="lock" />
      </LockedDragHandle>
      {children}
    </Row>
  </div>
);
