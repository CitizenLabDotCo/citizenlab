import React from 'react';
import PropTypes from 'prop-types';

// search results wrapper rendered to handle custom props (title multi loc)
const IdeasSearchResultWrapper = (props) => {
  const { className, children, onClick } = props; // eslint-disable-line react/prop-types
  return (
    <div
      className={className}
    >
      <button onClick={(e) => onClick(e)}>
        {children}
      </button>
    </div>
  );
};

IdeasSearchResultWrapper.PropTypes = {
  className: PropTypes.string,
  children: PropTypes.any.isRequired,
};

export default IdeasSearchResultWrapper;
