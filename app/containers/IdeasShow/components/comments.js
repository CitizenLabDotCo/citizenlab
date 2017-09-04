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
import { Icon } from 'semantic-ui-react';
import ParentComment from './comments/ParentComment';
import selectIdeasShow, { makeSelectComments } from 'containers/IdeasShow/selectors';
import EditorForm from './comments/EditorForm';
import messages from '../messages';

const Title = styled.h2`
  font-size: 25px;
  font-weight: bold;
  margin-bottom: 30px;
`;

class CommentContainer extends React.Component { // eslint-disable-line react/prefer-stateless-function
  render() {
    const { comments, className, ideaId } = this.props;
    if (!comments) return null;
    return (
      <div className={className}>
        <Title>
          <Icon name="comment outline" />
          <FormattedMessage {...messages.commentsTitle} />
        </Title>

        <EditorForm
          parentId={null}
          ideaId={ideaId}
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
  ideaId: PropTypes.string,
};

const mapStateToProps = createStructuredSelector({
  comments: makeSelectComments,
  storeCommentError: selectIdeasShow('storeCommentError'),
  resetEditorContent: selectIdeasShow('resetEditorContent'),
});

export default connect(mapStateToProps)(CommentContainer);
