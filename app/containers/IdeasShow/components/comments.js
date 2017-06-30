/**
*
* CommentList
*
*/

import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';
import { Comment } from 'semantic-ui-react';
import selectIdeasShow, { makeSelectComments } from 'containers/IdeasShow/selectors';

import MapChildren from './comments/mapChildren';


class CommentContainer extends React.Component { // eslint-disable-line react/prefer-stateless-function
  render() {
    const { comments, className, storeCommentError } = this.props;
    if (!comments) return null;
    return (
      <div className={className}>
        {storeCommentError && storeCommentError !== '' && <div>
          {storeCommentError}
        </div>}
        <Comment.Group minimal>
          <MapChildren
            nodes={comments}
          />
        </Comment.Group>
      </div>
    );
  }
}

CommentContainer.propTypes = {
  comments: PropTypes.any,
  className: PropTypes.string,
  storeCommentError: PropTypes.string,
};

const mapStateToProps = createStructuredSelector({
  comments: makeSelectComments,
  storeCommentError: selectIdeasShow('storeCommentError'),
  resetEditorContent: selectIdeasShow('resetEditorContent'),
});

export default connect(mapStateToProps)(CommentContainer);
