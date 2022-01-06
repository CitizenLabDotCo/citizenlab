import React, { PureComponent } from 'react';
import { isString, trim, get } from 'lodash-es';
import { adopt } from 'react-adopt';
import { isNilOrError } from 'utils/helperUtils';

// components
import Button from 'components/UI/Button';
import MentionsTextArea from 'components/UI/MentionsTextArea';
import Avatar from 'components/Avatar';
import clickOutside from 'utils/containers/clickOutside';
import Link from 'utils/cl-router/Link';

// tracking
import { trackEventByName } from 'utils/analytics';
import tracks from './tracks';

// i18n
import { InjectedIntlProps } from 'react-intl';
import { FormattedMessage, injectIntl } from 'utils/cl-intl';
import messages from './messages';

// services
import { addCommentToIdea, addCommentToInitiative } from 'services/comments';
import { canModerateProject } from 'services/permissions/rules/projectPermissions';

// resources
import GetLocale, { GetLocaleChildProps } from 'resources/GetLocale';
import GetAuthUser, { GetAuthUserChildProps } from 'resources/GetAuthUser';
import GetPost, { GetPostChildProps } from 'resources/GetPost';
import GetWindowSize, {
  GetWindowSizeChildProps,
} from 'resources/GetWindowSize';

// events
import { commentAdded } from './events';

// style
import styled from 'styled-components';
import { hideVisually } from 'polished';
import { colors, defaultStyles, viewportWidths } from 'utils/styleUtils';
import GetInitiativesPermissions, {
  GetInitiativesPermissionsChildProps,
} from 'resources/GetInitiativesPermissions';
import { GetAppConfigurationChildProps } from 'resources/GetAppConfiguration';

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
  position: relative;
`;

const Anchor = styled.div`
  width: 1px;
  height: 1px;
  position: absolute;
  top: -100px;
  left: 0px;
`;

const Form = styled.form`
  flex: 1;
  border: 1px solid ${colors.border};
  border-radius: ${(props: any) => props.theme.borderRadius};
  overflow: hidden;

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
  justify-content: flex-end;
  margin-top: 10px;
  margin-bottom: 10px;
  margin-right: 10px;
  display: none;

  &.visible {
    display: flex;
  }
`;

const CancelButton = styled(Button)`
  margin-right: 8px;
