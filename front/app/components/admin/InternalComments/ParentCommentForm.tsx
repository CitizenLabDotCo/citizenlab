import React, { useState, useRef } from 'react';
import { isString, trim } from 'lodash-es';
import { isNilOrError } from 'utils/helperUtils';

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
}

const ParentCommentForm = ({
  ideaId,
  initiativeId,
  postType,
  className,
}: Props) => {
  const locale = useLocale();
  const { data: authUser } = useAuthUser();
  const { formatMessage } = useIntl();
  const smallerThanTablet = useBreakpoint('tablet');
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
  const [hasEmptyError, setHasEmptyError] = useState(true);
  const { data: idea } = useIdeaById(ideaId);
  const projectId = idea ? idea.data.relationships.project.data.id : null;

  const processing =
    addCommentToIdeaIsLoading || addCommentToInitiativeIsLoading;

  if (isNilOrError(locale) || !authUser) {
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

      if (postType === 'initiative') {
        addCommentToInitiative(
          {
            initiativeId,
            author_id: authUser.data.id,
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

  return (
    <Container className={className || ''}>
      <StyledAvatar
        userId={authUser.data.id}
        size={30}
        isLinkToProfile={!!authUser.data.id}
        moderator
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
              placeholder={formatMessage(
                commentsMessages[`${postType}CommentBodyPlaceholder`]
              )}
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
              <CancelButton
                disabled={processing}
                onClick={close}
                buttonStyle="secondary"
                padding={smallerThanTablet ? '6px 12px' : undefined}
              >
                <FormattedMessage {...commentsMessages.cancel} />
              </CancelButton>
              <Button
                className="e2e-submit-parentcomment"
                processing={processing}
                onClick={onSubmit}
                disabled={hasEmptyError}
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
};

export default ParentCommentForm;
