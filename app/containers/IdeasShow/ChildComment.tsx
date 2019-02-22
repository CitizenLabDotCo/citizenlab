// libraries
import React from 'react';
import { adopt } from 'react-adopt';
import clHistory from 'utils/cl-router/history';
import { isNilOrError } from 'utils/helperUtils';

// components
import CommentBody from './CommentBody';
import FeatureFlag from 'components/FeatureFlag';
import { Extra, OfficialHeader, Header, Badge, StyledMoreActionsMenu, OfficialStyledAuthor, StyledAuthor, TranslateButton } from './CommentsStyles';

// services
import { updateComment } from 'services/comments';

// resources
import GetComment, { GetCommentChildProps } from 'resources/GetComment';
import GetIdea, { GetIdeaChildProps } from 'resources/GetIdea';
import GetLocale, { GetLocaleChildProps } from 'resources/GetLocale';

// analytics
import { injectTracks } from 'utils/analytics';
import tracks from './tracks';

// style
import styled from 'styled-components';
import { CLErrorsJSON } from 'typings';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';
import GetUser from 'resources/GetUser';
import { canModerate } from 'services/permissions/rules/projectPermissions';

const CommentContainer = styled.div`
  padding: 20px;
  border-top: solid 1px #d0d0d0;
  position: relative;
`;

interface ITracks {
  clickTranslateCommentButton: () => void;
  clickGoBackToOriginalCommentButton: () => void;
}

interface InputProps {
  commentId: string;
}

interface DataProps {
  comment: GetCommentChildProps;
  idea: GetIdeaChildProps;
  locale: GetLocaleChildProps;
}

interface Props extends InputProps, DataProps {}

interface State {
  spamModalVisible: boolean;
  editionMode: boolean;
  translateButtonClicked: boolean;
}

class ChildComment extends React.PureComponent<Props & ITracks, State> {
  constructor(props: Props) {
    super(props as any);
    this.state = {
      spamModalVisible: false,
      editionMode: false,
      translateButtonClicked: false,
    };
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
    const { comment, idea, locale } = this.props;
    const { editionMode, translateButtonClicked } = this.state;

    if (!isNilOrError(comment) && !isNilOrError(idea) && !isNilOrError(locale)) {
      const className = this.props['className'];
      const commentId = comment.id;
      const authorId = comment.relationships.author.data ? comment.relationships.author.data.id : null;
      const createdAt = comment.attributes.created_at;
      const commentBodyMultiloc = comment.attributes.body_multiloc;
      const projectId = idea.relationships.project.data.id;
      const showTranslateButton = commentBodyMultiloc && !commentBodyMultiloc[locale];

      if (comment.attributes.publication_status !== 'published') return null;

      return (
        <CommentContainer className={`${className} e2e-child-comment`}>

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
                      message={messages.parentCommentAuthor}
                      projectId={projectId}
                      showModeration
                    />
                    <Extra>
                      <Badge>
                        <FormattedMessage {...messages.official} />
                      </Badge>
                      <StyledMoreActionsMenu className="e2e-more-actions" comment={comment} onCommentEdit={this.onCommentEdit} projectId={projectId} />
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
                      message={messages.parentCommentAuthor}
                      projectId={projectId}
                    />
                    <StyledMoreActionsMenu className="e2e-more-actions" comment={comment} onCommentEdit={this.onCommentEdit} projectId={projectId} />
                  </Header>
                );
              }
            }}
          </GetUser>

          <CommentBody
            commentBody={comment.attributes.body_multiloc}
            editionMode={editionMode}
            onCommentSave={this.onCommentSave}
            onCancelEdition={this.onCancelEdition}
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

        </CommentContainer>
      );
    }

    return null;
  }
}

const ChildCommentWithHOCs = injectTracks<Props>(tracks)(ChildComment);

const Data = adopt<DataProps, InputProps>({
  comment: ({ commentId, render }) => <GetComment id={commentId}>{render}</GetComment>,
  idea: ({ comment, render }) => <GetIdea id={(!isNilOrError(comment) ? comment.relationships.idea.data.id : null)}>{render}</GetIdea>,
  locale: <GetLocale />,
});

export default (inputProps: InputProps) => (
  <Data {...inputProps}>
    {dataProps => <ChildCommentWithHOCs {...inputProps} {...dataProps} />}
  </Data>
);
