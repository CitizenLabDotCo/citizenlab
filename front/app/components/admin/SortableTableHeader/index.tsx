import React, { FC } from 'react';
import styled from 'styled-components';
import { Icon } from 'semantic-ui-react';

const SortableLink = styled.a`
  color: rgba(0, 0, 0, 0.87);
  cursor: pointer;
  display: flex;
`;

interface Props {
  direction?: 'ascending' | 'descending' | null;
  onToggle: () => void;
}

const SortableTableHeader: FC<Props> = ({ children, ...props }) => {
  const { direction, onToggle } = props;

  return (
    <SortableLink onClick={onToggle}>
      {children}
      {direction && (
        <Icon name={direction === 'ascending' ? 'caret up' : 'caret down'} />
      )}
    </SortableLink>
  );
};

export default SortableTableHeader;
