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
import Icon from 'components/UI/Icon';
import Author from './Author';
import MentionsTextArea from 'components/UI/MentionsTextArea';

// tracking
import { injectTracks } from 'utils/analytics';
import tracks from './tracks';

// i18n
import { InjectedIntl, InjectedIntlProps } from 'react-intl';
import { FormattedMessage, injectIntl } from 'utils/cl-intl';
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

const StyledTextArea = styled(MentionsTextArea)`
  .textareaWrapper__highlighter,
  textarea {
    color: #666 !important;
    font-size: 16px !important;
    line-height: 26px !important;
    padding: 12px 30px !important;
    padding-right: 100px !important;
    border-color: #e4e4e4 !important;
    border-top-left-radius: 0px !important;
    border-top-right-radius: 0px !important;
    box-shadow: inset 0 0 2px rgba(0, 0, 0, 0.1) !important;

    &:hover {
      border-color: #333 !important;
    }

    &:focus {
      border-color: #333 !important;
      box-shadow: inset 0 0 2px rgba(0, 0, 0, 0.1) !important;
    }
  }
`;

const SendIcon = styled(Icon)`
  height: 22px;
  z-index: 3;
  transition: all 100ms ease-out;
`;

const SendIconWrapper: any = styled.div`
  width: 30px;
  height: 30px;
  position: absolute;
  margin: 0;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  bottom: 12px;
  right: 15px;
  z-index: 2;
  cursor: ${(props: any) => props.disabled ? 'auto' : 'pointer'};

  ${SendIcon} {
    fill: ${(props: any) => props.disabled ? '#ccc' : props.theme.colorMain };
  }

  &:hover ${SendIcon} {
    fill: ${(props: any) => props.disabled ? '#ccc' : darken(0.15, props.theme.colorMain) };
  }
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
  processing: boolean;
  errorMessage: string | null;
  canSubmit: boolean;
};

class ChildCommentForm extends React.PureComponent<Props & InjectedIntlProps & Tracks, State> {
  state: State;
  subscriptions: Rx.Subscription[];

  constructor(props: Props) {
    super(props as any);
    this.state = {
      locale: null,
      authUser: null,
      inputValue: '',
      focussed: false,
      processing: false,
      errorMessage: null,
      canSubmit: false
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
    this.setState((state) => ({
      inputValue,
      errorMessage: null,
      canSubmit: (state.focussed && _.trim(inputValue) !== '' ? true : false)
    }));
  }

  handleTextareaOnFocus = () => {
    this.props.focusEditor({
      extra: {
        ideaId: this.props.ideaId,
        parentId: this.props.parentId
      },
    });

    this.setState({ focussed: true });
  }

  handleTextareaOnBlur = () => {
    this.setState({ focussed: false });
  }

  handleSubmit = async (event) => {
    const { ideaId, parentId } = this.props;
    const { formatMessage } = this.props.intl;
    const { locale, authUser, inputValue, canSubmit } = this.state;

    event.preventDefault();

    if (canSubmit) {
      this.setState({ canSubmit: false });

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

          await addCommentToComment(ideaId, authUser.data.id, parentId, { [locale]: inputValue.replace(/\@\[(.*?)\]\((.*?)\)/gi, '@$2') });

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
        this.setState({
          errorMessage: formatMessage(messages.emptyCommentError),
          processing: false
        });
      } else {
        this.setState({
          errorMessage: formatMessage(messages.addCommentError),
          processing: false
        });
      }
    }
  }

  render() {
    const { ideaId } = this.props;
    const { authUser } = this.state;

    if (authUser) {
      const { formatMessage } = this.props.intl;
      const { inputValue, canSubmit, processing, errorMessage } = this.state;
      const placeholder = formatMessage(messages.childCommentBodyPlaceholder);
      const submitAreaClassNames = classNames({
        error: _.isString(errorMessage)
      });

      return (
        <CommentContainer>
          <StyledTextArea
            name="comment"
            placeholder={placeholder}
            rows={1}
            padding="12px 30px"
            value={inputValue}
            error={errorMessage}
            ideaId={ideaId}
            onChange={this.handleTextareaOnChange}
            onFocus={this.handleTextareaOnFocus}
            onBlur={this.handleTextareaOnBlur}
          >
            <SendIconWrapper onClick={this.handleSubmit} disabled={!canSubmit}>
              <SendIcon name="send" />
            </SendIconWrapper>
          </StyledTextArea>
        </CommentContainer>
      );
    }

    return null;
  }
}

export default injectTracks<Props>({
  focusEditor: tracks.focusNewCommentTextbox,
  clickCommentPublish: tracks.clickCommentPublish,
})(injectIntl<Props>(ChildCommentForm));
