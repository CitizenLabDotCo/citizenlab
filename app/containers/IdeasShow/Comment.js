/**
*
* Image
*
*/

import React from 'react';
import PropTypes from 'prop-types';
import T from 'containers/T';

import IdeaContent from './IdeaContent';

function Comment(props) {
  const { className, commentContent, createdAt, modifiedAt } = props;

  return (
    <div className={className}>
      <IdeaContent>
        <T value={commentContent} />
      </IdeaContent>
      ... created at: {createdAt}
      ... modified at: {modifiedAt}
    </div>
  );
}

Comment.propTypes = {
  className: PropTypes.string,
  commentContent: PropTypes.object.isRequired,
  createdAt: PropTypes.any,
  modifiedAt: PropTypes.any,
};

export default Comment;
