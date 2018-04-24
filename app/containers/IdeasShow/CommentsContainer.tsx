import React from 'react';

// components
import ParentComment from './ParentComment';

// services
import { ICommentData } from 'services/comments';

// resources
import GetComments, { GetCommentsChildProps } from 'resources/GetComments';

// style
import styled from 'styled-components';

const Container = styled.div``;

interface InputProps {
  ideaId: string;
}

interface DataProps {
  comments: GetCommentsChildProps;
}

interface Props extends InputProps, DataProps {}

interface State {
  newCommentId: string | null;
}

class CommentsContainer extends React.PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      newCommentId: null
    };
  }

  sortCommentsByDateAscending = (commentA: ICommentData, commentB: ICommentData) => {
    return new Date(commentA.attributes.created_at).getTime() - new Date(commentB.attributes.created_at).getTime();
  }

  render() {
    const className = `${this.props['className']} e2e-comments`;
    const { ideaId, comments } = this.props;

    if (comments && comments.length > 0) {
      const parentComments = comments.filter(comment => comment.relationships.parent.data === null);

      if (parentComments && parentComments.length > 0) {
        return (
          <Container className={`e2e-comments-container ${className}`}>
            {parentComments.sort(this.sortCommentsByDateAscending).map((parentComment, index) => (
              <ParentComment
                key={parentComment.id}
                last={index === parentComments.length - 1}
                ideaId={ideaId}
                commentId={parentComment.id}
              />
            ))}
          </Container>
        );
      }
    }

    return null;
  }
}

export default (inputProps: InputProps) => (
  <GetComments ideaId={inputProps.ideaId}>
    {comments => <CommentsContainer {...inputProps} comments={comments} />}
  </GetComments>
);
