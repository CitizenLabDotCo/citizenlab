import React, { useState, useRef } from 'react';
import { isString, trim } from 'lodash-es';
import { isNilOrError, isPage } from 'utils/helperUtils';

// components
import Button from 'components/UI/Button';
import MentionsTextArea from 'components/UI/MentionsTextArea';
import Avatar from 'components/Avatar';
import clickOutside from 'utils/containers/clickOutside';
import Link from 'utils/cl-router/Link';
import {
  Checkbox,
  useBreakpoint,
  Text,
  IconTooltip,
} from '@citizenlab/cl2-component-library';
import OldAnonymousParticipationConfirmationModal from 'components/AnonymousParticipationConfirmationModal/OldAnonymousParticipationConfirmationModal';

// tracking
import { trackEventByName } from 'utils/analytics';
import tracks from './tracks';

// i18n
import { FormattedMessage, MessageDescriptor, useIntl } from 'utils/cl-intl';
import messages from './messages';

// services
import { canModerateProject } from 'utils/permissions/rules/projectPermissions';

// resources

// events
import { commentAdded } from './events';

// style
import styled from 'styled-components';
import { hideVisually } from 'polished';
import { colors, defaultStyles } from 'utils/styleUtils';

// hooks
import useIdeaById from 'api/ideas/useIdeaById';
import useAddCommentToIdea from 'api/comments/useAddCommentToIdea';
import useAddCommentToInitiative from 'api/comments/useAddCommentToInitiative';
import useLocale from 'hooks/useLocale';
import useAuthUser from 'api/me/useAuthUser';
import useAppConfiguration from 'api/app_configuration/useAppConfiguration';
import { useLocation } from 'react-router-dom';

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
  ideaId: string | undefined;
  initiativeId: string | undefined;
  postType: 'idea' | 'initiative';
  postingComment: (arg: boolean) => void;
  className?: string;
  allowAnonymousParticipation?: boolean;
}

const ParentCommentForm = ({
  ideaId,
  initiativeId,
  postType,
  className,
  allowAnonymousParticipation,
}: Props) => {
  const locale = useLocale();
  const { data: authUser } = useAuthUser();
  const { data: appConfiguration } = useAppConfiguration();
  const { formatMessage } = useIntl();
  const smallerThanTablet = useBreakpoint('tablet');
  const { pathname } = useLocation();
  const isAdminPage = isPage('admin', pathname);
  const { mutate: addCommentToIdea, isLoading: addCommentToIdeaIsLoading } =
    useAddCommentToIdea();
  const {
    mutate: addCommentToInitiative,
    isLoading: addCommentToInitiativeIsLoading,
  } = useAddCommentToInitiative();
  const textareaElement = useRef<HTMLTextAreaElement | null>(null);
  const [inputValue, setInputValue] = useState('');
  const [focused, setFocused] = useState(false);
  const [hasApiError, setHasApiError] = useState(false);
  const [profanityApiError, setProfanityApiError] = useState(false);
  const [hasEmptyError, setHasEmptyError] = useState(true);
  const [postAnonymously, setPostAnonymously] = useState(false);
  const [showAnonymousConfirmationModal, setShowAnonymousConfirmationModal] =
    useState(false);
  const { data: idea } = useIdeaById(ideaId);
  const projectId = idea ? idea.data.relationships.project.data.id : null;

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
        postId: ideaId || initiativeId,
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
    if (allowAnonymousParticipation && postAnonymously) {
      setShowAnonymousConfirmationModal(true);
    } else {
      continueSubmission();
    }
  };

  const continueSubmission = async () => {
    setFocused(false);

    if (isString(inputValue) && trim(inputValue) !== '') {
      const commentBodyMultiloc = {
        [locale]: inputValue.replace(/@\[(.*?)\]\((.*?)\)/gi, '@$2'),
      };

      trackEventByName(tracks.clickParentCommentPublish, {
        extra: {
          postId: ideaId || initiativeId,
          postType,
          content: inputValue,
        },
      });

      if (postType === 'idea' && projectId) {
        addCommentToIdea(
          {
            ideaId,
            author_id: authUser.data.id,
            body_multiloc: commentBodyMultiloc,
            anonymous: postAnonymously,
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
              const apiErrors = error.errors;
              const profanityApiError = apiErrors.base.find(
                (apiError) => apiError.error === 'includes_banned_words'
              );

              setHasApiError(true);

              if (profanityApiError) {
                trackEventByName(tracks.parentCommentProfanityError.name, {
                  locale,
                  ideaId,
                  postType,
                  projectId,
                  profaneMessage: commentBodyMultiloc[locale],
                  location: 'InitiativesNewFormWrapper (citizen side)',
                  userId: authUser.data.id,
                  host: appConfiguration
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
            initiativeId,
            author_id: authUser.data.id,
            body_multiloc: commentBodyMultiloc,
            anonymous: postAnonymously,
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
              const apiErrors = error.errors;
              const profanityApiError = apiErrors.base.find(
                (apiError) => apiError.error === 'includes_banned_words'
              );

              setHasApiError(true);

              if (profanityApiError) {
                trackEventByName(tracks.parentCommentProfanityError.name, {
                  locale,
                  initiativeId,
                  postType,
                  projectId,
                  profaneMessage: commentBodyMultiloc[locale],
                  location: 'InitiativesNewFormWrapper (citizen side)',
                  userId: authUser.data.id,
                  host: appConfiguration
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

  const isModerator = canModerateProject(projectId, authUser);
  const buttonText: MessageDescriptor = isAdminPage
    ? messages.postPublicComment
    : messages.publishComment;
  const placeholderMessage: MessageDescriptor = isAdminPage
    ? messages.visibleToUsersPlaceholder
    : messages[`${postType}CommentBodyPlaceholder`];
  const placeholder = formatMessage(placeholderMessage);

  return (
    <Container className={className || ''}>
      <StyledAvatar
        userId={authUser.data.id}
        size={30}
        isLinkToProfile={!!authUser.data.id}
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
              postId={ideaId || initiativeId}
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
              {allowAnonymousParticipation && (
                <Checkbox
                  id="e2e-anonymous-comment-checkbox"
                  ml="8px"
                  checked={postAnonymously}
                  label={
                    <Text mb="12px" fontSize="s" color="coolGrey600">
                      {formatMessage(messages.postAnonymously)}
                      <IconTooltip
                        content={
                          <Text color="white" fontSize="s" m="0">
                            {formatMessage(
                              messages.inputsAssociatedWithProfile
                            )}
                          </Text>
                        }
                        iconSize="16px"
                        placement="top-start"
                        display="inline"
                        ml="4px"
                        transform="translate(0,-1)"
                      />
                    </Text>
                  }
                  onChange={() => setPostAnonymously(!postAnonymously)}
                />
              )}
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
                icon={isAdminPage ? 'users' : undefined}
              >
                <FormattedMessage {...buttonText} />
              </Button>
            </ButtonWrapper>
          </label>
        </Form>
      </FormContainer>
      {showAnonymousConfirmationModal && (
        <OldAnonymousParticipationConfirmationModal
          onConfirmAnonymousParticipation={() => {
            setShowAnonymousConfirmationModal(false);
            continueSubmission();
          }}
          onCloseModal={() => {
            setShowAnonymousConfirmationModal(false);
          }}
        />
      )}
    </Container>
  );
};

export default ParentCommentForm;
