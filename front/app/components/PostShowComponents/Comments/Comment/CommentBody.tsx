// Libraries
import React, { FormEvent, useEffect, useState } from 'react';
import { isNilOrError } from 'utils/helperUtils';

// Services
import useUpdateComment from 'api/comments/useUpdateComment';
import { IUpdatedComment } from 'api/comments/types';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from '../messages';

// Components
import MentionsTextArea from 'components/UI/MentionsTextArea';
import Error from 'components/UI/Error';
import QuillEditedContent from 'components/UI/QuillEditedContent';

// Styling
import styled, { useTheme } from 'styled-components';

// Typings
import { CLErrorsJSON, CLErrors } from 'typings';
import { isCLErrorJSON } from 'utils/errorUtils';

import Outlet from 'components/Outlet';
import useComment from 'api/comments/useComment';
import useLocale from 'hooks/useLocale';
import { filter } from 'rxjs/operators';
import { Button } from '@citizenlab/cl2-component-library';
import { commentTranslateButtonClicked$ } from '../events';
import useLocalize from 'hooks/useLocalize';

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
  ideaId?: string;
  initiativeId?: string;
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
  initiativeId,
}: Props) => {
  const theme = useTheme();
  const { data: comment } = useComment(commentId);
  const { mutate: updateComment, isLoading: processing } = useUpdateComment({
    ideaId,
    initiativeId,
  });
  const localize = useLocalize();
  const locale = useLocale();

  const [commentContent, setCommentContent] = useState('');
  const [editableCommentContent, setEditableCommentContent] = useState('');
  const [translateButtonClicked, setTranslateButtonClicked] = useState(false);

  const [apiErrors, setApiErrors] = useState<CLErrors | null>(null);
  const [textAreaRef, setTextAreaRef] = useState<HTMLTextAreaElement | null>(
    null
  );

  useEffect(() => {
    if (!isNilOrError(comment) && !commentContent) {
      const setNewCommentContent = () => {
        let commentContent = '';

        commentContent = localize(
          comment.data.attributes.body_multiloc
        ).replace(
          /<span\sclass="cl-mention-user"[\S\s]*?data-user-id="([\S\s]*?)"[\S\s]*?data-user-slug="([\S\s]*?)"[\S\s]*?>([\S\s]*?)<\/span>/gi,
          '<a class="mention" data-link="/profile/$2" href="/profile/$2">$3</a>'
        );

        setCommentContent(commentContent);
      };

      const setNewEditableCommentContent = () => {
        let editableCommentContent = '';

        editableCommentContent = localize(
          comment.data.attributes.body_multiloc
        ).replace(
          /<span\sclass="cl-mention-user"[\S\s]*?data-user-id="([\S\s]*?)"[\S\s]*?data-user-slug="([\S\s]*?)"[\S\s]*?>@([\S\s]*?)<\/span>/gi,
          '@[$3]($2)'
        );

        setEditableCommentContent(editableCommentContent);
      };

      setNewCommentContent();
      setNewEditableCommentContent();
    }
  }, [comment, commentContent, localize]);

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

  const setNewTextAreaRef = (ref: HTMLTextAreaElement) => {
    setTextAreaRef(ref);
    focusEndOfEditingArea();
  };

  const focusEndOfEditingArea = () => {
    if (isNilOrError(textAreaRef) || !editing) return;
    textAreaRef.focus();

    // set caret to end if text content exists
    if (!isNilOrError(textAreaRef.textContent)) {
      textAreaRef.setSelectionRange(
        textAreaRef.textContent.length,
        textAreaRef.textContent.length
      );
    }
  };

  const onEditableCommentContentChange = (editableCommentContent: string) => {
    setEditableCommentContent(editableCommentContent);
  };

  const onSubmit = async (event: FormEvent<any>) => {
    event.preventDefault();

    if (!isNilOrError(locale) && !isNilOrError(comment)) {
      const updatedComment: Omit<IUpdatedComment, 'commentId'> = {
        body_multiloc: {
          [locale]: editableCommentContent.replace(
            /@\[(.*?)\]\((.*?)\)/gi,
            '@$2'
          ),
        },
      };

      const authorId = comment.data.relationships.author.data?.id || null;

      if (authorId) {
        updatedComment.author_id = authorId;
      }

      setApiErrors(null);

      updateComment(
        { commentId, ...updatedComment },
        {
          onSuccess: () => {
            onCommentSaved();
            setCommentContent('');
          },
          onError: (error) => {
            if (isCLErrorJSON(error)) {
              const apiErrors = (error as CLErrorsJSON).json.errors;
              setApiErrors(apiErrors);
            }
          },
        }
      );
    }
  };

  const cancelEditing = (event: React.MouseEvent) => {
    event.preventDefault();
    setEditableCommentContent('');
    onCancelEditing();
  };

  if (isNilOrError(locale)) {
    return null;
  }

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
              apiErrors.body_multiloc &&
              apiErrors.body_multiloc[locale] && (
                <Error apiErrors={apiErrors.body_multiloc[locale]} />
              )}
            <Button buttonStyle="secondary" onClick={cancelEditing}>
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
                locale={locale}
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
