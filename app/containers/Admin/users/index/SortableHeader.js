import React from 'react';
import { FormattedMessage } from 'react-intl';
import PropTypes from 'prop-types';
import { Icon } from 'semantic-ui-react';

import messages from './messages';

const SortableHeader = (props) => {
  const { name, direction, onToggle } = props;
  return (
    <a onClick={onToggle}>
      <FormattedMessage {...messages[name]} />
      {direction &&
        <Icon name={direction === 'asc' ? 'caret up' : 'caret down'} />
      }
    </a>
  );
};

SortableHeader.propTypes = {
  name: PropTypes.string,
  direction: PropTypes.string,
  onToggle: PropTypes.func,
};

export default SortableHeader;
