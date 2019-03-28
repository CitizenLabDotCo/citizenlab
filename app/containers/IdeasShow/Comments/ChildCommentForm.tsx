// libraries
import React, { PureComponent, FormEvent } from 'react';
import { trim } from 'lodash-es';
import { adopt } from 'react-adopt';
import { isNilOrError } from 'utils/helperUtils';

// components
import Button from 'components/UI/Button';
import MentionsTextArea from 'components/UI/MentionsTextArea';

// tracking
import { trackEventByName } from 'utils/analytics';
import tracks from './tracks';

// i18n
import { InjectedIntlProps } from 'react-intl';
import { injectIntl, FormattedMessage } from 'utils/cl-intl';
import messages from '../messages';

// services
import { addCommentToComment } from 'services/comments';

// resources
import GetLocale, { GetLocaleChildProps } from 'resources/GetLocale';
import GetAuthUser, { GetAuthUserChildProps } from 'resources/GetAuthUser';

// style
import styled from 'styled-components';
import { hideVisually } from 'polished';
import { fontSizes } from 'utils/styleUtils';

const Container = styled.form``;

const HiddenLabel = styled.span`
  ${hideVisually() as any}
`;

const FormInner = styled.div`
  display: flex;
  align-items: stretch;
  padding: 30px 50px;
  border: solid 1px red;
`;

const Left = styled.div`
  flex: 1;
  border: solid 1px red;
`;

const Right = styled.div`
  border: solid 1px red;
`;

const StyledTextArea = styled(MentionsTextArea)`
  border: solid 1px red;

  .textareaWrapper__highlighter,
  textarea {
    font-size: ${fontSizes.base}px !important;
    line-height: normal !important;
    font-weight: 300 !important;
    border-radius: none !important;
    border: none !important;
    background: #fff !important;
  }
`;

const SubmitButton = styled(Button)``;

interface InputProps {
  ideaId: string;
  parentId: string;
  className?: string;
}

interface DataProps {
  locale: GetLocaleChildProps;
  authUser: GetAuthUserChildProps;
}

interface Props extends InputProps, DataProps {}

interface State {
  inputValue: string;
  focussed: boolean;
  processing: boolean;
  errorMessage: string | null;
  canSubmit: boolean;
}

class ChildCommentForm extends PureComponent<Props & InjectedIntlProps, State> {
  constructor(props) {
    super(props);
    this.state = {
      inputValue: '',
      focussed: false,
      processing: false,
      errorMessage: null,
      canSubmit: false
    };
  }

  handleTextareaOnChange = (inputValue: string) => {
    this.setState((state) => ({
      inputValue,
      errorMessage: null,
      canSubmit: (state.focussed && trim(inputValue) !== '' ? true : false)
    }));
  }

  handleTextareaOnFocus = () => {
    trackEventByName(tracks.focusChildCommentEditor, {
      extra: {
        ideaId: this.props.ideaId,
        parentId: this.props.parentId
      }
    });

    this.setState({ focussed: true });
  }

  handleTextareaOnBlur = () => {
    this.setState({ focussed: false });
  }

  handleSubmit = async (event: FormEvent<any>) => {
    event.preventDefault();

    const { locale, authUser, ideaId, parentId } = this.props;
    const { formatMessage } = this.props.intl;
    const { inputValue, canSubmit } = this.state;

    if (!isNilOrError(locale) && !isNilOrError(authUser) && canSubmit) {
      this.setState({
        processing: true,
        canSubmit: false
      });

      trackEventByName(tracks.clickChildCommentPublish, {
        extra: {
          ideaId,
          parentId,
          content: inputValue,
        }
      });

      try {
        await addCommentToComment(ideaId, authUser.id, parentId, { [locale]: inputValue.replace(/\@\[(.*?)\]\((.*?)\)/gi, '@$2') });

        this.setState({
          inputValue: '',
          processing: false
        });
      } catch (error) {
        this.setState({
          errorMessage: formatMessage(messages.addCommentError),
          processing: false,
          canSubmit: true
        });
      }
    }
  }

  render() {
    const { ideaId, authUser, className } = this.props;

    if (!isNilOrError(authUser)) {
      const { formatMessage } = this.props.intl;
      const { inputValue, canSubmit, processing, errorMessage } = this.state;
      const placeholder = formatMessage(messages.childCommentBodyPlaceholder);

      return (
        <Container className={className}>
          <label>
            <HiddenLabel>
              <FormattedMessage {...messages.replyToComment} />
            </HiddenLabel>
            <FormInner>
              <Left>
                <StyledTextArea
                  name="comment"
                  id="e2e-reply"
                  placeholder={placeholder}
                  rows={1}
                  padding="10px 0px"
                  value={inputValue}
                  error={errorMessage}
                  ideaId={ideaId}
                  onChange={this.handleTextareaOnChange}
                  onFocus={this.handleTextareaOnFocus}
                  onBlur={this.handleTextareaOnBlur}
                />
              </Left>
              <Right>
                <SubmitButton
                  className="e2e-submit-comment"
                  processing={processing}
                  icon="send"
                  onClick={this.handleSubmit}
                  disabled={!canSubmit}
                >
                  <FormattedMessage {...messages.publishComment} />
                </SubmitButton>
              </Right>
            </FormInner>
          </label>
        </Container>
      );
    }

    return null;
  }
}

const ChildCommentFormWithHoCs = injectIntl<Props>(ChildCommentForm);

const Data = adopt<DataProps, InputProps>({
  locale: <GetLocale />,
  authUser: <GetAuthUser />
});

export default (inputProps: InputProps) => (
  <Data {...inputProps}>
    {dataProps => <ChildCommentFormWithHoCs {...inputProps} {...dataProps} />}
  </Data>
);
