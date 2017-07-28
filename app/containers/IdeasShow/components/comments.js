/**
*
* CommentList
*
*/

import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import styled from 'styled-components';
import { FormattedMessage } from 'react-intl';
import { createStructuredSelector } from 'reselect';
// import { Comment } from 'semantic-ui-react';
import ParentComment from './comments/ParentComment';
import selectIdeasShow, { makeSelectComments } from 'containers/IdeasShow/selectors';
import EditorForm from './common/editorForm';
import { publishCommentFork } from '../sagas';
import messages from '../messages';
// import MapChildren from './comments/mapChildren';


const Title = styled.h2`
  font-size: 25px;
  font-weight: bold;
`;

class CommentContainer extends React.Component { // eslint-disable-line react/prefer-stateless-function
  render() {
    const { comments, className, storeCommentError, ideaId } = this.props;
    if (!comments) return null;
    return (
      <div className={className}>
        <Title><FormattedMessage {...messages.commentsTitle} /></Title>

        {storeCommentError && storeCommentError !== '' && <div>
          {storeCommentError}
        </div>}
        <EditorForm
          parentId={null}
          ideaId={ideaId}
          saga={publishCommentFork}
          onSuccess={this.closeEditor}
        />
        {comments.map((comment) =>
          <ParentComment key={comment.id} node={comment} />
        )}
      </div>
    );
  }
}

CommentContainer.propTypes = {
  comments: PropTypes.any,
  className: PropTypes.string,
  storeCommentError: PropTypes.string,
  ideaId: PropTypes.string,
};

const mapStateToProps = createStructuredSelector({
  comments: makeSelectComments,
  storeCommentError: selectIdeasShow('storeCommentError'),
  resetEditorContent: selectIdeasShow('resetEditorContent'),
});

export default connect(mapStateToProps)(CommentContainer);
