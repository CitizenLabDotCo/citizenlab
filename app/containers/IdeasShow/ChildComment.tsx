// libraries
import React from 'react';
import { get } from 'lodash';
import { adopt } from 'react-adopt';
import { browserHistory } from 'react-router';

// components
import Author from './Author';
import CommentBody from './CommentBody';

// services
import { updateComment } from 'services/comments';

// resources
import GetComment, { GetCommentChildProps } from 'resources/GetComment';
import GetUser, { GetUserChildProps } from 'resources/GetUser';
import GetIdea, { GetIdeaChildProps } from 'resources/GetIdea';

// style
import styled from 'styled-components';
import CommentsMoreActions from './CommentsMoreActions';
import { API } from 'typings';

const StyledMoreActionsMenu = styled(CommentsMoreActions)`
  position: absolute;
  top: 10px;
  right: 20px;
`;

const CommentContainer = styled.div`
  padding: 20px;
  border-top: solid 1px #ddd;
  position: relative;
`;

const StyledAuthor = styled(Author)`
  margin-bottom: 20px;
`;

interface InputProps {
  commentId: string;
}

interface DataProps {
  comment: GetCommentChildProps;
  author: GetUserChildProps;
  ideaLoaderState: GetIdeaChildProps;
}

interface Props extends InputProps, DataProps {}

interface State {
  spamModalVisible: boolean;
  editionMode: boolean;
}

class ChildComment extends React.PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      spamModalVisible: false,
      editionMode: false,
    };
  }

  captureClick = (event) => {
    if (event.target.classList.contains('mention')) {
      event.preventDefault();
      const link = event.target.getAttribute('data-link');
      browserHistory.push(link);
    }
  }

  onCommentEdit = () => {
    this.setState({ editionMode: true });
  }

  onCancelEdition = () => {
    this.setState({ editionMode: false });
  }

  onCommentSave = async (comment, formikActions) => {
    const { setSubmitting, setErrors } = formikActions;

    try {
      await updateComment(this.props.commentId, comment);
      this.setState({ editionMode: false });
    } catch (error) {
      if (error && error.json) {
        const apiErrors = (error as API.ErrorResponse).json.errors;
        setErrors(apiErrors);
        setSubmitting(false);
      }
    }
  }

  render() {
    const { comment, author, ideaLoaderState: { idea } } = this.props;
    const { editionMode } = this.state;

    if (comment && author && idea) {
      const className = this.props['className'];
      const authorId = comment.relationships.author.data ? comment.relationships.author.data.id : null;
      const createdAt = comment.attributes.created_at;
      const commentBodyMultiloc = comment.attributes.body_multiloc;
      const projectId = idea.relationships.project.data.id;

      return (
        <CommentContainer className={className}>
          <StyledMoreActionsMenu
            comment={comment}
            onCommentEdit={this.onCommentEdit}
            projectId={projectId}
          />

          <StyledAuthor
            authorId={authorId}
            createdAt={createdAt}
            message="childCommentAuthor"
          />

          <CommentBody
            commentBody={commentBodyMultiloc}
            editionMode={editionMode}
            onCommentSave={this.onCommentSave}
            onCancelEdition={this.onCancelEdition}
          />
        </CommentContainer>
      );
    }

    return null;
  }
}

const Data = adopt<DataProps, InputProps>({
  comment: ({ commentId, render }) => <GetComment id={commentId}>{render}</GetComment>,
  author: ({ comment, render }) => <GetUser id={get(comment, 'relationships.author.data.id')}>{render}</GetUser>,
  ideaLoaderState: ({ comment, render }) => <GetIdea id={get(comment, 'relationships.idea.data.id')}>{render}</GetIdea>,
});

export default (inputProps: InputProps) => (
  <Data {...inputProps}>
    {dataProps => <ChildComment {...inputProps} {...dataProps} />}
  </Data>
);
