import React from 'react';
import PropTypes from 'prop-types';
// import styled from 'styled-components';

const getIcon = (iconName) => {
  switch (iconName) {
    case 'close': {
      return <svg height="100%" viewBox="0 0 24 24"><path d="M19.07 4.93C15.17 1.025 8.833 1.025 4.93 4.93c-3.903 3.902-3.903 10.238 0 14.142 3.903 3.902 10.24 3.902 14.143 0 3.905-3.904 3.904-10.24 0-14.143zm-2.828 9.898l-1.414 1.414L12 13.414l-2.83 2.828-1.413-1.414L10.587 12l-2.83-2.83L9.17 7.758l2.83 2.83 2.828-2.83 1.414 1.414L13.414 12l2.828 2.828z" /></svg>;
    }
    default:
      return null;
  }
};

const Icon = ({ iconName }) => getIcon(iconName);

Icon.propTypes = {
  iconName: PropTypes.string.isRequired,
};

export default Icon;
