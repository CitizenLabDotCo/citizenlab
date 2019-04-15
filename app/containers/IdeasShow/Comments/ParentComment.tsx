import React from 'react';
import { get } from 'lodash-es';
import { adopt } from 'react-adopt';
import { isNilOrError } from 'utils/helperUtils';

// components
import ChildComment from './ChildComment';
import ChildCommentForm from './ChildCommentForm';
import CommentBody from './CommentBody';
import clHistory from 'utils/cl-router/history';
import Icon from 'components/UI/Icon';
import FeatureFlag from 'components/FeatureFlag';

// services
import { updateComment } from 'services/comments';
import { canModerate } from 'services/permissions/rules/projectPermissions';

// resources
import GetAuthUser, { GetAuthUserChildProps } from 'resources/GetAuthUser';
import GetComment, { GetCommentChildProps } from 'resources/GetComment';
import GetComments, { GetCommentsChildProps } from 'resources/GetComments';
import GetIdea, { GetIdeaChildProps } from 'resources/GetIdea';
import GetTenantLocales, { GetTenantLocalesChildProps } from 'resources/GetTenantLocales';
import GetLocale, { GetLocaleChildProps } from 'resources/GetLocale';
import GetUser from 'resources/GetUser';

// analytics
import { injectTracks } from 'utils/analytics';
import tracks from '../tracks';

// i18n
import { FormattedMessage, injectIntl } from 'utils/cl-intl';
import messages from '../messages';
import { InjectedIntlProps } from 'react-intl';

// style
import styled from 'styled-components';
import { CLErrorsJSON } from 'typings';
import { OfficialHeader, Header, OfficialStyledAuthor, StyledAuthor, Extra, Badge, StyledMoreActionsMenu, TranslateButton } from './CommentsStyles';

const DeletedIcon = styled(Icon)`
  height: 1em;
  margin-right: 1rem;
  width: 1em;
`;

const Container = styled.div`
  margin-top: 38px;
`;

const CommentsWithReplyBoxContainer = styled.div`
  border-radius: ${(props: any) => props.theme.borderRadius};
`;

const CommentsContainer = styled.div`
  border-radius: ${(props: any) => props.theme.borderRadius};
  position: relative;
  border: solid 1px #d0d0d0;
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
    align-items: center;
    display: flex;
    font-style: italic;
    font-weight: 500;
  }
`;

const ChildCommentsContainer = styled.div``;

interface InputProps {
  ideaId: string;
  commentId: string;
  last: boolean;
}

interface DataProps {
  authUser: GetAuthUserChildProps;
  comment: GetCommentChildProps;
  childComments: GetCommentsChildProps;
  idea: GetIdeaChildProps;
  locale: GetLocaleChildProps;
  tenantLocales: GetTenantLocalesChildProps;
}

interface Props extends InputProps, DataProps {}

interface State {
  showForm: boolean;
  spamModalVisible: boolean;
  editionMode: boolean;
  translateButtonClicked: boolean;
}

interface ITracks {
  clickReply: () => void;
  clickTranslateCommentButton: () => void;
  clickGoBackToOriginalCommentButton: () => void;
}

