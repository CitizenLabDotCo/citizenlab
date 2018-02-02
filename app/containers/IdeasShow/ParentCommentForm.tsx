import * as React from 'react';
import * as _ from 'lodash';
import * as Rx from 'rxjs/Rx';

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
import { authUserStream } from 'services/auth';
import { localeStream } from 'services/locale';
import { ideaByIdStream, IIdeaData } from 'services/ideas';
import { IUser } from 'services/users';
import { addCommentToIdea } from 'services/comments';

// style
import styled from 'styled-components';
import { Locale } from 'typings';

const Container = styled.div`
  padding: 0;
  margin: 0;
`;

const CommentContainer = styled.div``;

const StyledTextArea = styled(MentionsTextArea)`
  .textareaWrapper__highlighter,
  textarea {
    font-size: 18px !important;
    line-height: 26px !important;
    font-weight: 300 !important;
  }
`;

const StyledAuthor = styled(Author)`
  margin-bottom: 10px;
`;

const SubmitButton = styled(Button)`
  position: absolute;
  bottom: 24px;
  right: 20px;
  z-index: 2;
`;

type Props = {
  ideaId: string;
};

type Tracks = {
  focusEditor: Function;
  clickCommentPublish: Function;
};

type State = {
  locale: Locale | null;
  authUser: IUser | null;
  inputValue: string;
  processing: boolean;
  errorMessage: string | null;
  commentingEnabled: boolean | null;
  commentingDisabledReason: IIdeaData['relationships']['action_descriptor']['data']['commenting']['disabled_reason'] | null;
  projectId: string | null;
};

class ParentCommentForm extends React.PureComponent<Props & InjectedIntlProps & Tracks, State> {
  state: State;
  subscriptions: Rx.Subscription[];

  constructor(props: Props) {
    super(props as any);
    this.state = {
      locale: null,
      authUser: null,
      inputValue: '',
      processing: false,
      errorMessage: null,
      commentingEnabled: null,
      commentingDisabledReason: null,
      projectId: null,
    };
  }

  componentWillMount () {
    const locale$ = localeStream().observable;
    const authUser$ = authUserStream().observable;
    const idea$ = ideaByIdStream(this.props.ideaId).observable;
    this.subscriptions = [
      Rx.Observable.combineLatest(
        locale$,
        authUser$,
        idea$,
      ).subscribe(([locale, authUser, idea]) => {

        this.setState({
          locale,
          authUser,
          commentingEnabled: idea.data.relationships.action_descriptor.data.commenting.enabled,
          commentingDisabledReason: idea.data.relationships.action_descriptor.data.commenting.disabled_reason,
          projectId: idea.data.relationships.project.data.id,
        });
      })
    ];
  }

  componentWillUnmount() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
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
    const { ideaId } = this.props;
    const { formatMessage } = this.props.intl;
    const { locale, authUser, inputValue } = this.state;

    event.preventDefault();

    this.setState({
      errorMessage: null,
      processing: false
    });

    if (locale && authUser && _.isString(inputValue) && _.trim(inputValue) !== '') {
      this.props.clickCommentPublish({
        extra: {
          ideaId,
          content: inputValue
        }
      });

      try {
        this.setState({ processing: true });
        await addCommentToIdea(ideaId, authUser.data.id, { [locale]: inputValue.replace(/\@\[(.*?)\]\((.*?)\)/gi, '@$2') });

        this.setState({
          inputValue: '',
          processing: false
        });
      } catch (error) {
        this.setState({
          errorMessage: formatMessage(messages.addCommentError),
          processing: false
        });

        throw error;
      }
    } else if (locale && authUser && (!inputValue || inputValue === '')) {
      this.setState({ errorMessage: formatMessage(messages.emptyCommentError), processing: false });
    }
  }

  render() {
    const { ideaId } = this.props;
    const { formatMessage } = this.props.intl;
    const { authUser, inputValue, processing, errorMessage, commentingEnabled, commentingDisabledReason, projectId } = this.state;
    const placeholder = formatMessage(messages.commentBodyPlaceholder);
    const commentButtonDisabled = (!inputValue || inputValue === '');

    const commentForm = (authUser && (
      <CommentContainer className="e2e-comment-form ideaCommentForm">
        <StyledAuthor authorId={authUser.data.id} />

        <StyledTextArea
          name="comment"
          placeholder={placeholder}
          rows={8}
          ideaId={ideaId}
          padding="25px 25px 70px 25px"
          value={inputValue}
          error={errorMessage}
          onChange={this.handleTextareaOnChange}
        >
          <SubmitButton
            className="e2e-submit-comment"
            processing={processing}
            circularCorners={false}
            onClick={this.handleSubmit}
            disabled={commentButtonDisabled}
          >
            <FormattedMessage {...messages.publishComment} />
          </SubmitButton>
        </StyledTextArea>
      </CommentContainer>
    ));

    return (
      <Container>
        <CommentingDisabled
          isLoggedIn={!!authUser}
          commentingEnabled={commentingEnabled}
          commentingDisabledReason={commentingDisabledReason}
          projectId={projectId}
        />
        {authUser && commentingEnabled === true && commentForm}
      </Container>
    );
  }
}

export default injectTracks<Props>({
  focusEditor: tracks.focusNewCommentTextbox,
  clickCommentPublish: tracks.clickCommentPublish,
})(injectIntl<Props>(ParentCommentForm));
