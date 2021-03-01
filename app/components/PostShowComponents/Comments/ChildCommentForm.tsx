// libraries
import React, { PureComponent } from 'react';
import { Subscription } from 'rxjs';
import { filter, tap } from 'rxjs/operators';
import { trim } from 'lodash-es';
import { adopt } from 'react-adopt';
import { isNilOrError } from 'utils/helperUtils';

// components
import Button from 'components/UI/Button';
import MentionsTextArea from 'components/UI/MentionsTextArea';
import Avatar from 'components/Avatar';
import clickOutside from 'utils/containers/clickOutside';

// tracking
import { trackEventByName } from 'utils/analytics';
import tracks from './tracks';

// i18n
import { InjectedIntlProps } from 'react-intl';
import { injectIntl, FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

// services
import {
  addCommentToIdeaComment,
  addCommentToInitiativeComment,
} from 'services/comments';
import { canModerateProject } from 'services/permissions/rules/projectPermissions';

// resources
import GetLocale, { GetLocaleChildProps } from 'resources/GetLocale';
import GetAuthUser, { GetAuthUserChildProps } from 'resources/GetAuthUser';
import GetWindowSize, {
  GetWindowSizeChildProps,
} from 'resources/GetWindowSize';

// events
import { commentReplyButtonClicked$, commentAdded } from './events';

// style
import styled from 'styled-components';
import { hideVisually } from 'polished';
import { colors, defaultStyles, viewportWidths } from 'utils/styleUtils';

const Container = styled.div`
  display: flex;
`;

const StyledAvatar = styled(Avatar)`
  margin-left: -4px;
  margin-right: 5px;
  margin-top: 3px;
`;

const FormContainer = styled(clickOutside)`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: stretch;
`;

const Form = styled.form`
  flex: 1;
  background: #fff;
  border: 1px solid ${colors.border};
  border-radius: ${(props: any) => props.theme.borderRadius};

  &:not(.focused):hover {
    border-color: ${colors.hoveredBorder};
  }

  &.focused {
    border-color: ${colors.focussedBorder};
    box-shadow: ${defaultStyles.boxShadowFocused};
  }
`;

const HiddenLabel = styled.span`
  ${hideVisually()}
`;

const ButtonWrapper = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-top: 14px;
  margin-bottom: 10px;
  margin-right: 10px;
`;

const CancelButton = styled(Button)`
  margin-right: 8px;
`;

interface InputProps {
  postId: string;
  postType: 'idea' | 'initiative';
  projectId?: string | null;
  parentId: string;
  waitForChildCommentsRefetch: boolean;
  className?: string;
}

interface DataProps {
  locale: GetLocaleChildProps;
  authUser: GetAuthUserChildProps;
  windowSize: GetWindowSizeChildProps;
}

interface Props extends InputProps, DataProps {}

interface State {
  inputValue: string;
  focused: boolean;
  processing: boolean;
  errorMessage: string | null;
  canSubmit: boolean;
}

class ChildCommentForm extends PureComponent<Props & InjectedIntlProps, State> {
  textareaElement: HTMLTextAreaElement;
  subscriptions: Subscription[] = [];

  constructor(props) {
    super(props);
    this.state = {
      inputValue: '',
      focused: false,
      processing: false,
      errorMessage: null,
      canSubmit: false,
    };
  }

  componentDidMount() {
    this.subscriptions = [
      commentReplyButtonClicked$
        .pipe(
          tap(() => this.setState({ inputValue: '', focused: false })),
          filter(({ eventValue }) => {
            const { commentId, parentCommentId } = eventValue;
            return (
              commentId === this.props.parentId ||
              parentCommentId === this.props.parentId
            );
          })
        )
        .subscribe(({ eventValue }) => {
          const { authorFirstName, authorLastName, authorSlug } = eventValue;
          const inputValue = `@[${authorFirstName} ${authorLastName}](${authorSlug}) `;
          this.setState({ inputValue, focused: true });
        }),
    ];
  }

  componentWillUnmount() {
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
  }

  setCaretAtEnd(element: HTMLTextAreaElement) {
    if (element.setSelectionRange && element.textContent) {
      element.setSelectionRange(
        element.textContent.length,
        element.textContent.length
      );
    }
  }

  onChange = (inputValue: string) => {
    this.setState(({ focused }) => ({
      inputValue,
      errorMessage: null,
      canSubmit: !!(focused && trim(inputValue) !== ''),
    }));
  };

  onFocus = () => {
    const { postId, postType, parentId } = this.props;

    trackEventByName(tracks.focusChildCommentEditor, {
      extra: {
        postId,
        postType,
        parentId,
      },
    });

    this.setState({ focused: true });
  };

  onCancel = () => {
    this.setState({ focused: false, inputValue: '' });
  };

  onSubmit = async () => {
    const {
      postId,
      postType,
      projectId,
      parentId,
      waitForChildCommentsRefetch,
      locale,
      authUser,
    } = this.props;
    const { formatMessage } = this.props.intl;
    const { inputValue, canSubmit } = this.state;

    if (!isNilOrError(locale) && !isNilOrError(authUser) && canSubmit) {
      const commentBodyMultiloc = {
        [locale]: inputValue.replace(/\@\[(.*?)\]\((.*?)\)/gi, '@$2'),
      };

      this.setState({
        processing: true,
        canSubmit: false,
      });

      trackEventByName(tracks.clickChildCommentPublish, {
        extra: {
          postId,
          postType,
          parentId,
          content: inputValue,
        },
      });

      try {
        if (postType === 'idea' && projectId) {
          await addCommentToIdeaComment(
            postId,
            projectId,
            authUser.id,
            parentId,
            commentBodyMultiloc,
            waitForChildCommentsRefetch
          );
        }

        if (postType === 'initiative') {
          await addCommentToInitiativeComment(
            postId,
            authUser.id,
            parentId,
            commentBodyMultiloc,
            waitForChildCommentsRefetch
          );
        }

        commentAdded();

        this.setState({
          inputValue: '',
          processing: false,
          focused: false,
        });
      } catch (error) {
        this.setState({
          errorMessage: formatMessage(messages.addCommentError),
          processing: false,
          canSubmit: true,
        });
      }
    }
  };

  setRef = (element: HTMLTextAreaElement) => {
    this.textareaElement = element;

    if (this.textareaElement) {
      this.textareaElement.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
        inline: 'center',
      });

      setTimeout(() => {
        this.textareaElement.focus();
      }, 100);

      setTimeout(() => {
        this.setCaretAtEnd(this.textareaElement);
      }, 200);
    }
  };

  placeholder = this.props.intl.formatMessage(
    messages.childCommentBodyPlaceholder
  );

  render() {
    const { focused } = this.state;
    const {
      postId,
      postType,
      parentId,
      authUser,
      windowSize,
      className,
    } = this.props;

    if (!isNilOrError(authUser) && focused) {
      const {
        inputValue,
        canSubmit,
        processing,
        errorMessage,
        focused,
      } = this.state;
      const isModerator =
        !isNilOrError(authUser) &&
        canModerateProject(postId, { data: authUser });
      const smallerThanSmallTablet =
        !isNilOrError(windowSize) && windowSize <= viewportWidths.smallTablet;

      return (
        <Container className={`${className || ''} e2e-childcomment-form`}>
          <StyledAvatar
            userId={authUser?.id}
            size={30}
            isLinkToProfile={!!authUser?.id}
            moderator={isModerator}
          />
          <FormContainer
            onClickOutside={this.onCancel}
            closeOnClickOutsideEnabled={false}
          >
            <Form className={focused ? 'focused' : ''}>
              <label>
                <HiddenLabel>
                  <FormattedMessage {...messages.replyToComment} />
                </HiddenLabel>
                <MentionsTextArea
                  postId={postId}
                  postType={postType}
                  name="comment"
                  className={`childcommentform-${parentId}`}
                  placeholder={this.placeholder}
                  rows={3}
                  value={inputValue}
                  error={errorMessage}
                  onChange={this.onChange}
                  onFocus={this.onFocus}
                  fontWeight="300"
                  padding="10px"
                  borderRadius="none"
                  border="none"
                  boxShadow="none"
                  getTextareaRef={this.setRef}
                />
                <ButtonWrapper>
                  <CancelButton
                    disabled={processing}
                    onClick={this.onCancel}
                    buttonStyle="secondary"
                    padding={smallerThanSmallTablet ? '6px 12px' : undefined}
                  >
                    <FormattedMessage {...messages.cancel} />
                  </CancelButton>
                  <Button
                    className="e2e-submit-childcomment"
                    processing={processing}
                    onClick={this.onSubmit}
                    disabled={!canSubmit}
                    padding={smallerThanSmallTablet ? '6px 12px' : undefined}
                  >
                    <FormattedMessage {...messages.publishComment} />
                  </Button>
                </ButtonWrapper>
              </label>
            </Form>
          </FormContainer>
        </Container>
      );
    }

    return null;
  }
}

const ChildCommentFormWithHoCs = injectIntl<Props>(ChildCommentForm);

const Data = adopt<DataProps, InputProps>({
  locale: <GetLocale />,
  authUser: <GetAuthUser />,
  windowSize: <GetWindowSize />,
});

export default (inputProps: InputProps) => (
  <Data {...inputProps}>
    {(dataProps) => <ChildCommentFormWithHoCs {...inputProps} {...dataProps} />}
  </Data>
);
