import React from 'react';

// components
import ParentComment from './ParentComment';

// resources
import GetComments, { GetCommentsChildProps } from 'utils/resourceLoaders/components/GetComments';

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
    super(props as any);
    this.state = {
      newCommentId: null
    };
  }

  commentsSortingFunc = (commentA, commentB) => {
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
            {parentComments.sort(this.commentsSortingFunc).map((parentComment) => (
              <ParentComment
                key={parentComment.id}
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
