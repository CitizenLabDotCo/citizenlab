import React, { FormEvent, useEffect, useState, useRef } from 'react';

import { Button } from '@citizenlab/cl2-component-library';
import { filter } from 'rxjs/operators';
import styled, { useTheme } from 'styled-components';
import { CLErrors } from 'typings';

import { IUpdatedComment } from 'api/comments/types';
import useComment from 'api/comments/useComment';
import useUpdateComment from 'api/comments/useUpdateComment';

import useLocale from 'hooks/useLocale';
import useLocalize from 'hooks/useLocalize';

import Outlet from 'components/Outlet';
import {
  getCommentContent,
  getEditableCommentContent,
} from 'components/PostShowComponents/Comments/utils';
import Error from 'components/UI/Error';
import MentionsTextArea from 'components/UI/MentionsTextArea';
import QuillEditedContent from 'components/UI/QuillEditedContent';

import { FormattedMessage } from 'utils/cl-intl';
import { isNilOrError } from 'utils/helperUtils';

import { commentTranslateButtonClicked$ } from '../events';
import messages from '../messages';

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
  commentId: string;
  commentType: 'parent' | 'child';
  editing: boolean;
  onCommentSaved: () => void;
  onCancelEditing: () => void;
  className?: string;
}

const CommentBody = ({
  commentId,
  commentType,
  editing,
  onCancelEditing,
  onCommentSaved,
  className,
  ideaId,
}: Props) => {
  const theme = useTheme();
  const { data: comment } = useComment(commentId);
  const { mutate: updateComment, isLoading: processing } = useUpdateComment({
    ideaId,
  });
  const localize = useLocalize();
  const locale = useLocale();

  const [commentContent, setCommentContent] = useState('');
  const [editableCommentContent, setEditableCommentContent] = useState('');
  const [translateButtonClicked, setTranslateButtonClicked] = useState(false);

  const [apiErrors, setApiErrors] = useState<CLErrors | null>(null);
  const textareaElement = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    if (!isNilOrError(comment) && !commentContent) {
      const localizedCommentContent = localize(
        comment.data.attributes.body_multiloc
      );
      const localizedEditableCommentContent = localize(
        comment.data.attributes.body_multiloc
      );
      setCommentContent(getCommentContent(localizedCommentContent));
      setEditableCommentContent(
        getEditableCommentContent(localizedEditableCommentContent)
      );
    }
  }, [comment, commentContent, localize]);

  useEffect(() => {
    if (editing) {
      textareaElement.current && focusEndOfEditingArea(textareaElement.current);
    }
  }, [editing]);

  useEffect(() => {
    const subscription = commentTranslateButtonClicked$
      .pipe(filter(({ eventValue }) => eventValue === commentId))
      .subscribe(() => {
        setTranslateButtonClicked(
          (translateButtonClicked) => !translateButtonClicked
        );
      });

    return () => {
      subscription.unsubscribe();
    };
  }, [commentId]);

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

    if (!isNilOrError(locale)) {
      const updatedComment: Omit<IUpdatedComment, 'commentId'> = {
        body_multiloc: {
          [locale]: editableCommentContent.replace(
            /@\[(.*?)\]\((.*?)\)/gi,
            '@$2'
          ),
        },
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
            setApiErrors(error.errors);
          },
        }
      );
    }
  };

  if (isNilOrError(locale) || !comment) {
    return null;
  }

  const cancelEditing = (event: React.MouseEvent) => {
    event.preventDefault();
    setEditableCommentContent(
      getEditableCommentContent(localize(comment.data.attributes.body_multiloc))
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
              value={editableCommentContent}
              rows={1}
              onChange={onEditableCommentContentChange}
              padding="15px"
              fontWeight="300"
              getTextareaRef={setNewTextAreaRef}
            />
          </QuillEditedContent>
          <ButtonsWrapper>
            {apiErrors &&
              // TODO: Fix this the next time the file is edited.
              // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
              apiErrors.body_multiloc &&
              apiErrors.body_multiloc[locale] && (
                <Error apiErrors={apiErrors.body_multiloc[locale]} />
              )}
            <Button buttonStyle="secondary-outlined" onClick={cancelEditing}>
              <FormattedMessage {...messages.cancelCommentEdit} />
            </Button>
            <Button
              buttonStyle="primary"
              processing={processing}
              onClick={onSubmit}
            >
              <FormattedMessage {...messages.saveCommentEdit} />
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
              <Outlet
                id="app.components.PostShowComponents.CommentBody.translation"
                translateButtonClicked={translateButtonClicked}
                commentContent={commentContent}
                commentId={commentId}
              >
                {(outletComponents) =>
                  outletComponents.length > 0 ? (
                    <>{outletComponents}</>
                  ) : (
                    <CommentText
                      dangerouslySetInnerHTML={{ __html: commentContent }}
                    />
                  )
                }
              </Outlet>
            </div>
          </QuillEditedContent>
        </CommentWrapper>
      )}
    </Container>
  );
};

export default CommentBody;
