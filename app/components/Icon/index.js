import React from 'react';
import PropTypes from 'prop-types';
// import styled from 'styled-components';

const getIcon = (name) => {
  switch (name) {
    case 'close': {
      return <svg height="100%" viewBox="0 0 24 24"><path d="M19.07 4.93C15.17 1.025 8.833 1.025 4.93 4.93c-3.903 3.902-3.903 10.238 0 14.142 3.903 3.902 10.24 3.902 14.143 0 3.905-3.904 3.904-10.24 0-14.143zm-2.828 9.898l-1.414 1.414L12 13.414l-2.83 2.828-1.413-1.414L10.587 12l-2.83-2.83L9.17 7.758l2.83 2.83 2.828-2.83 1.414 1.414L13.414 12l2.828 2.828z" /></svg>;
    }
    case 'upload': {
      return <svg height="100%" viewBox="0 0 24 24"><path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM14 13v4h-4v-4H7l5-5 5 5h-3z" /></svg>;
    }
    default:
      return null;
  }
};

const Icon = ({ name }) => getIcon(name);

Icon.propTypes = {
  name: PropTypes.string.isRequired,
};

export default Icon;
