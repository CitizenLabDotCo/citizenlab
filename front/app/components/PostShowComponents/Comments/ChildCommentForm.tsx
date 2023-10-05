// libraries
import React, { useEffect, useRef, useState } from 'react';
import { Subscription } from 'rxjs';
import { filter, tap } from 'rxjs/operators';
import { isNilOrError, isPage } from 'utils/helperUtils';
import { useLocation } from 'react-router-dom';

// services
import { canModerateProject } from 'utils/permissions/rules/projectPermissions';

// components
import Button from 'components/UI/Button';
import MentionsTextArea from 'components/UI/MentionsTextArea';
import Avatar from 'components/Avatar';
import clickOutside from 'utils/containers/clickOutside';
import Link from 'utils/cl-router/Link';
import {
  Checkbox,
  IconTooltip,
  Text,
  useBreakpoint,
} from '@citizenlab/cl2-component-library';

// tracking
import { trackEventByName } from 'utils/analytics';
import tracks from './tracks';

// i18n
import { FormattedMessage, MessageDescriptor, useIntl } from 'utils/cl-intl';
import messages from './messages';

// events
import { commentReplyButtonClicked$, commentAdded } from './events';

// style
import styled from 'styled-components';
import { hideVisually } from 'polished';
import { colors, defaultStyles } from 'utils/styleUtils';
import useLocale from 'hooks/useLocale';
import useAppConfiguration from 'api/app_configuration/useAppConfiguration';
import useAuthUser from 'api/me/useAuthUser';
import useAddCommentToIdea from 'api/comments/useAddCommentToIdea';
import useAddCommentToInitiative from 'api/comments/useAddCommentToInitiative';
import OldAnonymousParticipationConfirmationModal from 'components/AnonymousParticipationConfirmationModal/OldAnonymousParticipationConfirmationModal';

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
  border: 1px solid ${colors.borderDark};
  border-radius: ${(props) => props.theme.borderRadius};

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
  display: flex;
  justify-content: flex-end;
  margin-top: 14px;
  margin-bottom: 10px;
  margin-right: 10px;
`;

const CancelButton = styled(Button)`
  margin-right: 8px;
