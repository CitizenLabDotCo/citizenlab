// libraries
import React, { useEffect, useRef, useState } from 'react';
import { Subscription } from 'rxjs';
import { filter, tap } from 'rxjs/operators';
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
import { FormattedMessage, useIntl } from 'utils/cl-intl';
import messages from './messages';

// services
import { canModerateProject } from 'services/permissions/rules/projectPermissions';

// events
import { commentReplyButtonClicked$, commentAdded } from './events';

// style
import styled from 'styled-components';
import { hideVisually } from 'polished';
import { colors, defaultStyles } from 'utils/styleUtils';
import useLocale from 'hooks/useLocale';
import useAppConfiguration from 'api/app_configuration/useAppConfiguration';
import useAuthUser from 'hooks/useAuthUser';
import { useBreakpoint } from '@citizenlab/cl2-component-library';
import useAddCommentToIdea from 'api/comments/useAddCommentToIdea';
import useAddCommentToInitiative from 'api/comments/useAddCommentToInitiative';

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
  postId: string;
  postType: 'idea' | 'initiative';
  projectId?: string | null;
  parentId: string;
  className?: string;
}

const ChildCommentForm = ({
  parentId,
  postId,
  postType,
  projectId,
  className,
}: Props) => {
  const { formatMessage } = useIntl();
  const locale = useLocale();
  const { data: appConfiguration } = useAppConfiguration();
  const authUser = useAuthUser();
  const smallerThanTablet = useBreakpoint('tablet');

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
          const tag = `@[${authorFirstName} ${authorLastName}](${authorSlug}) `;
          setInputValue(tag);
          setFocused(true);
        }),
    ];

    return () => {
      subscriptions.forEach((subscription) => subscription.unsubscribe());
    };
  }, [parentId]);

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
        postId,
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
    if (!isNilOrError(locale) && !isNilOrError(authUser) && canSubmit) {
      const commentBodyMultiloc = {
        [locale]: inputValue.replace(/@\[(.*?)\]\((.*?)\)/gi, '@$2'),
      };

      setCanSubmit(false);

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
          addCommentToIdeaComment(
            {
              ideaId: postId,
              author_id: authUser.id,
              parent_id: parentId,
              body_multiloc: commentBodyMultiloc,
            },
            {
              onSuccess: () => {
                commentAdded();
                setInputValue('');
                setFocused(false);
              },
              onError: (error) => {
                const apiErrors = error.json.errors;
                const profanityApiError = apiErrors.base.find(
                  (apiError) => apiError.error === 'includes_banned_words'
                );

                setHasApiError(true);

                if (profanityApiError) {
                  trackEventByName(tracks.childCommentProfanityError.name, {
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
              },
            }
          );
        }

        if (postType === 'initiative') {
          addCommentToInitiativeComment(
            {
              initiativeId: postId,
              author_id: authUser.id,
              parent_id: parentId,
              body_multiloc: commentBodyMultiloc,
            },
            {
              onSuccess: () => {
                commentAdded();
                setInputValue('');
                setFocused(false);
              },
            }
          );
        }
      } catch (error) {
        const apiErrors = error.json.errors;
        const profanityApiError = apiErrors.base.find(
          (apiError) => apiError.error === 'includes_banned_words'
        );

        setHasApiError(true);

        if (profanityApiError) {
          trackEventByName(tracks.childCommentProfanityError.name, {
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
        textareaElement?.current?.focus();
      }, 100);

      setTimeout(() => {
        textareaElement?.current && setCaretAtEnd(textareaElement.current);
      }, 200);
    }
  };

  const placeholder = formatMessage(messages.childCommentBodyPlaceholder);

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

  if (!isNilOrError(authUser) && focused) {
    const isModerator =
      !isNilOrError(authUser) && canModerateProject(postId, { data: authUser });

    return (
      <Container className={`${className || ''} e2e-childcomment-form`}>
        <StyledAvatar
          userId={authUser?.id}
          size={30}
          isLinkToProfile={!!authUser?.id}
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
                placeholder={placeholder}
                rows={3}
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
              <ButtonWrapper>
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

export default ChildCommentForm;
