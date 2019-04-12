import React, { PureComponent } from 'react';
import { isNilOrError } from 'utils/helperUtils';

// components
import ParentComment from './ParentComment';

// resources
import GetComments, { GetCommentsChildProps } from 'resources/GetComments';

// style
import styled from 'styled-components';

const Container = styled.div`
  padding-bottom: 80px;
`;

interface InputProps {
  ideaId: string;
  className?: string;
}

interface DataProps {
  comments: GetCommentsChildProps;
}

interface Props extends InputProps, DataProps {}

interface State {}

class Comments extends PureComponent<Props, State> {
  render() {
    const { ideaId, comments, className } = this.props;

    if (!isNilOrError(comments) && comments.length > 0) {
      const parentComments = comments.filter((comment) => {
        return comment.relationships.parent.data === null;
      }).sort((commentA, commentB) => {
        return new Date(commentA.attributes.created_at).getTime() - new Date(commentB.attributes.created_at).getTime();
      });

      if (parentComments && parentComments.length > 0) {
        return (
          <Container className={`e2e-comments-container ${className}`}>
            {parentComments.map((parentComment, _index) => (
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
    {comments => <Comments {...inputProps} comments={comments} />}
  </GetComments>
);
