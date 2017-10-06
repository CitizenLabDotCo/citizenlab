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
  margin-top: 0px;
  margin-bottom: 0px;
`;

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

const StyledAuthor = styled(Author)`
  margin-bottom: 30px;
`;

const StyledTextArea = styled(TextArea)`
  .textarea {
    color: #666;
    font-size: 16px;
    line-height: 24px;
    padding: 12px 30px;
    padding-right: 100px;
    border-color: #e4e4e4;
    background: #fcfcfc;
    border-top-left-radius: 0px;
    border-top-right-radius: 0px;
    box-shadow: inset 0 0 2px rgba(0, 0, 0, .1);

    &:not(:focus):hover {
      border-color: #ccc;
    }

    &:focus {
      border-color: #bbb;
      background: #fcfcfc;
      box-shadow: inset 0 0 2px rgba(0, 0, 0, .3);
    }
  }
`;

const SubmitButton = styled(Button)`
  position: absolute;
  bottom: 12px;
  right: 12px;
  z-index: 2;
`;

const SuccessMessage = styled.p`
  color: #32B67A;
`;

type Props = {
  ideaId: string;
  parentId: string;
};

type Tracks = {
  focusEditor: Function;
  clickCommentPublish: Function;
};

type State = {
  locale: string | null;
  authUser: IUser | null;
  inputValue: string;
  focussed: boolean;
  hasText: boolean;
  processing: boolean;
  errorMessage: string | null;
};

class ChildCommentForm extends React.PureComponent<Props & InjectedIntlProps & Tracks, State> {
  state: State;
  subscriptions: Rx.Subscription[];

  constructor() {
    super();
    this.state = {
      locale: null,
      authUser: null,
      inputValue: '',
      focussed: false,
      hasText: false,
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
      hasText: (inputValue && !_.isEmpty(inputValue)),
      errorMessage: null
    });
  }

  handleEditorOnFocus = () => {
    this.setState({ focussed: true });

    this.props.focusEditor({
      extra: {
        ideaId: this.props.ideaId,
        parentId: this.props.parentId
      },
    });
  }

  handleEditorOnBlur = () => {
    this.setState({ focussed: false });
  }

  handleSubmit = async (event) => {
    const { ideaId, parentId } = this.props;
    const { formatMessage } = this.props.intl;
    const { locale, authUser, inputValue } = this.state;

    event.preventDefault();

    console.log('bleh');

    if (locale && authUser && _.isString(inputValue) && _.trim(inputValue) !== '') {
      this.props.clickCommentPublish({
        extra: {
          ideaId,
          parentId,
          content: inputValue,
        },
      });

      try {
        this.setState({ processing: true });

        await addCommentToComment(ideaId, authUser.data.id, parentId, { [locale]: inputValue });

        this.setState({ 
          inputValue: '',
          hasText: false,
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
      console.log('zolg');
      this.setState({
        errorMessage: formatMessage(messages.emptyCommentError),
        focussed: true,
        processing: false
      });
    } else {
      console.log('wurps');
      this.setState({
        errorMessage: formatMessage(messages.addCommentError),
        focussed: true,
        processing: false
      });
    }
  }

  render() {
    const children = this.props['children'];
    const { formatMessage } = this.props.intl;
    const { authUser, inputValue, focussed, hasText, processing, errorMessage } = this.state;
    const placeholder = formatMessage(messages.childCommentBodyPlaceholder);
    const submitAreaClassNames = classNames({
      error: _.isString(errorMessage)
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
        <StyledTextArea
          name="comment"
          placeholder={placeholder}
          rows={1}
          value={inputValue}
          error={errorMessage}
          onChange={this.handleTextareaOnChange}
          onFocus={this.handleEditorOnFocus}
          onBlur={this.handleEditorOnBlur}
        >
          <SubmitButton
            className="e2e-submit-comment"
            loading={processing}
            circularCorners={false}
            onClick={this.handleSubmit}
            size="1"
            padding="8px 16px"
          >
            <FormattedMessage {...messages.commentReplyButton} />
          </SubmitButton>
        </StyledTextArea>
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

export default injectTracks<Props>({
  focusEditor: tracks.focusNewCommentTextbox,
  clickCommentPublish: tracks.clickCommentPublish,
})(injectIntl<Props>(ChildCommentForm));
