import React, { FormEvent, useEffect, useState, useRef } from 'react';

import { Button } from '@citizenlab/cl2-component-library';
import styled, { useTheme } from 'styled-components';
import { CLErrors } from 'typings';

import { IUpdatedInternalComment } from 'api/internal_comments/types';
import useInternalComment from 'api/internal_comments/useInternalComment';
import useUpdateInternalComment from 'api/internal_comments/useUpdateInternalComment';

import useLocale from 'hooks/useLocale';

import panelStyles from 'components/PostShowComponents/Comments/commentsPanel.module.css';
import {
  panelTextAreaStyle,
  useIsPanelComments,
} from 'components/PostShowComponents/Comments/commentsVariant';
import PanelFormButtons from 'components/PostShowComponents/Comments/CommentForm/PanelFormButtons';
import commentsMessages from 'components/PostShowComponents/Comments/messages';
import {
  formatCommentContent,
  formatEditableCommentContent,
} from 'components/PostShowComponents/utils';
import Error from 'components/UI/Error';
import MentionsTextArea from 'components/UI/MentionsTextArea';
import QuillEditedContent from 'components/UI/QuillEditedContent';

import 'design-system/tokens.css';

import { FormattedMessage, useIntl } from 'utils/cl-intl';
import { isNilOrError } from 'utils/helperUtils';

const Container = styled.div``;

const CommentWrapper = styled.div`
  white-space: pre-line;
`;

export const CommentText = styled.div`
  display: inline;

  .cl-mention-user {
    font-style: italic;
  }
`;

const StyledForm = styled.form`
  position: relative;
`;

const ButtonsWrapper = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-top: 1em;

  > * + * {
    margin-left: 0.5rem;
  }
`;

interface Props {
  ideaId: string | undefined;
  commentId: string;
  commentType: 'parent' | 'child';
  editing: boolean;
  onCommentSaved: () => void;
  onCancelEditing: () => void;
  className?: string;
}

const InternalCommentBody = ({
  commentId,
  commentType,
  editing,
  onCancelEditing,
  onCommentSaved,
  className,
  ideaId,
}: Props) => {
  const theme = useTheme();
  const { formatMessage } = useIntl();
  const isPanel = useIsPanelComments();
  const { data: comment } = useInternalComment(commentId);
  const { mutate: updateComment, isPending: processing } =
    useUpdateInternalComment({
      ideaId,
    });
  const locale = useLocale();

  const [commentContent, setCommentContent] = useState('');
  const [editableCommentContent, setEditableCommentContent] = useState('');
  const [apiErrors, setApiErrors] = useState<CLErrors | null>(null);
  const textareaElement = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    if (comment && !commentContent) {
      setCommentContent(formatCommentContent(comment.data.attributes.body));
      setEditableCommentContent(
        formatEditableCommentContent(comment.data.attributes.body)
      );
    }
  }, [comment, commentContent]);

  useEffect(() => {
    if (editing) {
      textareaElement.current && focusEndOfEditingArea(textareaElement.current);
    }
  }, [editing]);

  if (isNilOrError(locale) || !comment) {
    return null;
  }

  const setNewTextAreaRef = (element: HTMLTextAreaElement) => {
    textareaElement.current = element;

    // TODO: Fix this the next time the file is edited.
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (textareaElement.current) {
      textareaElement.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
        inline: 'center',
      });
    }
  };

  const focusEndOfEditingArea = (element: HTMLTextAreaElement) => {
    // TODO: Fix this the next time the file is edited.
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (element.setSelectionRange && element.textContent) {
      element.setSelectionRange(
        element.textContent.length,
        element.textContent.length
      );
    }
    element.focus();
  };

  const onEditableCommentContentChange = (editableCommentContent: string) => {
    setEditableCommentContent(editableCommentContent);
  };

  const onSubmit = async (event: FormEvent<any>) => {
    event.preventDefault();

    const updatedComment: Omit<IUpdatedInternalComment, 'commentId'> = {
      body: editableCommentContent.replace(/@\[(.*?)\]\((.*?)\)/gi, '@$2'),
    };

    setApiErrors(null);

    updateComment(
      { commentId, ...updatedComment },
      {
        onSuccess: () => {
          onCommentSaved();
          setCommentContent('');
        },
        onError: (error) => {
          // TODO: Fix this the next time the file is edited.
          // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
          const apiErrors = error?.errors;
          setApiErrors(apiErrors);
        },
      }
    );
  };

  const resetEditing = () => {
    setEditableCommentContent(
      formatEditableCommentContent(comment.data.attributes.body)
    );
    onCancelEditing();
  };

  const editError = apiErrors &&
    // TODO: Fix this the next time the file is edited.
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    apiErrors.body_multiloc &&
    apiErrors.body_multiloc[locale] && (
      <Error apiErrors={apiErrors.body_multiloc[locale]} />
    );

  const cancelEditing = (event: React.MouseEvent) => {
    event.preventDefault();
    resetEditing();
  };

  return (
    <Container className={className}>
      {editing ? (
        <StyledForm onSubmit={onSubmit}>
          <QuillEditedContent
            fontWeight={400}
            textColor={theme.colors.tenantText}
          >
            <MentionsTextArea
              name="body"
              id="e2e-internal-comment-edit-textarea"
              value={editableCommentContent}
              rows={1}
              onChange={onEditableCommentContentChange}
              padding={
                isPanel ? 'var(--gv-space-8) var(--gv-space-10)' : '15px'
              }
              color={isPanel ? panelTextAreaStyle.color : undefined}
              fontWeight={isPanel ? panelTextAreaStyle.fontWeight : '300'}
              fontSize={isPanel ? panelTextAreaStyle.fontSize : undefined}
              lineHeight={isPanel ? panelTextAreaStyle.lineHeight : undefined}
              border={
                isPanel
                  ? 'var(--gv-border-width-1) solid var(--gv-border-control)'
                  : undefined
              }
              borderRadius={isPanel ? 'var(--gv-radius-8)' : undefined}
              getTextareaRef={setNewTextAreaRef}
              adminsAndModerators
            />
          </QuillEditedContent>
          {isPanel ? (
            <div className={panelStyles.editFooter}>
              {editError}
              <PanelFormButtons
                cancelLabel={formatMessage(commentsMessages.cancelCommentEdit)}
                submitLabel={formatMessage(commentsMessages.saveCommentEdit)}
                onCancel={resetEditing}
                processing={processing}
                submitId="e2e-save-internal-comment-edit-button"
              />
            </div>
          ) : (
            <ButtonsWrapper>
              {editError}
              <Button buttonStyle="secondary-outlined" onClick={cancelEditing}>
                <FormattedMessage {...commentsMessages.cancelCommentEdit} />
              </Button>
              <Button
                buttonStyle="primary"
                processing={processing}
                onClick={onSubmit}
                id="e2e-save-internal-comment-edit-button"
              >
                <FormattedMessage {...commentsMessages.saveCommentEdit} />
              </Button>
            </ButtonsWrapper>
          )}
        </StyledForm>
      ) : (
        <CommentWrapper className={`e2e-comment-body ${commentType}`}>
          <QuillEditedContent
            fontWeight={400}
            textColor={theme.colors.tenantText}
          >
            <div aria-live="polite">
              <CommentText
                dangerouslySetInnerHTML={{ __html: commentContent }}
              />
            </div>
          </QuillEditedContent>
        </CommentWrapper>
      )}
    </Container>
  );
};

export default InternalCommentBody;
