// libraries
import React from 'react';
import { adopt } from 'react-adopt';
import clHistory from 'utils/cl-router/history';
import { isNilOrError } from 'utils/helperUtils';
import { isArray } from 'lodash-es';

// components
import Author from 'components/Author';
import CommentBody from './CommentBody';
import { TranslateButton } from './ParentComment';

// services
import { updateComment } from 'services/comments';

// resources
import GetComment, { GetCommentChildProps } from 'resources/GetComment';
import GetIdea, { GetIdeaChildProps } from 'resources/GetIdea';
import GetTenantLocales, { GetTenantLocalesChildProps } from 'resources/GetTenantLocales';
import GetLocale, { GetLocaleChildProps } from 'resources/GetLocale';

// analytics
import { injectTracks } from 'utils/analytics';
import tracks from './tracks';

// style
import styled from 'styled-components';
import CommentsMoreActions from './CommentsMoreActions';
import { CLErrorsJSON } from 'typings';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

const StyledMoreActionsMenu = styled(CommentsMoreActions)`
  position: absolute;
  top: 10px;
  right: 20px;
`;

const CommentContainer = styled.div`
  padding: 20px;
  border-top: solid 1px #d0d0d0;
  position: relative;
`;

const StyledAuthor = styled(Author)`
  margin-bottom: 20px;
  margin-right: 60px;
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
  tenantLocales: GetTenantLocalesChildProps;
}

interface Props extends InputProps, DataProps {}

interface State {
  spamModalVisible: boolean;
  editionMode: boolean;
  translateButtonClicked: boolean;
}

class ChildComment extends React.PureComponent<Props & ITracks, State> {
  constructor(props: Props & ITracks) {
    super(props);
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

  translateComment = (commentId: string) => () => {
    const { clickTranslateCommentButton, clickGoBackToOriginalCommentButton } = this.props;
    const { translateButtonClicked } = this.state;

    // tracking
    translateButtonClicked
    ? clickGoBackToOriginalCommentButton()
    : clickTranslateCommentButton();

    // to be implemented

    this.setState(prevState => ({
      translateButtonClicked: !prevState.translateButtonClicked,
    }));
  }

  render() {
    const { comment, idea, tenantLocales, locale } = this.props;
    const { editionMode } = this.state;
    const multipleLocales = isArray(tenantLocales) && tenantLocales.length > 1;

    if (!isNilOrError(comment) && !isNilOrError(idea)) {
      const className = this.props['className'];
      const commentId = comment.id;
      const authorId = comment.relationships.author.data ? comment.relationships.author.data.id : null;
      const createdAt = comment.attributes.created_at;
      const commentBodyMultiloc = comment.attributes.body_multiloc;
      const projectId = idea.relationships.project.data.id;
      const ideaLocale = Object.keys(idea.attributes.title_multiloc)[0];

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
            message={messages.childCommentAuthor}
            size="40px"
          />

          <CommentBody
            commentBody={commentBodyMultiloc}
            editionMode={editionMode}
            onCommentSave={this.onCommentSave}
            onCancelEdition={this.onCancelEdition}
          />

          {multipleLocales && locale !== ideaLocale &&
            <TranslateButton
              onClick={this.translateComment(commentId)}
            >
              {!this.state.translateButtonClicked
                ? <FormattedMessage {...messages.translateComment} />
                : <FormattedMessage {...messages.showOriginalComment} />
              }
            </TranslateButton>
          }
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
  tenantLocales: <GetTenantLocales />,
  locale: <GetLocale />,
});

export default (inputProps: InputProps) => (
  <Data {...inputProps}>
    {dataProps => <ChildCommentWithHOCs {...inputProps} {...dataProps} />}
  </Data>
);
