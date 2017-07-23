import React from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import { Icon } from 'semantic-ui-react';

const SortableLink = styled.a`
  color: rgba(0, 0, 0, 0.87);
  cursor: pointer;
`;

const SortableTableHeader = (props) => {
  const { direction, onToggle } = props;
  return (
    <SortableLink onClick={onToggle}>
      {props.children}
      {direction &&
        <Icon name={direction === 'asc' ? 'caret up' : 'caret down'} />
      }
    </SortableLink>
  );
};

SortableTableHeader.propTypes = {
  direction: PropTypes.string,
  onToggle: PropTypes.func,
  children: PropTypes.element,
};

export default SortableTableHeader;
