import React, { useEffect, useRef, useState } from 'react';

import { Box, colors, ClickOutside } from '@citizenlab/cl2-component-library';
import { hideVisually } from 'polished';
import { Subscription } from 'rxjs';
import { filter, tap } from 'rxjs/operators';
import styled from 'styled-components';

import useAppConfiguration from 'api/app_configuration/useAppConfiguration';
import useAddCommentToIdea from 'api/comments/useAddCommentToIdea';
import useAuthUser from 'api/me/useAuthUser';
import useProjectById from 'api/projects/useProjectById';

import useLocale from 'hooks/useLocale';

import OldAnonymousParticipationConfirmationModal from 'components/AnonymousParticipationConfirmationModal/OldAnonymousParticipationConfirmationModal';
import Avatar from 'components/Avatar';
import Actions from 'components/PostShowComponents/Comments/CommentForm/Actions';
import ErrorMessage from 'components/PostShowComponents/Comments/CommentForm/ErrorMessage';
import TextArea from 'components/PostShowComponents/Comments/CommentForm/TextArea';

import { trackEventByName } from 'utils/analytics';
import { FormattedMessage, useIntl } from 'utils/cl-intl';
import { isNilOrError } from 'utils/helperUtils';
import { canModerateProject } from 'utils/permissions/rules/projectPermissions';

import { commentReplyButtonClicked$, commentAdded } from '../../../events';
import messages from '../../../messages';
import tracks from '../../../tracks';

const StyledAvatar = styled(Avatar)`
  margin-left: -4px;
  margin-right: 5px;
  margin-top: 3px;
`;

const FormContainer = styled(ClickOutside)`
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
    border: solid 2px ${(props) => props.theme.colors.tenantPrimary};
  }
`;

const HiddenLabel = styled.span`
  ${hideVisually()}
`;

interface Props {
  ideaId: string | undefined;
  projectId?: string | null;
  parentId: string;
  className?: string;
  allowAnonymousParticipation?: boolean;
}

const ChildCommentForm = ({
  parentId,
  ideaId,
  projectId,
  className,
  allowAnonymousParticipation,
}: Props) => {
  const { formatMessage } = useIntl();
  const locale = useLocale();
  const { data: appConfiguration } = useAppConfiguration();
  const { data: authUser } = useAuthUser();
  const { data: project } = useProjectById(projectId);

  const {
    mutate: addCommentToIdeaComment,
    isLoading: isAddCommentToIdeaLoading,
  } = useAddCommentToIdea();

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
  const processing = isAddCommentToIdeaLoading;
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
    // TODO: Fix this the next time the file is edited.
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
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
      postId: ideaId,
      postType: 'idea',
      parentId,
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
        postId: ideaId,
        postType: 'idea',
        parentId,
        content: inputValue,
      });

      if (projectId) {
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
                trackEventByName(tracks.childCommentProfanityError, {
                  locale,
                  ideaId,
                  postType: 'idea',
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
    }
  };

  const setRef = (element: HTMLTextAreaElement) => {
    textareaElement.current = element;

    // TODO: Fix this the next time the file is edited.
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
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

  const userCanModerate = project
    ? canModerateProject(project.data, authUser)
    : false;

  if (focused) {
    return (
      <Box
        display="flex"
        className={`${className || ''} e2e-childcomment-form`}
      >
        <StyledAvatar
          // TODO: Fix this the next time the file is edited.
          // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
          userId={authUser?.data.id}
          size={30}
          // TODO: Fix this the next time the file is edited.
          // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
          isLinkToProfile={!!authUser?.data.id}
          showModeratorStyles={userCanModerate}
        />
        <FormContainer
          onClickOutside={onCancel}
          closeOnClickOutsideEnabled={false}
        >
          {/* TODO: Fix this the next time the file is edited. */}
          {/* eslint-disable-next-line @typescript-eslint/no-unnecessary-condition */}
          <Form className={focused ? 'focused' : ''}>
            <label>
              <HiddenLabel>
                <FormattedMessage {...messages.replyToComment} />
              </HiddenLabel>
            </label>
            <TextArea
              className={`childcommentform-${parentId}`}
              placeholder={formatMessage(messages.childCommentBodyPlaceholder)}
              rows={3}
              postId={ideaId}
              value={inputValue}
              error={
                hasApiError ? (
                  <ErrorMessage profanityApiError={profanityApiError} />
                ) : undefined
              }
              onChange={onChange}
              onFocus={onFocus}
              getTextAreaRef={setRef}
            />
            <Actions
              processing={processing}
              focused={focused}
              postAnonymously={postAnonymously}
              allowAnonymousParticipation={allowAnonymousParticipation}
              submitButtonDisabled={!canSubmit}
              submitButtonClassName="e2e-submit-childcomment"
              togglePostAnonymously={setPostAnonymously}
              onSubmit={onSubmit}
              onCancel={onCancel}
            />
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
      </Box>
    );
  }

  return null;
};

export default ChildCommentForm;
