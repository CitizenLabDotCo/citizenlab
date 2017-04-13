/**
*
* Image
*
*/

import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

function Comment(props) {
  return (
    <div className={props.className}>
      <span dangerouslySetInnerHTML={{ __html: props.commentContent.en }} />
      ... parentId: {props.parentId}
      ... created at: {props.createdAt}
      ... modified at: {props.modifiedAt}
      <hr />
    </div>
  );
}

Comment.propTypes = {
  className: PropTypes.string,
  commentContent: PropTypes.object.isRequired,
  parentId: PropTypes.string,
  createdAt: PropTypes.any,
  modifiedAt: PropTypes.any,
};

export default styled(Comment)`
    // no style yet
`;
