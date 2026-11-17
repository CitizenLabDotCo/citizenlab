import React, { useState, useRef } from 'react';

import { ClickOutside, useBreakpoint } from '@citizenlab/cl2-component-library';
import { isString, trim } from 'lodash-es';
import { hideVisually } from 'polished';
import styled from 'styled-components';

import useIdeaById from 'api/ideas/useIdeaById';
import useAddInternalCommentToIdea from 'api/internal_comments/useAddInternalCommentToIdea';
import useAuthUser from 'api/me/useAuthUser';

import Avatar from 'components/Avatar';
import PanelFormButtons from 'components/PostShowComponents/Comments/CommentForm/PanelFormButtons';
import panelStyles from 'components/PostShowComponents/Comments/commentsPanel.module.css';
import {
  CommentsVariant,
  defaultCommentFormFrame,
  panelTextAreaStyle,
  useIsPanelComments,
} from 'components/PostShowComponents/Comments/commentsVariant';
import commentsMessages from 'components/PostShowComponents/Comments/messages';
import ButtonWithLink from 'components/UI/ButtonWithLink';
import MentionsTextArea from 'components/UI/MentionsTextArea';

import { trackEventByName } from 'utils/analytics';
import { FormattedMessage, useIntl } from 'utils/cl-intl';

import { commentAdded } from './events';
import tracks from './tracks';
import 'design-system/tokens.css';

const Container = styled.div`
  display: flex;
`;

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

const Form = styled.form<{ variant: CommentsVariant }>`
  flex: 1;
  overflow: hidden;

  ${defaultCommentFormFrame}
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
  const isPanel = useIsPanelComments();
  const {
    mutate: addInternalCommentToIdea,
    isPending: addCommentToIdeaIsLoading,
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
        <Form
          className={`${focused ? 'focused' : ''} ${
            isPanel ? panelStyles.form : ''
          }`}
          variant={isPanel ? 'panel' : 'default'}
        >
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
              color={isPanel ? panelTextAreaStyle.color : undefined}
              fontWeight={isPanel ? panelTextAreaStyle.fontWeight : '300'}
              fontSize={isPanel ? panelTextAreaStyle.fontSize : undefined}
              lineHeight={isPanel ? panelTextAreaStyle.lineHeight : undefined}
              padding="10px"
              borderRadius="none"
              border="none"
              boxShadow="none"
              getTextareaRef={setRef}
              adminsAndModerators
            />
            {isPanel ? (
              (focused || processing) && (
                <div className={panelStyles.formFooter}>
                  <PanelFormButtons
                    cancelLabel={formatMessage(commentsMessages.cancel)}
                    submitLabel={formatMessage(
                      commentsMessages.postInternalComment
                    )}
                    onCancel={close}
                    onSubmit={onSubmit}
                    processing={processing}
                    isCancelDisabled={processing}
                    isSubmitDisabled={hasEmptyError}
                  />
                </div>
              )
            ) : (
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
            )}
          </label>
        </Form>
      </FormContainer>
    </Container>
  );
};

export default InternalParentCommentForm;
