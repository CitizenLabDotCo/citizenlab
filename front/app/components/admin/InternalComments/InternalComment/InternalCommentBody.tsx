// Libraries
import React, { FormEvent, useEffect, useState, useRef } from 'react';
import { isNilOrError } from 'utils/helperUtils';

// Services
import useUpdateInternalComment from 'api/internal_comments/useUpdateInternalComment';
import { IUpdatedInternalComment } from 'api/internal_comments/types';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import commentsMessages from 'components/PostShowComponents/Comments/messages';

// Components
import MentionsTextArea from 'components/UI/MentionsTextArea';
import Error from 'components/UI/Error';
import QuillEditedContent from 'components/UI/QuillEditedContent';

// Styling
import styled, { useTheme } from 'styled-components';

// Typings
import { CLErrors } from 'typings';

import useInternalComment from 'api/internal_comments/useInternalComment';
import useLocale from 'hooks/useLocale';
import { Button } from '@citizenlab/cl2-component-library';

// utils
import { getMentionRoles } from '../utils';
import {
  getCommentContent,
  getEditableCommentContent,
} from 'components/PostShowComponents/Comments/utils';

const Container = styled.div``;

const CommentWrapper = styled.div`
  white-space: pre-line;
`;

export const CommentText = styled.div`
  display: inline;
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
  initiativeId: string | undefined;
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
  initiativeId,
}: Props) => {
  const theme = useTheme();
  const { data: comment } = useInternalComment(commentId);
  const { mutate: updateComment, isLoading: processing } =
    useUpdateInternalComment({
      ideaId,
      initiativeId,
    });
  const locale = useLocale();

  const [commentContent, setCommentContent] = useState('');
  const [editableCommentContent, setEditableCommentContent] = useState('');
  const [apiErrors, setApiErrors] = useState<CLErrors | null>(null);
  const textareaElement = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    if (comment && !commentContent) {
      setCommentContent(getCommentContent(comment.data.attributes.body));
      setEditableCommentContent(
        getEditableCommentContent(comment.data.attributes.body)
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

    if (textareaElement.current) {
      textareaElement.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
        inline: 'center',
      });
    }
  };

  const focusEndOfEditingArea = (element: HTMLTextAreaElement) => {
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
          const apiErrors = error?.errors;
          setApiErrors(apiErrors);
        },
      }
    );
  };

  const cancelEditing = (event: React.MouseEvent) => {
    event.preventDefault();
    setEditableCommentContent(
      getEditableCommentContent(comment.data.attributes.body)
    );
    onCancelEditing();
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
              padding="15px"
              fontWeight="300"
              getTextareaRef={setNewTextAreaRef}
              roles={getMentionRoles(!!ideaId)}
            />
          </QuillEditedContent>
          <ButtonsWrapper>
            {apiErrors &&
              apiErrors.body_multiloc &&
              apiErrors.body_multiloc[locale] && (
                <Error apiErrors={apiErrors.body_multiloc[locale]} />
              )}
            <Button buttonStyle="secondary" onClick={cancelEditing}>
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