`;

interface Props {
  ideaId: string | undefined;
  initiativeId: string | undefined;
  postType: 'idea' | 'initiative';
  projectId?: string | null;
  parentId: string;
  className?: string;
  allowAnonymousParticipation?: boolean;
}

const ChildCommentForm = ({
  parentId,
  ideaId,
  initiativeId,
  postType,
  projectId,
  className,
  allowAnonymousParticipation,
}: Props) => {
  const { formatMessage } = useIntl();
  const locale = useLocale();
  const { data: appConfiguration } = useAppConfiguration();
  const { data: authUser } = useAuthUser();
  const smallerThanTablet = useBreakpoint('tablet');
  const { pathname } = useLocation();
  const isAdminPage = isPage('admin', pathname);

  const {
    mutate: addCommentToIdeaComment,
    isLoading: isAddCommentToIdeaLoading,
  } = useAddCommentToIdea();
  const {
    mutate: addCommentToInitiativeComment,
    isLoading: isAddCommentToInitiativeLoading,
  } = useAddCommentToInitiative();
  const [inputValue, setInputValue] = useState('');
  const [focused, setFocused] = useState(false);
  const [canSubmit, setCanSubmit] = useState(false);
  const [profanityApiError, setProfanityApiError] = useState(false);
  const [hasApiError, setHasApiError] = useState(false);
  const [postAnonymously, setPostAnonymously] = useState(false);
  const [tagValue, setTagValue] = useState('');
  const [showAnonymousConfirmationModal, setShowAnonymousConfirmationModal] =
    useState(false);
  const textareaElement = useRef<HTMLTextAreaElement | null>(null);
  const processing =
    isAddCommentToIdeaLoading || isAddCommentToInitiativeLoading;
  useEffect(() => {
    const subscriptions: Subscription[] = [
      commentReplyButtonClicked$
        .pipe(
          tap(() => setInputValue('')),
          filter(({ eventValue }) => {
            const { commentId, parentCommentId } = eventValue;
            return commentId === parentId || parentCommentId === parentId;
          })
        )
        .subscribe(({ eventValue }) => {
          const { authorFirstName, authorLastName, authorSlug } = eventValue;
          if (authorFirstName && authorLastName && authorSlug) {
            const tag = `@[${authorFirstName} ${authorLastName}](${authorSlug}) `;
            setTagValue(tag);
            setInputValue(tag);
          }
          setFocused(true);
        }),
    ];

    return () => {
      subscriptions.forEach((subscription) => subscription.unsubscribe());
    };
  }, [parentId]);

  if (!authUser || isNilOrError(locale)) {
    return null;
  }

  const setCaretAtEnd = (element: HTMLTextAreaElement) => {
    if (element.setSelectionRange && element.textContent) {
      element.setSelectionRange(
        element.textContent.length,
        element.textContent.length
      );
    }
  };

  const onChange = (inputValue: string) => {
    const hasEmptyError = inputValue.trim() === '';
    setInputValue(inputValue);
    setHasApiError(false);
    setProfanityApiError(false);
    setCanSubmit(focused && !hasEmptyError);
  };

  const onFocus = () => {
    trackEventByName(tracks.focusChildCommentEditor, {
      extra: {
        postId: ideaId || initiativeId,
        postType,
        parentId,
      },
    });

    setFocused(true);
  };

  const onCancel = () => {
    setFocused(false);
    setInputValue('');
  };

  const onSubmit = async () => {
    if (allowAnonymousParticipation && postAnonymously) {
      setShowAnonymousConfirmationModal(true);
    } else {
      continueSubmission();
    }
  };

  const continueSubmission = async () => {
    if (canSubmit) {
      const commentBodyMultiloc = {
        [locale]: inputValue.replace(/@\[(.*?)\]\((.*?)\)/gi, '@$2'),
      };

      setCanSubmit(false);

      trackEventByName(tracks.clickChildCommentPublish, {
        extra: {
          postId: ideaId || initiativeId,
          postType,
          parentId,
          content: inputValue,
        },
      });

      if (postType === 'idea' && projectId) {
        addCommentToIdeaComment(
          {
            ideaId,
            author_id: authUser.data.id,
            parent_id: parentId,
            body_multiloc: commentBodyMultiloc,
            anonymous: postAnonymously,
          },
          {
            onSuccess: () => {
              commentAdded();
              setInputValue('');
              setFocused(false);
            },
            onError: (error) => {
              const apiErrors = error.errors;
              const profanityApiError = apiErrors.base.find(
                (apiError) => apiError.error === 'includes_banned_words'
              );

              setHasApiError(true);

              if (profanityApiError) {
                trackEventByName(tracks.childCommentProfanityError.name, {
                  locale,
                  ideaId,
                  postType,
                  projectId,
                  profaneMessage: commentBodyMultiloc[locale],
                  location: 'Idea Child Comment Form (citizen side)',
                  userId: authUser.data.id,
                  host: appConfiguration
                    ? appConfiguration.data.attributes.host
                    : null,
                });

                setProfanityApiError(true);
              }
            },
          }
        );
      }

      if (postType === 'initiative') {
        addCommentToInitiativeComment(
          {
            initiativeId,
            author_id: authUser.data.id,
            parent_id: parentId,
            body_multiloc: commentBodyMultiloc,
            anonymous: postAnonymously,
          },
          {
            onSuccess: () => {
              commentAdded();
              setInputValue('');
              setFocused(false);
            },
            onError: (error) => {
              const apiErrors = error.errors;
              const profanityApiError = apiErrors.base.find(
                (apiError) => apiError.error === 'includes_banned_words'
              );

              setHasApiError(true);

              if (profanityApiError) {
                trackEventByName(tracks.childCommentProfanityError.name, {
                  locale,
                  initiativeId,
                  postType,
                  projectId,
                  profaneMessage: commentBodyMultiloc[locale],
                  location: 'Initiative Child Comment Form (citizen side)',
                  userId: authUser.data.id,
                  host: appConfiguration
                    ? appConfiguration.data.attributes.host
                    : null,
                });

                setProfanityApiError(true);
              }
            },
          }
        );
      }
    }
  };

  const setRef = (element: HTMLTextAreaElement) => {
    textareaElement.current = element;

    if (textareaElement.current) {
      textareaElement.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
        inline: 'center',
      });

      setTimeout(() => {
        textareaElement.current?.focus();
      }, 100);

      if (tagValue === inputValue) {
        setTimeout(() => {
          textareaElement.current && setCaretAtEnd(textareaElement.current);
        }, 200);
      }
    }
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

  if (focused) {
    const isModerator = canModerateProject(projectId, authUser);
    const postButtonText: MessageDescriptor = isAdminPage
      ? messages.postPublicComment
      : messages.publishComment;

    return (
      <Container className={`${className || ''} e2e-childcomment-form`}>
        <StyledAvatar
          userId={authUser?.data.id}
          size={30}
          isLinkToProfile={!!authUser?.data.id}
          moderator={isModerator}
        />
        <FormContainer
          onClickOutside={onCancel}
          closeOnClickOutsideEnabled={false}
        >
          <Form className={focused ? 'focused' : ''}>
            <label>
              <HiddenLabel>
                <FormattedMessage {...messages.replyToComment} />
              </HiddenLabel>
              <MentionsTextArea
                className={`childcommentform-${parentId}`}
                name="comment"
                placeholder={formatMessage(
                  messages.childCommentBodyPlaceholder
                )}
                rows={3}
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
              <ButtonWrapper>
                {allowAnonymousParticipation && (
                  <Checkbox
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
                  onClick={onCancel}
                  buttonStyle="secondary"
                  padding={smallerThanTablet ? '6px 12px' : undefined}
                >
                  <FormattedMessage {...messages.cancel} />
                </CancelButton>
                <Button
                  className="e2e-submit-childcomment"
                  processing={processing}
                  onClick={onSubmit}
                  disabled={!canSubmit}
                  padding={smallerThanTablet ? '6px 12px' : undefined}
                  icon={isAdminPage ? 'users' : undefined}
                >
                  <FormattedMessage {...postButtonText} />
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
  }

  return null;
};

export default ChildCommentForm;
