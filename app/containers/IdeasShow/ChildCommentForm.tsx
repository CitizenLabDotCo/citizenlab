// libraries
import React from 'react';
import { trim, isString } from 'lodash';
import { adopt } from 'react-adopt';

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
import { addCommentToComment } from 'services/comments';

// resources
import GetLocale, { GetLocaleChildProps } from 'resources/GetLocale';
import GetAuthUser, { GetAuthUserChildProps } from 'resources/GetAuthUser';

// style
import styled from 'styled-components';
import { darken } from 'polished';

const CommentContainer = styled.form`
  padding-left: 0px;
  padding-right: 0px;
  padding-top: 0px;
  padding-bottom: 0px;
`;

const StyledTextArea = styled(MentionsTextArea)`
  .textareaWrapper__highlighter,
  textarea {
    font-size: 17px !important;
    line-height: 25px !important;
    font-weight: 300 !important;
    padding: 12px 20px !important;
    padding-right: 60px !important;
    border-top-left-radius: 0px !important;
    border-top-right-radius: 0px !important;
    background: #fff !important;
  }
`;

const SendIcon = styled(Icon)`
  height: 21px;
  z-index: 3;
  transition: all 100ms ease-out;
`;

const SendIconWrapper: any = styled.button`
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

interface InputProps {
  ideaId: string;
  parentId: string;
}

interface DataProps {
  locale: GetLocaleChildProps;
  authUser: GetAuthUserChildProps;
}

interface Props extends InputProps, DataProps {}

interface Tracks {
  focusEditor: Function;
  clickCommentPublish: Function;
}

interface State {
  inputValue: string;
  focussed: boolean;
  processing: boolean;
  errorMessage: string | null;
  canSubmit: boolean;
}

class ChildCommentForm extends React.PureComponent<Props & InjectedIntlProps & Tracks, State> {
  constructor(props: Props) {
    super(props as any);
    this.state = {
      inputValue: '',
      focussed: false,
      processing: false,
      errorMessage: null,
      canSubmit: false
    };
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
    const { locale, authUser, ideaId, parentId } = this.props;
    const { formatMessage } = this.props.intl;
    const { inputValue, canSubmit } = this.state;

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

          await addCommentToComment(ideaId, authUser.id, parentId, { [locale]: inputValue.replace(/\@\[(.*?)\]\((.*?)\)/gi, '@$2') });

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
    const { ideaId, authUser } = this.props;

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

const ChildCommentFormWithHoCs = injectTracks<Props>({
  focusEditor: tracks.focusNewCommentTextbox,
  clickCommentPublish: tracks.clickCommentPublish,
})(injectIntl<Props>(ChildCommentForm));

const Data = adopt<DataProps, InputProps>({
  locale: <GetLocale />,
  authUser: <GetAuthUser />
});

export default (inputProps: InputProps) => (
  <Data {...inputProps}>
    {dataProps => <ChildCommentFormWithHoCs {...inputProps} {...dataProps} />}
  </Data>
);
