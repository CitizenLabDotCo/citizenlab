import React from 'react';
import PropTypes from 'prop-types';

import { Comment } from 'semantic-ui-react';

import Show from './show';

const MapChildren = ({ nodes }) => {
  if (!nodes[0]) return null;
  return (
    <Comment.Group>
      {nodes.map(((node) => <Show key={node.id} node={node} />))}
    </Comment.Group>
  );
};

MapChildren.propTypes = {
  nodes: PropTypes.array,
};

export default MapChildren;
