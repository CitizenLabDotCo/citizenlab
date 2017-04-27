import React from 'react';
import PropTypes from 'prop-types';
import { SearchResult } from 'semantic-ui-react';

import { T } from '../T';

// renders one Search.Result (wrapped by IdeasSearchResultWrapper) coming from <Search />
// We use a custom render as wrapper for T component to: handle multiloc title
const IdeasSearchResult = (props) => {
  console.log(props);
  const { id, title } = props; // eslint-disable-line react/prop-types
  return (
    <div
      className="title"
    >
      <T value={title} />
    </div>
  );
};

IdeasSearchResult.propTypes = {
  title: PropTypes.object.isRequired, // multiloc
  childKey: PropTypes.string.isRequired,
};

export default IdeasSearchResult;
