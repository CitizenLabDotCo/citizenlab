import React, { useState, useRef } from 'react';

import { useBreakpoint, colors } from '@citizenlab/cl2-component-library';
import { isString, trim } from 'lodash-es';
import { hideVisually } from 'polished';
import styled from 'styled-components';

import useIdeaById from 'api/ideas/useIdeaById';
import useAddInternalCommentToIdea from 'api/internal_comments/useAddInternalCommentToIdea';
import useAuthUser from 'api/me/useAuthUser';

import Avatar from 'components/Avatar';
import commentsMessages from 'components/PostShowComponents/Comments/messages';
import ButtonWithLink from 'components/UI/ButtonWithLink';
import MentionsTextArea from 'components/UI/MentionsTextArea';

import { trackEventByName } from 'utils/analytics';
import { FormattedMessage, useIntl } from 'utils/cl-intl';
import clickOutside from 'utils/containers/clickOutside';

import { commentAdded } from './events';
import tracks from './tracks';
import { getMentionRoles } from './utils';

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
    border: solid 2px ${(props) => props.theme.colors.tenantPrimary};
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

const CancelButton = styled(ButtonWithLink)`
  margin-right: 8px;
`;

interface Props {
  ideaId: string | undefined;
  postingComment: (arg: boolean) => void;
  className?: string;
}

const InternalParentCommentForm = ({ ideaId, className }: Props) => {
  const { data: authUser } = useAuthUser();
  const { formatMessage } = useIntl();
  const smallerThanTablet = useBreakpoint('tablet');
  const {
    mutate: addInternalCommentToIdea,
    isLoading: addCommentToIdeaIsLoading,
  } = useAddInternalCommentToIdea();

  const textareaElement = useRef<HTMLTextAreaElement | null>(null);
  const [inputValue, setInputValue] = useState('');
  const [focused, setFocused] = useState(false);
  const [hasApiError, setHasApiError] = useState(false);
  const [hasEmptyError, setHasEmptyError] = useState(true);
  const { data: idea } = useIdeaById(ideaId);
  const projectId = idea ? idea.data.relationships.project.data.id : null;

  const processing = addCommentToIdeaIsLoading;

  if (!authUser) {
    return null;
  }

  const onChange = (inputValue: string) => {
    setInputValue(inputValue);
    setFocused(true);
    setHasApiError(false);
    setHasEmptyError(inputValue.trim().length < 1);
  };

  const onFocus = () => {
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
    setFocused(false);

    if (isString(inputValue) && trim(inputValue) !== '') {
      const commentBodyText = inputValue.replace(
        /@\[(.*?)\]\((.*?)\)/gi,
        '@$2'
      );

      trackEventByName(tracks.clickParentCommentPublish, {
        postId: ideaId,
        postType: 'idea',
        content: inputValue,
      });

      if (projectId && ideaId) {
        addInternalCommentToIdea(
          {
            ideaId,
            author_id: authUser.data.id,
            body: commentBodyText,
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
              setHasApiError(true);

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
      return <FormattedMessage {...commentsMessages.addCommentError} />;
    }

    return null;
  };
  const textAreaPlaceholder = formatMessage(
    commentsMessages.notVisibleToUsersPlaceholder
  );

  return (
    <Container className={className || ''}>
      <StyledAvatar
        userId={authUser.data.id}
        size={30}
        isLinkToProfile={!!authUser.data.id}
        showModeratorStyles
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
              <FormattedMessage {...commentsMessages.yourComment} />
            </HiddenLabel>
            <MentionsTextArea
              id="submit-comment"
              className="e2e-parent-comment-form"
              name="comment"
              placeholder={textAreaPlaceholder}
              rows={focused || processing ? 4 : 1}
              postId={ideaId}
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
              roles={getMentionRoles(true)}
            />
            <ButtonWrapper className={focused || processing ? 'visible' : ''}>
              <CancelButton
                disabled={processing}
                onClick={close}
                buttonStyle="secondary-outlined"
                padding={smallerThanTablet ? '6px 12px' : undefined}
              >
                <FormattedMessage {...commentsMessages.cancel} />
              </CancelButton>
              <ButtonWithLink
                className="e2e-submit-parentcomment"
                processing={processing}
                onClick={onSubmit}
                disabled={hasEmptyError}
                padding={smallerThanTablet ? '6px 12px' : undefined}
                icon="shield-check"
              >
                <FormattedMessage {...commentsMessages.postInternalComment} />
              </ButtonWithLink>
            </ButtonWrapper>
          </label>
        </Form>
      </FormContainer>
    </Container>
  );
};

export default InternalParentCommentForm;
