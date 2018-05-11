import React from 'react';
import { isString, trim, get } from 'lodash';
import { adopt } from 'react-adopt';
import { isNilOrError } from 'utils/helperUtils';

// components
import Button from 'components/UI/Button';
import MentionsTextArea from 'components/UI/MentionsTextArea';
import Author from './Author';
import CommentingDisabled from './CommentingDisabled';

// tracking
import { injectTracks } from 'utils/analytics';
import tracks from './tracks';

// i18n
import { InjectedIntlProps } from 'react-intl';
import { FormattedMessage, injectIntl } from 'utils/cl-intl';
import messages from './messages';

// services
import { addCommentToIdea } from 'services/comments';

// resources
import GetLocale, { GetLocaleChildProps } from 'resources/GetLocale';
import GetAuthUser, { GetAuthUserChildProps } from 'resources/GetAuthUser';
import GetIdea, { GetIdeaChildProps } from 'resources/GetIdea';

// style
import styled from 'styled-components';

const Container = styled.div`
  padding: 0;
  margin: 0;
`;

const CommentContainer = styled.div``;

const StyledTextArea = styled(MentionsTextArea)`
  .textareaWrapper__highlighter,
  textarea {
    font-size: 17px !important;
    line-height: 25px !important;
    font-weight: 300 !important;
    padding-right: 20px !important;
    padding-left: 20px !important;
    background: #fff !important;
  }
`;

const StyledAuthor = styled(Author)`
  margin-bottom: 10px;
`;

const SubmitButton = styled(Button)`
  position: absolute;
  bottom: 18px;
  right: 18px;
  z-index: 2;
`;

interface InputProps {
  ideaId: string;
}

interface DataProps {
  locale: GetLocaleChildProps;
  authUser: GetAuthUserChildProps;
  idea: GetIdeaChildProps;
}

interface Props extends InputProps, DataProps {}

interface Tracks {
  focusEditor: Function;
  clickCommentPublish: Function;
}

interface State {
  inputValue: string;
  processing: boolean;
  errorMessage: string | null;
}

class ParentCommentForm extends React.PureComponent<Props & InjectedIntlProps & Tracks, State> {
  constructor(props: Props) {
    super(props as any);
    this.state = {
      inputValue: '',
      processing: false,
      errorMessage: null
    };
  }

  handleTextareaOnChange = (inputValue) => {
    this.setState({
      inputValue,
      errorMessage: null
    });
  }

  handleEditorOnFocus = () => {
    this.props.focusEditor({
      extra: {
        ideaId: this.props.ideaId
      }
    });
  }

  handleSubmit = async (event) => {
    const { locale, authUser, ideaId } = this.props;
    const { formatMessage } = this.props.intl;
    const { inputValue } = this.state;

    event.preventDefault();

    this.setState({
      errorMessage: null,
      processing: false
    });

    if (locale && authUser && isString(inputValue) && trim(inputValue) !== '') {
      this.props.clickCommentPublish({
        extra: {
          ideaId,
          content: inputValue
        }
      });

      try {
        this.setState({ processing: true });
        await addCommentToIdea(ideaId, authUser.id, { [locale]: inputValue.replace(/\@\[(.*?)\]\((.*?)\)/gi, '@$2') });
        this.setState({ inputValue: '', processing: false });
      } catch (error) {
        const errorMessage = formatMessage(messages.addCommentError);
        this.setState({ errorMessage, processing: false });
        throw error;
      }
    } else if (locale && authUser && (!inputValue || inputValue === '')) {
      const errorMessage = formatMessage(messages.emptyCommentError);
      this.setState({ errorMessage, processing: false });
    }
  }

  render() {
    const { authUser, idea, ideaId } = this.props;
    const { formatMessage } = this.props.intl;
    const { inputValue, processing, errorMessage } = this.state;
    const commentingEnabled = (!isNilOrError(idea) ? get(idea.relationships.action_descriptor.data.commenting, 'enabled', false) : false);
    const commentingDisabledReason = (!isNilOrError(idea) ? get(idea.relationships.action_descriptor.data.commenting, 'disabled_reason', null) : null);
    const projectId = (!isNilOrError(idea) ? get(idea.relationships.project.data, 'id', null) : null);
    const placeholder = formatMessage(messages.commentBodyPlaceholder);
    const commentButtonDisabled = (!inputValue || inputValue === '');
    const canComment = (authUser && commentingEnabled);

    return (
      <Container>
        <CommentingDisabled
          isLoggedIn={!!authUser}
          commentingEnabled={commentingEnabled}
          commentingDisabledReason={commentingDisabledReason}
          projectId={projectId}
        />
        {(authUser && canComment) &&
          <CommentContainer className="e2e-comment-form ideaCommentForm">
            <StyledAuthor authorId={authUser.id} />

            <StyledTextArea
              name="comment"
              placeholder={placeholder}
              rows={8}
              ideaId={ideaId}
              padding="20px 20px 80px 20px"
              value={inputValue}
              error={errorMessage}
              onChange={this.handleTextareaOnChange}
            >
              <SubmitButton
                className="e2e-submit-comment"
                processing={processing}
                icon="send"
                circularCorners={false}
                onClick={this.handleSubmit}
                disabled={commentButtonDisabled}
              >
                <FormattedMessage {...messages.publishComment} />
              </SubmitButton>
            </StyledTextArea>
          </CommentContainer>
        }
      </Container>
    );
  }
}

const ParentCommentFormWithHoCs = injectTracks<Props>({
  focusEditor: tracks.focusNewCommentTextbox,
  clickCommentPublish: tracks.clickCommentPublish,
})(injectIntl<Props>(ParentCommentForm));

const Data = adopt<DataProps, InputProps>({
  locale: <GetLocale />,
  authUser: <GetAuthUser />,
  idea: ({ ideaId, render }) => <GetIdea id={ideaId}>{render}</GetIdea>
});

export default (inputProps: InputProps) => (
  <Data {...inputProps}>
    {dataProps => <ParentCommentFormWithHoCs {...inputProps} {...dataProps} />}
  </Data>
);
