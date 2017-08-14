import React from 'react';
import PropTypes from 'prop-types';
import { createStructuredSelector } from 'reselect';
import styled from 'styled-components';
import { FormattedMessage } from 'react-intl';
import { preprocess } from 'utils';
import { selectResourcesDomain } from 'utils/resources/selectors';
import T from 'containers/T';

import Authorize from 'utils/containers/authorize';
import { injectTracks } from 'utils/analytics';

import messages from '../../messages';
import tracks from '../../tracks';
import ChildComment from './ChildComment';
import Author from './Author';
import Button from 'components/UI/Button';
import EditorForm from './EditorForm';

const ThreadContainer = styled.div`
  margin-top: 45px;
`;

const AuthorContainer = styled.div`
  padding: 10px 0;
`;

const CommentBody = styled.div`
  font-size: 16px;
  color: #8f8f8f;
  padding: 25px;
  border: solid 1px #cdcdcd;
  border-radius: 3px;
`;

const ReactButton = styled(Button)`
  float: right;
  margin-top: 20px;
`;

class ParentComment extends React.Component {

  constructor() {
    super();
    this.state = {
      showForm: false,
    };
  }

  toggleForm = () => {
    this.props.clickReply();
    this.setState({
      showForm: true,
    });
  }

  render() {
    const { content, children, createdAt, ideaId, commentId, authorId } = this.props;
    const { showForm } = this.state;
    return (
      <ThreadContainer>
        <AuthorContainer>
          <Author authorId={authorId} createdAt={createdAt} message={messages.authorSaid} />
        </AuthorContainer>
        <CommentBody>
          <T value={content} />
        </CommentBody>
        {children && children.map(((node) => <ChildComment key={node.id} node={node} />))}
        <Authorize action={['comments', 'create']}>
          {!showForm &&
            <ReactButton onClick={this.toggleForm}>
              <FormattedMessage {...messages.commentReplyButton} />
            </ReactButton>
          }
          {showForm &&
            <EditorForm
              ideaId={ideaId}
              parentId={commentId}
            />
          }
        </Authorize>
      </ThreadContainer>
    );
  }
}

ParentComment.propTypes = {
  content: PropTypes.any,
  children: PropTypes.any,
  createdAt: PropTypes.string,
  authorId: PropTypes.string,
  ideaId: PropTypes.string,
  commentId: PropTypes.string,
  clickReply: PropTypes.func,
};


const mapStateToProps = () => createStructuredSelector({
  comment: (state, { node }) => selectResourcesDomain('comments', node.id)(state),
});

const mergeProps = (stateProps, dispatchProps, ownProps) => {
  const { comment } = stateProps;
  const { id, children } = ownProps.node;
  const attributes = comment.get('attributes');

  const content = attributes.get('body_multiloc');
  const createdAt = attributes.get('created_at');
  const authorId = comment.getIn(['relationships', 'author', 'data', 'id']);
  const ideaId = comment.getIn(['relationships', 'idea', 'data', 'id']);
  return {
    comment,
    content,
    createdAt,
    children,
    authorId,
    commentId: id,
    ideaId,
  };
};

export default preprocess(mapStateToProps, null, mergeProps)(
  injectTracks({
    clickReply: tracks.clickReply,
  })(ParentComment)
);
