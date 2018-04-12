import React from 'react';
import { get } from 'lodash';
import { adopt } from 'react-adopt';

// components
import ChildComment from './ChildComment';
import Author from './Author';
import ChildCommentForm from './ChildCommentForm';
import CommentsMoreActions from './CommentsMoreActions';
import CommentBody from './CommentBody';
import { browserHistory } from 'react-router';
import Icon from 'components/UI/Icon';

// services
import { updateComment } from 'services/comments';

// resources
import GetLocale, { GetLocaleChildProps } from 'utils/resourceLoaders/components/GetLocale';
import GetTenantLocales, { GetTenantLocalesChildProps } from 'utils/resourceLoaders/components/GetTenantLocales';
import GetAuthUser, { GetAuthUserChildProps } from 'utils/resourceLoaders/components/GetAuthUser';
import GetComment, { GetCommentChildProps } from 'utils/resourceLoaders/components/GetComment';
import GetComments, { GetCommentsChildProps } from 'utils/resourceLoaders/components/GetComments';
import GetUser, { GetUserChildProps } from 'utils/resourceLoaders/components/GetUser';
import GetIdea, { GetIdeaChildProps } from 'utils/resourceLoaders/components/GetIdea';

// analytics
import { injectTracks } from 'utils/analytics';
import tracks from './tracks';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

// style
import styled from 'styled-components';
import { colors } from 'utils/styleUtils';
import { API } from 'typings';

const DeletedIcon = styled(Icon)`
  height: 1em;
  margin-right: 1rem;
  width: 1em;
`;

const StyledMoreActionsMenu = styled(CommentsMoreActions)`
  position: absolute;
  top: 10px;
  right: 20px;
`;

const Container = styled.div`
  margin-top: 35px;
`;

const CommentsWithReplyBoxContainer = styled.div`
  border-radius: 5px;
`;

const CommentsContainer = styled.div`
  border-radius: 5px;
  position: relative;
  border: solid 1px #ddd;
  background: #fff;

  &.hasReplyBox {
    border-bottom-left-radius: 0px;
    border-bottom-right-radius: 0px;
    border-bottom: none;
  }
`;

const CommentContainerInner = styled.div`
  padding: 20px;
  position: relative;

  &.deleted {
    display: flex;
    align-items: center;
    background: ${colors.placeholderBg};
  }
`;

const StyledAuthor = styled(Author)`
  margin-bottom: 20px;
`;

const ChildCommentsContainer = styled.div``;

interface InputProps {
  ideaId: string;
  commentId: string;
}

interface DataProps {
  locale: GetLocaleChildProps;
  tenantLocales: GetTenantLocalesChildProps;
  authUser: GetAuthUserChildProps;
  comment: GetCommentChildProps;
  childComments: GetCommentsChildProps;
  author: GetUserChildProps;
  idea: GetIdeaChildProps;
}

interface Props extends InputProps, DataProps {}

interface State {
  showForm: boolean;
  spamModalVisible: boolean;
  editionMode: boolean;
}

type Tracks = {
  clickReply: Function;
};

class ParentComment extends React.PureComponent<Props & Tracks, State> {
  constructor(props: Props) {
    super(props as any);
    this.state = {
      showForm: false,
      spamModalVisible: false,
      editionMode: false,
    };
  }

  toggleForm = () => {
    this.props.clickReply();
    this.setState({ showForm: true });
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
    const { commentId, authUser, comment, childComments, author, idea } = this.props;

    if (authUser && comment && author && idea) {
      const ideaId = comment.relationships.idea.data.id;
      const authorId = (comment.relationships.author.data ? comment.relationships.author.data.id : null);
      const commentDeleted = (comment.attributes.publication_status === 'deleted');
      const createdAt = comment.attributes.created_at;
      const commentBodyMultiloc = comment.attributes.body_multiloc;
      const commentingEnabled = idea.relationships.action_descriptor.data.commenting.enabled;
      const showCommentForm = (authUser && commentingEnabled && !commentDeleted);
      const childCommentIds = (childComments && childComments.filter((comment) => {
        if (!comment.relationships.parent.data) return false;
        if (comment.attributes.publication_status === 'deleted') return false;
        if (comment.relationships.parent.data.id === commentId) return true;
        return false;
      }).map(comment => comment.id));

      // Hide parent comments that are deleted with no children
      if (comment.attributes.publication_status === 'deleted' && (!childCommentIds || childCommentIds.length === 0)) {
        return null;
      }

      return (
        <Container className="e2e-comment-thread">
          <CommentsWithReplyBoxContainer>
            <CommentsContainer className={`${showCommentForm && 'hasReplyBox'}`}>
              <CommentContainerInner className={`${commentDeleted && 'deleted'}`}>
                {!commentDeleted &&
                  <>
                    <StyledMoreActionsMenu comment={comment} onCommentEdit={this.onCommentEdit} />
                    <StyledAuthor authorId={authorId} createdAt={createdAt} message="parentCommentAuthor" />
                    <CommentBody commentBody={commentBodyMultiloc} editionMode={this.state.editionMode} onCommentSave={this.onCommentSave} onCancelEdition={this.onCancelEdition} />
                  </>
                }

                {commentDeleted &&
                  <>
                    <DeletedIcon name="delete" />
                    <FormattedMessage {...messages.commentDeletedPlaceholder} />
                  </>
                }
              </CommentContainerInner>

              {(childCommentIds && childCommentIds.length > 0) &&
                <ChildCommentsContainer>
                  {childCommentIds.map((childCommentId) => {
                    return (<ChildComment key={childCommentId} commentId={childCommentId} />);
                  })}
                </ChildCommentsContainer>
              }
            </CommentsContainer>

            {showCommentForm &&
              <ChildCommentForm ideaId={ideaId} parentId={commentId} />
            }
          </CommentsWithReplyBoxContainer>
        </Container>
      );
    }

    return null;
  }
}

const Data = adopt<DataProps, InputProps>({
  locale: <GetLocale/>,
  tenantLocales: <GetTenantLocales/>,
  authUser: <GetAuthUser/>,
  comment: ({ commentId, render }) => <GetComment id={commentId}>{render}</GetComment>,
  childComments: ({ ideaId, render }) => <GetComments ideaId={ideaId}>{render}</GetComments>,
  author: ({ comment, render }) => <GetUser id={get(comment, 'relationships.author.data.id')}>{render}</GetUser>,
  idea: ({ comment, render }) => <GetIdea id={get(comment, 'relationships.idea.data.id')}>{render}</GetIdea>,
});

export default (inputProps: InputProps) => {
  const ParentCommentWithTracks = injectTracks<Props>({
    clickReply: tracks.clickReply,
  })(ParentComment);

  return (
    <Data {...inputProps}>
      {dataProps => <ParentCommentWithTracks {...inputProps} {...dataProps} />}
    </Data>
  );
};
