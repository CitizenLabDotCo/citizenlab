import React, { PureComponent } from 'react';
import { isNilOrError } from 'utils/helperUtils';

// components
import ParentComment from './ParentComment';
import CommentSorting from './CommentSorting';

// services
import { ICommentData } from 'services/comments';

// resources
import GetComments, { GetCommentsChildProps } from 'resources/GetComments';

// style
import styled from 'styled-components';

const Container = styled.div`
  margin-top: 30px;
`;

const StyledCommentSorting = styled(CommentSorting)`
  display: flex;
  justify-content: flex-end;
  margin-bottom: 15px;
`;

interface InputProps {
  ideaId: string;
  className?: string;
}

interface DataProps {
  comments: GetCommentsChildProps;
}

interface Props extends InputProps, DataProps {}

interface State {
  sortOrder: 'oldest_to_newest' | 'most_upvoted';
  parentComments: ICommentData[];
}

class Comments extends PureComponent<Props, State> {
  constructor(props) {
    super(props);
    this.state = {
      sortOrder: 'oldest_to_newest',
      parentComments: []
    };
  }

  componentDidMount() {
    this.setAndSortParentComments();
  }

  componentDidUpdate(prevProps: Props, prevState: State) {
    if (prevProps.comments !== this.props.comments || prevState.sortOrder !== this.state.sortOrder) {
      this.setAndSortParentComments();
    }
  }

  setAndSortParentComments = () => {
    const { comments } = this.props;
    const { sortOrder } = this.state;
    let parentComments: ICommentData[] = [];

    if (!isNilOrError(comments) && comments.length > 0) {
      if (sortOrder === 'oldest_to_newest') {
        parentComments = comments.filter((comment) => {
          return comment.relationships.parent.data === null;
        }).sort((commentA, commentB) => {
          return new Date(commentA.attributes.created_at).getTime() - new Date(commentB.attributes.created_at).getTime();
        });
      } else {
        parentComments = comments.filter((comment) => {
          return comment.relationships.parent.data === null;
        }).sort((commentA, commentB) => {
          if (commentB.attributes.upvotes_count === commentA.attributes.upvotes_count) {
            return new Date(commentA.attributes.created_at).getTime() - new Date(commentB.attributes.created_at).getTime();
          }

          return commentB.attributes.upvotes_count - commentA.attributes.upvotes_count;
        });
      }
    }

    this.setState({ parentComments });
  }

  handleSortOnChange = (sortOrder: 'oldest_to_newest' | 'most_upvoted') => {
    this.setState({ sortOrder });
  }

  render() {
    const { ideaId, comments, className } = this.props;
    const { parentComments } = this.state;

    if (parentComments && parentComments.length > 0) {
      return (
        <Container className={`e2e-comments-container ${className}`}>
          <StyledCommentSorting onChange={this.handleSortOnChange} />

          {parentComments.map((parentComment, _index) => {
            const childCommentIds = (!isNilOrError(comments) && comments.filter((comment) => {
              if (comment.relationships.parent.data &&
                  comment.relationships.parent.data.id === parentComment.id &&
                  comment.attributes.publication_status !== 'deleted'
              ) {
                return true;
              }

              return false;
            }).map(comment => comment.id));

            return (
              <ParentComment
                key={parentComment.id}
                ideaId={ideaId}
                commentId={parentComment.id}
                childCommentIds={childCommentIds}
              />
            );
          })}
        </Container>
      );
    }

    return null;
  }
}

export default (inputProps: InputProps) => (
  <GetComments ideaId={inputProps.ideaId}>
    {comments => <Comments {...inputProps} comments={comments} />}
  </GetComments>
);
