// libraries
import * as React from 'react';
import { trim, isString } from 'lodash';
import * as Rx from 'rxjs/Rx';

// components
import Icon from 'components/UI/Icon';
import MentionsTextArea from 'components/UI/MentionsTextArea';

// tracking
import { injectTracks } from 'utils/analytics';
import tracks from './tracks';

// i18n
import { InjectedIntlProps } from 'react-intl';
import { injectIntl } from 'utils/cl-intl';
import messages from './messages';

// services
import { authUserStream } from 'services/auth';
import { localeStream } from 'services/locale';
import { IUser } from 'services/users';
import { addCommentToComment } from 'services/comments';

// style
import styled from 'styled-components';
import { darken } from 'polished';
import { Locale } from 'typings';

const CommentContainer = styled.div`
  padding-left: 0px;
  padding-right: 0px;
  padding-top: 0px;
  padding-bottom: 0px;
  /* padding-top: 0px; */
  /* border-top: solid 1px #e4e4e4; */
`;

const StyledTextArea = styled(MentionsTextArea)`
  .textareaWrapper__highlighter,
  textarea {
    font-size: 17px !important;
    line-height: 25px !important;
    font-weight: 300 !important;
    background: #fafafa !important;
    /* box-shadow: none !important; */
    padding: 14px 30px !important;
    padding-right: 55px !important;
    border-top-left-radius: 0px !important;
    border-top-right-radius: 0px !important;
    /* border-color: #e4e4e4 !important; */

    &:hover {
      /* border: solid 1px #ccc !important; */
      /* box-shadow: inset 0px 0px 2px 0px rgba(0, 0, 0, 0.2) !important; */
    }

    &:focus {
      /* border: solid 1px #666 !important; */
      /* box-shadow: inset 0px 0px 2px 0px rgba(0, 0, 0, 0.3) !important; */
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
  bottom: 13px;
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

type Props = {
  ideaId: string;
  parentId: string;
};

type Tracks = {
  focusEditor: Function;
  clickCommentPublish: Function;
};

type State = {
  locale: Locale | null;
  authUser: IUser | null;
  inputValue: string;
  focussed: boolean;
  processing: boolean;
  errorMessage: string | null;
  canSubmit: boolean;
};

class ChildCommentForm extends React.PureComponent<Props & InjectedIntlProps & Tracks, State> {
  
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

  componentDidMount () {
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
      canSubmit: (state.focussed && trim(inputValue) !== '' ? true : false)
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

      if (locale && authUser && isString(inputValue) && trim(inputValue) !== '') {
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
      const { inputValue, canSubmit, errorMessage } = this.state;
      const placeholder = formatMessage(messages.childCommentBodyPlaceholder);

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
