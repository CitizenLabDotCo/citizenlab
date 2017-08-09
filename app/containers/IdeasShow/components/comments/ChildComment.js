import React from 'react';
import PropTypes from 'prop-types';
import { createStructuredSelector } from 'reselect';
import styled from 'styled-components';

import { preprocess } from 'utils';
import { selectResourcesDomain } from 'utils/resources/selectors';
import T from 'containers/T';


// import MapChildren from './MapChildren';
import messages from '../../messages';
import Author from './Author';

const CommentContainer = styled.div`
  border: solid 1px #cdcdcd;
  padding: 25px;
  border-top: none;
`;

const CommentBody = styled.div`
  font-size: 16px;
  color: #8f8f8f;
  padding: 15px 0 15px 50px;
`;


class ChildComment extends React.Component {

  render() {
    const { content, createdAt, authorId } = this.props;
    return (
      <div>
        <CommentContainer>
          <Author authorId={authorId} createdAt={createdAt} message={messages.authorReacted} />
          <CommentBody>
            <T value={content} />
          </CommentBody>
        </CommentContainer>
      </div>
    );
  }
}

ChildComment.propTypes = {
  content: PropTypes.any,
  children: PropTypes.any,
  createdAt: PropTypes.string,
  authorId: PropTypes.string,
  ideaId: PropTypes.string,
  commentId: PropTypes.string,
};


const mapStateToProps = () => createStructuredSelector({
  comment: (state, { node }) => selectResourcesDomain('comments', node.id)(state),
});

const mergeProps = (stateProps) => {
  const { comment } = stateProps;
  // const { id } = ownProps.node;
  const attributes = comment.get('attributes');

  const content = attributes.get('body_multiloc');
  const createdAt = attributes.get('created_at');
  const authorId = comment.getIn(['relationships', 'author', 'data', 'id']);
  // const ideaId = comment.getIn(['relationships', 'idea', 'data', 'id']);
  return {
    comment,
    content,
    createdAt,
    authorId,
  };
};

export default preprocess(mapStateToProps, null, mergeProps)(ChildComment);
