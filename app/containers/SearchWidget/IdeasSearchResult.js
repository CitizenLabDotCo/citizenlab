import React from 'react';
import PropTypes from 'prop-types';

import { T } from '../T';

// renders one Search.Result (wrapped by IdeasSearchResultWrapper) coming from <Search />
// We use a custom render as wrapper for T component to: handle multiloc title
const IdeasSearchResult = (props) => {
  const { titleMultiloc } = props; // eslint-disable-line react/prop-types
  return (
    <div
      className="title"
      // key={childKey}
    >
      <T value={titleMultiloc} />
    </div>
  );
};

IdeasSearchResult.propTypes = {
  titleMultiloc: PropTypes.object.isRequired,
};

export default IdeasSearchResult;