class ParentComment extends React.PureComponent<Props & ITracks & InjectedIntlProps, State> {
  constructor(props: Props) {
    super(props as any);
    this.state = {
      showForm: false,
      spamModalVisible: false,
      editionMode: false,
      translateButtonClicked: false,
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
      clHistory.push(link);
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
        const apiErrors = (error as CLErrorsJSON).json.errors;
        setErrors(apiErrors);
        setSubmitting(false);
      }
    }
  }

  translateComment = () => {
    const { clickTranslateCommentButton, clickGoBackToOriginalCommentButton } = this.props;
    const { translateButtonClicked } = this.state;

    // tracking
    translateButtonClicked
    ? clickGoBackToOriginalCommentButton()
    : clickTranslateCommentButton();

    this.setState(prevState => ({
      translateButtonClicked: !prevState.translateButtonClicked,
    }));
  }

  render() {
    const { commentId, authUser, comment, childComments, idea, locale } = this.props;
    const { translateButtonClicked } = this.state;

    if (!isNilOrError(comment) && !isNilOrError(idea) && !isNilOrError(locale)) {
      const ideaId = comment.relationships.idea.data.id;
      const projectId = idea.relationships.project.data.id;
      const authorId = (comment.relationships.author.data ? comment.relationships.author.data.id : null);
      const commentDeleted = (comment.attributes.publication_status === 'deleted');
      const createdAt = comment.attributes.created_at;
      const commentBodyMultiloc = comment.attributes.body_multiloc;
      const commentingEnabled = idea.relationships.action_descriptor.data.commenting.enabled;
      const showCommentForm = (authUser && commentingEnabled && !commentDeleted);
      const childCommentIds = (!isNilOrError(childComments) && childComments.filter((comment) => {
        if (!comment.relationships.parent.data) return false;
        if (comment.attributes.publication_status === 'deleted') return false;
        if (comment.relationships.parent.data.id === commentId) return true;
        return false;
      }).map(comment => comment.id));
      const showTranslateButton = commentBodyMultiloc && !commentBodyMultiloc[locale];

      // Hide parent comments that are deleted with no children
      if (comment.attributes.publication_status === 'deleted' && (!childCommentIds || childCommentIds.length === 0)) {
        return null;
      }

      return (
        <Container className="e2e-comment-thread">
          <CommentsWithReplyBoxContainer>
            <CommentsContainer className={`${showCommentForm && 'hasReplyBox'}`}>
              <CommentContainerInner className={`${commentDeleted && 'deleted'}`}>
                {comment.attributes.publication_status === 'published' &&
                  <>
                    <GetUser id={authorId}>
                      {author => {
                        const authorCanModerate = !isNilOrError(author) && canModerate(projectId, { data: author });
                        if (authorCanModerate) {
                          return (
                            <OfficialHeader>
                              <OfficialStyledAuthor
                                authorId={authorId}
                                notALink={authorId ? false : true}
                                createdAt={createdAt}
                                size="40px"
                                projectId={projectId}
                                showModeration
                              />
                              <Extra>
                                <Badge>
                                  <FormattedMessage {...messages.official} />
                                </Badge>
                                <StyledMoreActionsMenu
                                  ariaLabel={this.props.intl.formatMessage(messages.showMoreActions)}
                                  comment={comment}
                                  onCommentEdit={this.onCommentEdit}
                                  projectId={projectId}
                                />
                              </Extra>
                            </OfficialHeader>
                          );
                        } else {
                          return (
                            <Header>
                              <StyledAuthor
                                authorId={authorId}
                                notALink={authorId ? false : true}
                                createdAt={createdAt}
                                size="40px"
                                projectId={projectId}
                              />
                              <StyledMoreActionsMenu
                                ariaLabel={this.props.intl.formatMessage(messages.showMoreActions)}
                                comment={comment}
                                onCommentEdit={this.onCommentEdit}
                                projectId={projectId}
                              />
                            </Header>
                          );
                        }
                      }}
                    </GetUser>
                    <CommentBody
                      commentBody={comment.attributes.body_multiloc}
                      editionMode={this.state.editionMode}
                      onCommentSave={this.onCommentSave}
                      onCancelEdition={this.onCancelEdition}
                      last={this.props.last}
                      translateButtonClicked={translateButtonClicked}
                      commentId={commentId}
                    />
                    <FeatureFlag name="machine_translations">
                      {showTranslateButton &&
                        <TranslateButton
                          onClick={this.translateComment}
                        >
                          {!this.state.translateButtonClicked
                            ? <FormattedMessage {...messages.translateComment} />
                            : <FormattedMessage {...messages.showOriginalComment} />
                          }
                        </TranslateButton>
                      }
                    </FeatureFlag>
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

const ParentCommentWithTracks = injectTracks<Props>({
  clickReply: tracks.clickReply,
  clickTranslateCommentButton: tracks.clickTranslateCommentButton,
  clickGoBackToOriginalCommentButton: tracks.clickGoBackToOriginalCommentButton
})(injectIntl<Props>(ParentComment));

const Data = adopt<DataProps, InputProps>({
  authUser: <GetAuthUser/>,
  comment: ({ commentId, render }) => <GetComment id={commentId}>{render}</GetComment>,
  childComments: ({ ideaId, render }) => <GetComments ideaId={ideaId}>{render}</GetComments>,
  idea: ({ comment, render }) => <GetIdea id={get(comment, 'relationships.idea.data.id')}>{render}</GetIdea>,
  tenantLocales: <GetTenantLocales />,
  locale: <GetLocale />,
});

export default (inputProps: InputProps) => (
  <Data {...inputProps}>
    {dataProps => <ParentCommentWithTracks {...inputProps} {...dataProps} />}
  </Data>
);
