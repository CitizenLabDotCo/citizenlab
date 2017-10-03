import * as React from 'react';
import * as _ from 'lodash';
import * as Rx from 'rxjs/Rx';

// libraries
import { Link } from 'react-router';
import classNames from 'classnames';

// components
import Button from 'components/UI/Button';
import TextArea from 'components/UI/TextArea';
import Avatar from 'components/Avatar';

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

const Container = styled.div``;

const CommentContainer = styled.div``;

const SignInMessage = styled.div`
  color: #333;
  font-size: 18px;
  font-weight: 300;

  a {
    color: ${(props) => props.theme.colorMain};
    text-decoration: none;
    transition: all 100ms ease-out;

    &:hover {
      color: ${(props) => darken(0.15, props.theme.colorMain)};
      text-decoration: underline;
    }
  }
`;

const UserArea = styled.div`
  align-items: center;
  display: flex;
  margin-bottom: 10px;
`;

const UserAvatar = styled(Avatar)`
  width: 30px;
  height: 30px;
  margin-right: 8px;
`;

const UserName = styled.div`
  color: #1391A1;
  font-size: 16px;
  line-height: 20px;
  font-weight: 400;
`;

const StyledTextArea = styled(TextArea)`
  textarea {
    background: #f8f8f8;

    &:focus,
    &:active {
      background: #f8f8f8;
    }
  }
`;

const SubmitButton = styled(Button)``;

const SuccessMessage = styled.p`
  color: #32B67A;
`;

const SubmitArea = styled.div`
  align-items: center;
  display: flex;
  justify-content: space-between;
  margin: -5rem 1px 0 1px;
  padding: 1rem;
  position: relative;
  z-index: 1;

  &.success,
  &.error {
    background: linear-gradient(0deg,rgba(255,255,255,.95) 85%, rgba(255,255,255, 0));
  }

  .message {
    font-weight: 500;
  }
`;

type Props = {
  parentId?: string;
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
  success: boolean;
};

class EditorForm extends React.PureComponent<Props & InjectedIntlProps & Tracks, State> {
  state: State;
  subscriptions: Rx.Subscription[];

  constructor() {
    super();
    this.state = {
      locale: null,
      authUser: null,
      inputValue: '',
      processing: false,
      errorMessage: null,
      success: false
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
    this.setState({ inputValue });
  }

  handleEditorOnFocus = () => {
    this.props.focusEditor({
      extra: {
        ideaId: this.props.ideaId,
        parentId: this.props.parentId
      },
    });
  }

  handleSubmit = async (event) => {
    const { ideaId, parentId } = this.props;
    const { formatMessage } = this.props.intl;
    const { locale, authUser, inputValue } = this.state;

    event.preventDefault();

    this.setState({ errorMessage: null, processing: false, success: false });

    if (locale && authUser && inputValue && _.trim(inputValue) !== '') {
      this.props.clickCommentPublish({
        extra: {
          ideaId,
          parentId,
          content: inputValue,
        },
      });

      try {
        this.setState({ processing: true });

        if (!parentId) {
          await addCommentToIdea(ideaId, authUser.data.id, { [locale]: inputValue });
        } else {
          await addCommentToComment(ideaId, authUser.data.id, parentId, { [locale]: inputValue });
        }

        this.setState({ inputValue: '', processing: false, success: true });
        setTimeout(() => this.setState({ success: false }), 6000);
      } catch (error) {
        this.setState({ errorMessage: formatMessage(messages.addCommentError), processing: false });
        throw error;
      }

    } else if (locale && authUser && !inputValue || inputValue === '') {
      this.setState({ errorMessage: formatMessage(messages.emptyCommentError), processing: false });
    }
  }

  render() {
    const { formatMessage } = this.props.intl;
    const { authUser, inputValue, processing, errorMessage, success } = this.state;
    const placeholder = formatMessage(messages.commentBodyPlaceholder);
    const submitAreaClassNames = classNames({
      error: _.isString(errorMessage),
      success: (success === true)
    });

    const signUp = (!authUser ? (
      <SignInMessage>
        <FormattedMessage
          {...messages.signInToComment}
          values={{
            signInLink: <Link to="/sign-in"><FormattedMessage {...messages.signInLinkText} /></Link>,
          }}
        />
      </SignInMessage>
    ) : null);

    const comment = (authUser ? (
      <CommentContainer>
        <UserArea>
          <UserAvatar userId={authUser.data.id} size="medium" />
          <UserName>
            {authUser.data.attributes.first_name} {authUser.data.attributes.last_name}
          </UserName>
        </UserArea>

        <StyledTextArea
          name="comment"
          placeholder={placeholder}
          rows={10}
          value={inputValue}
          error={errorMessage}
          onChange={this.handleTextareaOnChange}
        />
      </CommentContainer>
    ) : null);

    return (
      <Container>
        {signUp}
        {comment}
      </Container>
    );
  }
}

/*
      <Authorize action={['comments', 'create']}>
        <CommentForm onSubmit={this.handleSubmit} className="e2e-comment-form">
          {authUser &&
            <UserArea>
              <UserAvatar userId={authUser.data.id} size="medium" />
              <UserName>
                {authUser.data.attributes.first_name} {authUser.data.attributes.last_name}
              </UserName>
            </UserArea>
          }

          <Editor
            id="editor"
            value={this.state.editorState}
            placeholder={formatMessage(messages.commentBodyPlaceholder)}
            onChange={this.handleEditorOnChange}
            onFocus={this.handleEditorOnFocus}
          />

          <SubmitArea className={submitAreaClassNames}>
            <div className="message">
              {errorMessage && <div className="e2e-error-message">{errorMessage}</div>}

              {success &&
                <SuccessMessage className="e2e-success-message">
                  <FormattedMessage {...messages.commentSuccess} />
                </SuccessMessage>
              }
            </div>

            <SubmitButton className="e2e-submit-comment" loading={processing}>
              <FormattedMessage {...messages.publishComment} />
            </SubmitButton>
          </SubmitArea>

        </CommentForm>
        <Else>
          <FormattedMessage
            {...messages.signInToComment}
            values={{
              signInLink: <Link to="/sign-in"><FormattedMessage {...messages.signInLinkText} /></Link>,
            }}
          />
        </Else>
      </Authorize>
*/

export default injectTracks<Props>({
  focusEditor: tracks.focusNewCommentTextbox,
  clickCommentPublish: tracks.clickCommentPublish,
})(injectIntl<Props>(EditorForm));
