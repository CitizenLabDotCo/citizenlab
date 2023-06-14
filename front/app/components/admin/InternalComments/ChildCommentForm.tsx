// libraries
import React, { useEffect, useRef, useState } from 'react';
import { Subscription } from 'rxjs';
import { filter, tap } from 'rxjs/operators';
import { isNilOrError } from 'utils/helperUtils';

// services
import { canModerateProject } from 'services/permissions/rules/projectPermissions';

// components
import Button from 'components/UI/Button';
import MentionsTextArea from 'components/UI/MentionsTextArea';
import Avatar from 'components/Avatar';
import clickOutside from 'utils/containers/clickOutside';
import { useBreakpoint } from '@citizenlab/cl2-component-library';

// tracking
import { trackEventByName } from 'utils/analytics';
import tracks from './tracks';

// i18n
import { FormattedMessage, useIntl } from 'utils/cl-intl';
import commentsMessages from 'components/PostShowComponents/Comments/messages';

// events
import { commentReplyButtonClicked$, commentAdded } from './events';

// style
import styled from 'styled-components';
import { hideVisually } from 'polished';
import { colors, defaultStyles } from 'utils/styleUtils';
import useLocale from 'hooks/useLocale';
import useAuthUser from 'api/me/useAuthUser';
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
  ideaId: string | undefined;
  initiativeId: string | undefined;
  postType: 'idea' | 'initiative';
  projectId?: string | null;
  parentId: string;
  className?: string;
}

const ChildCommentForm = ({
  parentId,
  ideaId,
  initiativeId,
  postType,
  projectId,
  className,
}: Props) => {
  const { formatMessage } = useIntl();
  const locale = useLocale();
  const { data: authUser } = useAuthUser();
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
          if (authorFirstName && authorLastName && authorSlug) {
            const tag = `@[${authorFirstName} ${authorLastName}](${authorSlug}) `;
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

      if (postType === 'initiative') {
        addCommentToInitiativeComment(
          {
            initiativeId,
            author_id: authUser.data.id,
            parent_id: parentId,
            body_multiloc: commentBodyMultiloc,
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

  const getErrorMessage = () => {
    if (hasApiError) {
      return <FormattedMessage {...commentsMessages.addCommentError} />;
    }

    return null;
  };

  if (focused) {
    const isModerator = canModerateProject(projectId, authUser);

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
                <FormattedMessage {...commentsMessages.replyToComment} />
              </HiddenLabel>
              <MentionsTextArea
                className={`childcommentform-${parentId}`}
                name="comment"
                placeholder={formatMessage(
                  commentsMessages.childCommentBodyPlaceholder
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
                <CancelButton
                  disabled={processing}
                  onClick={onCancel}
                  buttonStyle="secondary"
                  padding={smallerThanTablet ? '6px 12px' : undefined}
                >
                  <FormattedMessage {...commentsMessages.cancel} />
                </CancelButton>
                <Button
                  className="e2e-submit-childcomment"
                  processing={processing}
                  onClick={onSubmit}
                  disabled={!canSubmit}
                  padding={smallerThanTablet ? '6px 12px' : undefined}
                >
                  <FormattedMessage {...commentsMessages.publishComment} />
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