`;

interface InputProps {
  postId: string;
  postType: 'idea' | 'initiative';
  postingComment: (arg: boolean) => void;
  className?: string;
}

interface DataProps {
  commentingPermissionInitiative: GetInitiativesPermissionsChildProps;
  locale: GetLocaleChildProps;
  authUser: GetAuthUserChildProps;
  post: GetPostChildProps;
  windowSize: GetWindowSizeChildProps;
  appConfiguration: GetAppConfigurationChildProps;
}

interface Props extends InputProps, DataProps {}

interface State {
  inputValue: string;
  focused: boolean;
  processing: boolean;
  profanityApiError: boolean;
  hasEmptyError: boolean;
  hasApiError: boolean;
}

class ParentCommentForm extends PureComponent<
  Props & InjectedIntlProps,
  State
> {
  textareaElement: HTMLTextAreaElement | null = null;

  constructor(props) {
    super(props);
    this.state = {
      inputValue: '',
      focused: false,
      processing: false,
      hasApiError: false,
      profanityApiError: false,
      hasEmptyError: true,
    };
  }

  componentDidUpdate(_prevProps: Props, prevState: State) {
    if (prevState.processing !== this.state.processing) {
      this.props.postingComment(this.state.processing);
    }
  }

  onChange = (inputValue: string) => {
    this.setState({
      inputValue,
      focused: true,
      hasApiError: false,
      profanityApiError: false,
      hasEmptyError: inputValue.trim().length < 1,
    });
  };

  onFocus = () => {
    const { postId, postType } = this.props;

    trackEventByName(tracks.focusParentCommentEditor, {
      extra: {
        postId,
        postType,
      },
    });

    this.setState({ focused: true });
  };

  close = () => {
    if (!this.state.processing) {
      this.setState({ focused: false, inputValue: '' });
      this.textareaElement?.blur();
    }
  };

  onSubmit = async () => {
    const { locale, authUser, postId, postType, post, appConfiguration } =
      this.props;
    const { inputValue } = this.state;
    const projectId: string | null = get(
      post,
      'relationships.project.data.id',
      null
    );

    this.setState({
      focused: false,
      processing: true,
    });

    if (locale && authUser && isString(inputValue) && trim(inputValue) !== '') {
      const commentBodyMultiloc = {
        [locale]: inputValue.replace(/@\[(.*?)\]\((.*?)\)/gi, '@$2'),
      };

      trackEventByName(tracks.clickParentCommentPublish, {
        extra: {
          postId,
          postType,
          content: inputValue,
        },
      });

      try {
        this.setState({ processing: true });

        if (postType === 'idea' && projectId) {
          await addCommentToIdea(
            postId,
            projectId,
            authUser.id,
            commentBodyMultiloc
          ).then((comment) => {
            const parentComment = document.getElementById(comment.data.id);
            if (parentComment) {
              setTimeout(() => {
                parentComment.scrollIntoView({ behavior: 'smooth' });
              }, 100);
            }
          });
        }

        if (postType === 'initiative') {
          await addCommentToInitiative(
            postId,
            authUser.id,
            commentBodyMultiloc
          ).then((comment) => {
            const parentComment = document.getElementById(comment.data.id);
            if (parentComment) {
              setTimeout(() => {
                parentComment.scrollIntoView({ behavior: 'smooth' });
              }, 100);
            }
          });
        }

        commentAdded();
        this.setState({ processing: false });
        this.close();
      } catch (error) {
        // eslint-disable-next-line no-console
        if (process.env.NODE_ENV === 'development') console.log(error);
        const apiErrors = get(error, 'json.errors');
        const profanityApiError = apiErrors.base.find(
          (apiError) => apiError.error === 'includes_banned_words'
        );

        this.setState({
          hasApiError: true,
          processing: false,
        });

        if (profanityApiError) {
          trackEventByName(tracks.parentCommentProfanityError.name, {
            locale,
            postId,
            postType,
            projectId,
            profaneMessage: commentBodyMultiloc[locale],
            location: 'InitiativesNewFormWrapper (citizen side)',
            userId: authUser.id,
            host: !isNilOrError(appConfiguration)
              ? appConfiguration.attributes.host
              : null,
          });

          this.setState({
            profanityApiError: true,
          });
        }

        throw error;
      }
    }
  };

  setRef = (element: HTMLTextAreaElement) => {
    this.textareaElement = element;
  };

  getErrorMessage = () => {
    const { hasApiError, profanityApiError } = this.state;
    const {
      intl: { formatMessage },
    } = this.props;

    if (hasApiError) {
      // Profanity error is the only error we're checking specifically
      // at the moment to provide a specific error message.
      // All other api errors are generalized to 1 error message
      if (profanityApiError) {
        return (
          <FormattedMessage
            {...messages.profanityError}
            values={{
              guidelinesLink: (
                <Link to="/pages/faq" target="_blank">
                  {formatMessage(messages.guidelinesLinkText)}
                </Link>
              ),
            }}
          />
        );
      }

      return <FormattedMessage {...messages.addCommentError} />;
    }

    return null;
  };

  render() {
    const {
      authUser,
      post,
      postId,
      postType,
      className,
      intl: { formatMessage },
      commentingPermissionInitiative,
      windowSize,
    } = this.props;
    const { inputValue, focused, processing, hasEmptyError } = this.state;
    const commentingEnabled =
      postType === 'initiative'
        ? commentingPermissionInitiative?.enabled === true
        : get(
            post,
            'attributes.action_descriptor.commenting_idea.enabled',
            true
          );
    const projectId: string | null = get(
      post,
      'relationships.project.data.id',
      null
    );
    const isModerator =
      !isNilOrError(authUser) &&
      canModerateProject(projectId, { data: authUser });
    const canComment = authUser && commentingEnabled;
    const placeholder = formatMessage(
      messages[`${postType}CommentBodyPlaceholder`]
    );
    const smallerThanSmallTablet =
      !isNilOrError(windowSize) && windowSize <= viewportWidths.smallTablet;

    if (!isNilOrError(authUser) && canComment) {
      return (
        <Container className={className || ''}>
          <StyledAvatar
            userId={authUser?.id}
            size={30}
            isLinkToProfile={!!authUser?.id}
            moderator={isModerator}
          />
          <FormContainer
            className="ideaCommentForm"
            onClickOutside={this.close}
            closeOnClickOutsideEnabled={false}
          >
            <Anchor id="submit-comment-anchor" />
            <Form className={focused ? 'focused' : ''}>
              <label htmlFor="submit-comment">
                <HiddenLabel>
                  <FormattedMessage {...messages.yourComment} />
                </HiddenLabel>
                <MentionsTextArea
                  id="submit-comment"
                  className="e2e-parent-comment-form"
                  name="comment"
                  placeholder={placeholder}
                  rows={focused || processing ? 4 : 1}
                  postId={postId}
                  postType={postType}
                  value={inputValue}
                  error={this.getErrorMessage()}
                  onChange={this.onChange}
                  onFocus={this.onFocus}
                  fontWeight="300"
                  padding="10px"
                  borderRadius="none"
                  border="none"
                  boxShadow="none"
                  getTextareaRef={this.setRef}
                />
                <ButtonWrapper
                  className={focused || processing ? 'visible' : ''}
                >
                  <CancelButton
                    disabled={processing}
                    onClick={this.close}
                    buttonStyle="secondary"
                    padding={smallerThanSmallTablet ? '6px 12px' : undefined}
                  >
                    <FormattedMessage {...messages.cancel} />
                  </CancelButton>
                  <Button
                    className="e2e-submit-parentcomment"
                    processing={processing}
                    onClick={this.onSubmit}
                    disabled={hasEmptyError}
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

const Data = adopt<DataProps, InputProps>({
  locale: <GetLocale />,
  authUser: <GetAuthUser />,
  windowSize: <GetWindowSize />,
  post: ({ postId, postType, render }) => (
    <GetPost id={postId} type={postType}>
      {render}
    </GetPost>
  ),
  commentingPermissionInitiative: (
    <GetInitiativesPermissions action="commenting_initiative" />
  ),
});

const ParentCommentFormWithHoCs = injectIntl<Props>(ParentCommentForm);

export default (inputProps: InputProps) => (
  <Data {...inputProps}>
    {(dataProps) => (
      <ParentCommentFormWithHoCs {...inputProps} {...dataProps} />
    )}
  </Data>
);
