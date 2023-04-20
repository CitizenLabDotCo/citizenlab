import React, { useState, useRef } from 'react';
import { isString, trim, get } from 'lodash-es';
import { isNilOrError } from 'utils/helperUtils';

// components
import Button from 'components/UI/Button';
import MentionsTextArea from 'components/UI/MentionsTextArea';
import Avatar from 'components/Avatar';
import clickOutside from 'utils/containers/clickOutside';
import Link from 'utils/cl-router/Link';
import { useBreakpoint } from '@citizenlab/cl2-component-library';

// tracking
import { trackEventByName } from 'utils/analytics';
import tracks from './tracks';

// i18n
import { FormattedMessage, useIntl } from 'utils/cl-intl';
import messages from './messages';

// services
import { canModerateProject } from 'services/permissions/rules/projectPermissions';

// resources

// events
import { commentAdded } from './events';

// style
import styled from 'styled-components';
import { hideVisually } from 'polished';
import { colors, defaultStyles } from 'utils/styleUtils';

// hooks
import useInitiativeById from 'api/initiatives/useInitiativeById';
import useIdeaById from 'api/ideas/useIdeaById';
import useAddCommentToIdea from 'api/comments/useAddCommentToIdea';
import useAddCommentToInitiative from 'api/comments/useAddCommentToInitiative';
import useLocale from 'hooks/useLocale';
import useAuthUser from 'hooks/useAuthUser';
import useAppConfiguration from 'api/app_configuration/useAppConfiguration';
import useInitiativesPermissions from 'hooks/useInitiativesPermissions';

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
  border: 1px solid ${colors.borderDark};
  border-radius: ${(props) => props.theme.borderRadius};
  overflow: hidden;

  &:not(.focused):hover {
    border-color: ${colors.black};
  }

  &.focused {
    border-color: ${colors.black};
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

interface Props {
  postId: string;
  postType: 'idea' | 'initiative';
  postingComment: (arg: boolean) => void;
  className?: string;
}

const ParentCommentForm = ({ postId, postType, className }: Props) => {
  const locale = useLocale();
  const authUser = useAuthUser();
  const { data: appConfiguration } = useAppConfiguration();
  const { formatMessage } = useIntl();
  const smallerThanTablet = useBreakpoint('tablet');
  const { mutate: addCommentToIdea, isLoading: addCommentToIdeaIsLoading } =
    useAddCommentToIdea();
  const {
    mutate: addCommentToInitiative,
    isLoading: addCommentToInitiativeIsLoading,
  } = useAddCommentToInitiative();
  const commentingPermissionInitiative = useInitiativesPermissions(
    'commenting_initiative'
  );
  const textareaElement = useRef<HTMLTextAreaElement | null>(null);
  const [inputValue, setInputValue] = useState('');
  const [focused, setFocused] = useState(false);
  const [hasApiError, setHasApiError] = useState(false);
  const [profanityApiError, setProfanityApiError] = useState(false);
  const [hasEmptyError, setHasEmptyError] = useState(true);

  const initiativeId = postType === 'initiative' ? postId : undefined;
  const ideaId = postType === 'idea' ? postId : undefined;
  const { data: initiative } = useInitiativeById(initiativeId);
  const { data: idea } = useIdeaById(ideaId);
  const post = initiative || idea;

  const processing =
    addCommentToIdeaIsLoading || addCommentToInitiativeIsLoading;

  if (isNilOrError(locale) || isNilOrError(authUser)) {
    return null;
  }

  const onChange = (inputValue: string) => {
    setInputValue(inputValue);
    setFocused(true);
    setHasApiError(false);
    setProfanityApiError(false);
    setHasEmptyError(inputValue.trim().length < 1);
  };

  const onFocus = () => {
    trackEventByName(tracks.focusParentCommentEditor, {
      extra: {
        postId,
        postType,
      },
    });

    setFocused(true);
  };

  const close = () => {
    if (!processing) {
      setFocused(false);
      setInputValue('');

      textareaElement.current?.blur();
    }
  };

  const onSubmit = async () => {
    const projectId: string | null =
      idea?.data.relationships.project.data.id || null;

    setFocused(false);

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

      if (postType === 'idea' && projectId) {
        addCommentToIdea(
          {
            ideaId: postId,
            author_id: authUser.id,
            body_multiloc: commentBodyMultiloc,
          },
          {
            onSuccess: (comment) => {
              const parentComment = document.getElementById(comment.data.id);
              if (parentComment) {
                setTimeout(() => {
                  parentComment.scrollIntoView({ behavior: 'smooth' });
                }, 100);
              }
              commentAdded();
              close();
            },
            onError: (error) => {
              const apiErrors = error.json.errors;
              const profanityApiError = apiErrors.base.find(
                (apiError) => apiError.error === 'includes_banned_words'
              );

              setHasApiError(true);

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
                    ? appConfiguration.data.attributes.host
                    : null,
                });

                setProfanityApiError(true);
              }

              throw error;
            },
          }
        );
      }

      if (postType === 'initiative') {
        addCommentToInitiative(
          {
            initiativeId: postId,
            author_id: authUser.id,
            body_multiloc: commentBodyMultiloc,
          },
          {
            onSuccess: (comment) => {
              const parentComment = document.getElementById(comment.data.id);
              if (parentComment) {
                setTimeout(() => {
                  parentComment.scrollIntoView({ behavior: 'smooth' });
                }, 100);
              }
              commentAdded();
              close();
            },
            onError: (error) => {
              const apiErrors = error.json.errors;
              const profanityApiError = apiErrors.base.find(
                (apiError) => apiError.error === 'includes_banned_words'
              );

              setHasApiError(true);

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
                    ? appConfiguration.data.attributes.host
                    : null,
                });

                setProfanityApiError(true);
              }

              throw error;
            },
          }
        );
      }
    }
  };

  const setRef = (element: HTMLTextAreaElement) => {
    textareaElement.current = element;
  };

  const getErrorMessage = () => {
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

  const commentingEnabled =
    postType === 'initiative'
      ? commentingPermissionInitiative?.enabled === true
      : idea?.data.attributes?.action_descriptor.commenting_idea.enabled ===
        true;
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
          onClickOutside={close}
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
                error={getErrorMessage()}
                onChange={onChange}
                onFocus={onFocus}
                fontWeight="300"
                padding="10px"
                borderRadius="none"
                border="none"
                boxShadow="none"
                getTextareaRef={setRef}
              />
              <ButtonWrapper className={focused || processing ? 'visible' : ''}>
                <CancelButton
                  disabled={processing}
                  onClick={close}
                  buttonStyle="secondary"
                  padding={smallerThanTablet ? '6px 12px' : undefined}
                >
                  <FormattedMessage {...messages.cancel} />
                </CancelButton>
                <Button
                  className="e2e-submit-parentcomment"
                  processing={processing}
                  onClick={onSubmit}
                  disabled={hasEmptyError}
                  padding={smallerThanTablet ? '6px 12px' : undefined}
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
};

export default ParentCommentForm;
