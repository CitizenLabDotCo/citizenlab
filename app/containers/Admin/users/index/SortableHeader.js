import React from 'react';
import { FormattedMessage } from 'react-intl';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import { Icon } from 'semantic-ui-react';

import messages from './messages';

const SortableLink = styled.a`
  color: rgba(0, 0, 0, 0.87);
  cursor: pointer;
`;

const SortableHeader = (props) => {
  const { name, direction, onToggle } = props;
  return (
    <SortableLink onClick={onToggle}>
      <FormattedMessage {...messages[name]} />
      {direction &&
        <Icon name={direction === 'asc' ? 'caret up' : 'caret down'} />
      }
    </SortableLink>
  );
};

SortableHeader.propTypes = {
  name: PropTypes.string,
  direction: PropTypes.string,
  onToggle: PropTypes.func,
};

export default SortableHeader;
