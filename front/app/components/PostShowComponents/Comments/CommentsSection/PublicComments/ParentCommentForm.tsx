import React, { useState, useRef } from 'react';

import { Box, colors, ClickOutside } from '@citizenlab/cl2-component-library';
import { isString, trim } from 'lodash-es';
import { hideVisually } from 'polished';
import { useLocation } from 'utils/router';
import styled from 'styled-components';

import useAppConfiguration from 'api/app_configuration/useAppConfiguration';
import useAddCommentToIdea from 'api/comments/useAddCommentToIdea';
import useIdeaById from 'api/ideas/useIdeaById';
import useAuthUser from 'api/me/useAuthUser';
import useProjectById from 'api/projects/useProjectById';

import useLocale from 'hooks/useLocale';

import OldAnonymousParticipationConfirmationModal from 'components/AnonymousParticipationConfirmationModal/OldAnonymousParticipationConfirmationModal';
import Avatar from 'components/Avatar';
import ErrorMessage from 'components/PostShowComponents/Comments/CommentForm/ErrorMessage';
import TextArea from 'components/PostShowComponents/Comments/CommentForm/TextArea';

import { ScreenReaderOnly } from 'utils/a11y';
import { trackEventByName } from 'utils/analytics';
import { FormattedMessage, MessageDescriptor, useIntl } from 'utils/cl-intl';
import { isNilOrError, isPage } from 'utils/helperUtils';
import { canModerateProject } from 'utils/permissions/rules/projectPermissions';

import Actions from '../../CommentForm/Actions';
import { commentAdded } from '../../events';
import messages from '../../messages';
import tracks from '../../tracks';

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
    border: solid 2px ${(props) => props.theme.colors.tenantPrimary};
  }
`;

const HiddenLabel = styled.span`
  ${hideVisually()}
`;

interface Props {
  ideaId: string | undefined;
  postingComment: (arg: boolean) => void;
  className?: string;
  allowAnonymousParticipation?: boolean;
}

const ParentCommentForm = ({
  ideaId,
  className,
  allowAnonymousParticipation,
}: Props) => {
  const locale = useLocale();
  const { data: authUser } = useAuthUser();
  const { data: appConfiguration } = useAppConfiguration();
  const { formatMessage } = useIntl();
  const { pathname } = useLocation();
  const isAdminPage = isPage('admin', pathname);
  const { mutate: addCommentToIdea, isLoading: addCommentToIdeaIsLoading } =
    useAddCommentToIdea();

  const textareaElement = useRef<HTMLTextAreaElement | null>(null);
  const [inputValue, setInputValue] = useState('');
  const [focused, setFocused] = useState(false);
  const [commentCancelledMessage, setCommentCancelledMessage] = useState('');
  const [hasApiError, setHasApiError] = useState(false);
  const [profanityApiError, setProfanityApiError] = useState(false);
  const [postAnonymously, setPostAnonymously] = useState(false);
  const [showAnonymousConfirmationModal, setShowAnonymousConfirmationModal] =
    useState(false);
  const { data: idea } = useIdeaById(ideaId);
  const projectId = idea ? idea.data.relationships.project.data.id : null;
  const { data: project } = useProjectById(projectId);

  const processing = addCommentToIdeaIsLoading;

  const hasEmptyError = inputValue.trim().length < 1;

  if (isNilOrError(locale) || isNilOrError(authUser)) {
    return null;
  }

  const onChange = (inputValue: string) => {
    setInputValue(inputValue);
    setFocused(true);
    setHasApiError(false);
    setProfanityApiError(false);
  };

  const onFocus = () => {
    setCommentCancelledMessage('');
    trackEventByName(tracks.focusParentCommentEditor, {
      postId: ideaId,
      postType: 'idea',
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
        postId: ideaId,
        postType: 'idea',
        content: inputValue,
      });

      if (projectId) {
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
                trackEventByName(tracks.parentCommentProfanityError, {
                  locale,
                  ideaId,
                  postType: 'idea',
                  projectId,
                  profaneMessage: commentBodyMultiloc[locale],
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

  const placeholderMessage: MessageDescriptor = isAdminPage
    ? messages.visibleToUsersPlaceholder
    : messages.ideaCommentBodyPlaceholder;
  const placeholder = formatMessage(placeholderMessage);
  const userCanModerate = project
    ? canModerateProject(project.data, authUser)
    : false;

  return (
    <Box display="flex" className={className || ''} my="12px">
      <ScreenReaderOnly aria-live="polite" role="status">
        {commentCancelledMessage}
      </ScreenReaderOnly>
      <StyledAvatar
        userId={authUser.data.id}
        size={30}
        isLinkToProfile={!!authUser.data.id}
        showModeratorStyles={userCanModerate}
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
          </label>
          <TextArea
            id="submit-comment"
            className="e2e-parent-comment-form"
            placeholder={placeholder}
            rows={focused || processing ? 4 : 1}
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
            submitButtonDisabled={hasEmptyError}
            submitButtonClassName="e2e-submit-parentcomment"
            togglePostAnonymously={setPostAnonymously}
            onSubmit={onSubmit}
            onCancel={() => {
              setCommentCancelledMessage(
                formatMessage(messages.a11y_cancelledPostingComment)
              );
              close();
            }}
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
};

export default ParentCommentForm;
