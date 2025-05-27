import React, { useEffect, useRef, useState } from 'react';

import { useBreakpoint, colors } from '@citizenlab/cl2-component-library';
import { hideVisually } from 'polished';
import { Subscription } from 'rxjs';
import { filter, tap } from 'rxjs/operators';
import styled from 'styled-components';

import useAddInternalCommentToIdea from 'api/internal_comments/useAddInternalCommentToIdea';
import useAuthUser from 'api/me/useAuthUser';

import Avatar from 'components/Avatar';
import commentsMessages from 'components/PostShowComponents/Comments/messages';
import ButtonWithLink from 'components/UI/ButtonWithLink';
import MentionsTextArea from 'components/UI/MentionsTextArea';

import { trackEventByName } from 'utils/analytics';
import { FormattedMessage, useIntl } from 'utils/cl-intl';
import clickOutside from 'utils/containers/clickOutside';

import { commentReplyButtonClicked$, commentAdded } from './events';
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

const ButtonWrapper = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-top: 14px;
  margin-bottom: 10px;
  margin-right: 10px;
`;

const CancelButton = styled(ButtonWithLink)`
  margin-right: 8px;
`;

interface Props {
  ideaId: string | undefined;
  projectId?: string | null;
  parentId: string;
  className?: string;
}

const InternalChildCommentForm = ({
  parentId,
  ideaId,
  projectId,
  className,
}: Props) => {
  const { formatMessage } = useIntl();
  const { data: authUser } = useAuthUser();
  const smallerThanTablet = useBreakpoint('tablet');

  const {
    mutate: addCommentToIdeaComment,
    isLoading: isAddCommentToIdeaLoading,
  } = useAddInternalCommentToIdea();

  const [inputValue, setInputValue] = useState('');
  const [focused, setFocused] = useState(false);
  const [canSubmit, setCanSubmit] = useState(false);
  const [hasApiError, setHasApiError] = useState(false);
  const [tagValue, setTagValue] = useState('');
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

  if (!authUser) {
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
    if (canSubmit) {
      const commentBodyText = inputValue.replace(
        /@\[(.*?)\]\((.*?)\)/gi,
        '@$2'
      );

      setCanSubmit(false);

      trackEventByName(tracks.clickChildCommentPublish, {
        postId: ideaId,
        postType: 'idea',
        parentId,
        content: inputValue,
      });

      if (projectId && ideaId) {
        addCommentToIdeaComment(
          {
            ideaId,
            author_id: authUser.data.id,
            parent_id: parentId,
            body: commentBodyText,
          },
          {
            onSuccess: () => {
              commentAdded();
              setInputValue('');
              setFocused(false);
            },
            onError: (_error) => {
              setHasApiError(true);
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
        // TODO: Fix this the next time the file is edited.
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        textareaElement?.current?.focus();
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
      return <FormattedMessage {...commentsMessages.addCommentError} />;
    }

    return null;
  };

  if (focused) {
    return (
      <Container className={`${className || ''}`}>
        <StyledAvatar
          // TODO: Fix this the next time the file is edited.
          // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
          userId={authUser?.data.id}
          size={30}
          // TODO: Fix this the next time the file is edited.
          // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
          isLinkToProfile={!!authUser?.data.id}
          showModeratorStyles
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
                <FormattedMessage {...commentsMessages.replyToComment} />
              </HiddenLabel>
              <MentionsTextArea
                className={`childcommentform-${parentId}`}
                id="e2e-internal-child-comment-text-area"
                name="comment"
                placeholder={formatMessage(
                  commentsMessages.childCommentBodyPlaceholder
                )}
                rows={3}
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
              <ButtonWrapper>
                <CancelButton
                  disabled={processing}
                  onClick={onCancel}
                  buttonStyle="secondary-outlined"
                  padding={smallerThanTablet ? '6px 12px' : undefined}
                >
                  <FormattedMessage {...commentsMessages.cancel} />
                </CancelButton>
                <ButtonWithLink
                  className="e2e-submit-childcomment"
                  processing={processing}
                  onClick={onSubmit}
                  disabled={!canSubmit}
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
  }

  return null;
};

export default InternalChildCommentForm;
