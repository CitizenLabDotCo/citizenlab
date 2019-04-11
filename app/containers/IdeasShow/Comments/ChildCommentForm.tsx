// libraries
import React, { PureComponent, FormEvent } from 'react';
import { Subscription } from 'rxjs';
import { filter, tap } from 'rxjs/operators';
import { trim } from 'lodash-es';
import { adopt } from 'react-adopt';
import { isNilOrError } from 'utils/helperUtils';
import scrollToComponent from 'react-scroll-to-component';

// components
import Button from 'components/UI/Button';
import MentionsTextArea from 'components/UI/MentionsTextArea';
import Observer from '@researchgate/react-intersection-observer';

// tracking
import { trackEventByName } from 'utils/analytics';
import tracks from './tracks';

// i18n
import { InjectedIntlProps } from 'react-intl';
import { injectIntl, FormattedMessage } from 'utils/cl-intl';
import messages from '../messages';

// services
import { addCommentToComment } from 'services/comments';
import eventEmitter from 'utils/eventEmitter';

// resources
import GetLocale, { GetLocaleChildProps } from 'resources/GetLocale';
import GetAuthUser, { GetAuthUserChildProps } from 'resources/GetAuthUser';

// style
import styled from 'styled-components';
import { hideVisually } from 'polished';

// typings
import { ICommentReplyClicked } from './CommentFooter';

const Container = styled.form`
  background: #fff;
  border: solid 1px #fff;
  border-top-color: #ebebeb;
  border-bottom-left-radius: 3px;
  border-bottom-right-radius: 3px;
  transition: all 100ms ease;

  &.focussed {
    background: #fff;
    border-color: #999;
  }
`;

const HiddenLabel = styled.span`
  ${hideVisually()}
`;

const FormInner = styled.div`
  display: flex;
  flex-direction: column;
  align-items: stretch;
  padding: 30px 50px;
`;

const TextareaWrapper = styled.div``;

const ButtonWrapper = styled.div`
  display: none;
  justify-content: flex-end;

  &.visible {
    display: flex;
  }
`;

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
  textareaElement: HTMLTextAreaElement;
  isInViewport: boolean;
  subscriptions: Subscription[] = [];

  constructor(props) {
    super(props);
    this.state = {
      inputValue: '',
      focussed: false,
      processing: false,
      errorMessage: null,
      canSubmit: false,
    };
  }

  componentDidMount() {
    this.subscriptions = [
      eventEmitter.observeEvent<ICommentReplyClicked>('commentReplyButtonClicked').pipe(
        tap(() => {
          this.setState({ inputValue: '', focussed: false });
        }),
        filter(({ eventValue }) => {
          const { commentId, parentCommentId } = eventValue;
          return (commentId === this.props.parentId || parentCommentId === this.props.parentId);
        })
      ).subscribe(({ eventValue }) => {
        const { authorFirstName, authorLastName, authorSlug } = eventValue;
        const inputValue = `@[${authorFirstName} ${authorLastName}](${authorSlug}) `;
        this.setState({ inputValue, focussed: true });

        if (this.textareaElement) {
          // this.textareaElement.scrollIntoView();
          if (this.isInViewport) {
            this.textareaElement.focus();
          } else {
            // this.textareaElement.scrollIntoView({behavior: 'smooth', block: 'end', inline: 'center'});
            scrollToComponent(this.textareaElement, { align: 'top', offset: -400, duration: 400 });

            setTimeout(() => {
              this.textareaElement.focus();
            }, 400);
          }
        }
      })
    ];
  }

  componentWillUnmount() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  handleTextareaOnChange = (inputValue: string) => {
    this.setState(({ focussed }) => ({
      inputValue,
      errorMessage: null,
      canSubmit: !!(focussed && trim(inputValue) !== '')
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

  setRef = (element: HTMLTextAreaElement) => {
    this.textareaElement = element;
  }

  handleIntersection = (event: IntersectionObserverEntry) => {
    this.isInViewport = event.isIntersecting;
  }

  render() {
    const { ideaId, authUser, className } = this.props;

    if (!isNilOrError(authUser)) {
      const { formatMessage } = this.props.intl;
      const { inputValue, canSubmit, processing, errorMessage, focussed } = this.state;
      const placeholder = formatMessage(messages.childCommentBodyPlaceholder);
      const isButtonVisible = (inputValue && inputValue.length > 0 || focussed);

      return (
        <Container className={`${className} ${focussed ? 'focussed' : ''}`} onSubmit={this.handleSubmit}>
          <Observer onChange={this.handleIntersection}>
            <label>
              <HiddenLabel>
                <FormattedMessage {...messages.replyToComment} />
              </HiddenLabel>
              <FormInner>
                <TextareaWrapper>
                  <MentionsTextArea
                    name="comment"
                    className={`e2e-reply childcommentform-${this.props.parentId}`}
                    placeholder={placeholder}
                    rows={1}
                    value={inputValue}
                    error={errorMessage}
                    ideaId={ideaId}
                    onChange={this.handleTextareaOnChange}
                    onFocus={this.handleTextareaOnFocus}
                    onBlur={this.handleTextareaOnBlur}
                    getTextareaRef={this.setRef}
                    fontWeight="300"
                    padding="10px 0px"
                    borderRadius="none"
                    border="none"
                    boxShadow="none"
                  />
                </TextareaWrapper>
                <ButtonWrapper className={isButtonVisible ? 'visible' : ''}>
                  <Button
                    className="e2e-submit-comment"
                    processing={processing}
                    icon="send"
                    onClick={this.handleSubmit}
                    disabled={!canSubmit}
                  >
                    <FormattedMessage {...messages.publishComment} />
                  </Button>
                </ButtonWrapper>
              </FormInner>
            </label>
          </Observer>
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
