import * as React from 'react';
import * as _ from 'lodash';
import * as Rx from 'rxjs/Rx';

// libraries
import { Link } from 'react-router';
import classNames from 'classnames';

// components
import Button from 'components/UI/Button';
import TextArea from 'components/UI/TextArea';
import Error from 'components/UI/Error';
import Warning from 'components/UI/Warning';
import Author from './Author';

// tracking
import { injectTracks } from 'utils/analytics';
import tracks from './tracks';

// i18n
import { FormattedMessage, injectIntl, InjectedIntl, InjectedIntlProps } from 'react-intl';
import messages from './messages';

// services
import { authUserStream } from 'services/auth';
import { localeStream } from 'services/locale';
import { IUser } from 'services/users';
import { addCommentToIdea, addCommentToComment } from 'services/comments';

// style
import styled from 'styled-components';
import { darken } from 'polished';

const Container = styled.div`
  padding: 0;
  margin: 0;
`;

const CommentContainer = styled.div``;

const SignInMessage = styled.div`
  color: #333;
  font-size: 18px;
  font-weight: 300;
`;

const StyledLink = styled(Link)`
  color: #1391A1;
  text-decoration: underline;
  transition: all 100ms ease-out;

  &:hover {
    text-decoration: underline;
  }
`;

const StyledAuthor = styled(Author)`
  margin-bottom: 10px;
`;

const StyledTextArea = styled(TextArea)`
  .textarea {
    padding: 25px;
    padding-bottom: 70px;
    border-radius: 5px;
    border-color: #ccc;
    background: #fff;
    transition: all 100ms ease-out;
    box-shadow: inset 0 0 2px rgba(0, 0, 0, .1);

    &:not(:focus):hover {
      border-color: #ccc;
    }

    &:focus {
      border-color: #444;
      background: #fff;
      box-shadow: inset 0 0 2px rgba(0, 0, 0, .3);
    }
  }
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
  locale: string | null;
  authUser: IUser | null;
  inputValue: string;
  processing: boolean;
  errorMessage: string | null;
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
      errorMessage: null
    };
  }

  componentWillMount () {
    const locale$ = localeStream().observable;
    const authUser$ = authUserStream().observable;

    this.subscriptions = [
      Rx.Observable.combineLatest(
        locale$,
        authUser$
      ).subscribe(([locale, authUser]) => {
        this.setState({
          locale,
          authUser
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
        await addCommentToIdea(ideaId, authUser.data.id, { [locale]: inputValue });

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
    const { formatMessage } = this.props.intl;
    const { authUser, inputValue, processing, errorMessage } = this.state;
    const placeholder = formatMessage(messages.commentBodyPlaceholder);
    const commentButtonDisabled = (!inputValue || inputValue === '');

    const signInLinkText = (
      <FormattedMessage
        {...messages.signInToComment}
        values={{
          signInLink: <StyledLink to="/sign-in"><FormattedMessage {...messages.signInLinkText} /></StyledLink>,
        }}
      />
    );

    const signUp = (!authUser ? (
      <Warning text={signInLinkText} />
    ) : null);

    const commentForm = (authUser ? (
      <CommentContainer className="e2e-comment-form ideaCommentForm">
        <StyledAuthor authorId={authUser.data.id} />

        <StyledTextArea
          name="comment"
          placeholder={placeholder}
          rows={4}
          value={inputValue}
          error={errorMessage}
          onChange={this.handleTextareaOnChange}
        >
          <SubmitButton
            className="e2e-submit-comment"
            loading={processing}
            circularCorners={false}
            onClick={this.handleSubmit}
            disabled={commentButtonDisabled}
          >
            <FormattedMessage {...messages.publishComment} />
          </SubmitButton>
        </StyledTextArea>
      </CommentContainer>
    ) : null);

    return (
      <Container>
        {signUp}
        {commentForm}
      </Container>
    );
  }
}

export default injectTracks<Props>({
  focusEditor: tracks.focusNewCommentTextbox,
  clickCommentPublish: tracks.clickCommentPublish,
})(injectIntl<Props>(ParentCommentForm));
