// Libraries
import React, { FormEvent, useEffect, useState } from 'react';
import { get } from 'lodash-es';
import { isNilOrError } from 'utils/helperUtils';

// Services
import { updateComment, IUpdatedComment } from 'services/comments';

// Resources

// i18n
import { getLocalized } from 'utils/i18n';
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

// Components
import MentionsTextArea from 'components/UI/MentionsTextArea';
import Button from 'components/UI/Button';
import Error from 'components/UI/Error';
import QuillEditedContent from 'components/UI/QuillEditedContent';

// Styling
import styled, { useTheme } from 'styled-components';

// Typings
import { CLErrorsJSON, CLErrors } from 'typings';
import { isCLErrorJSON } from 'utils/errorUtils';

import Outlet from 'components/Outlet';
import useComment from 'api/comments/useComment';
import useAppConfigurationLocales from 'hooks/useAppConfigurationLocales';
import useLocale from 'hooks/useLocale';

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
  commentId: string;
  commentType: 'parent' | 'child';
  editing: boolean;
  last?: boolean;
  onCommentSaved: () => void;
  onCancelEditing: () => void;
  className?: string;
}

const CommentBody = ({
  commentId,
  commentType,
  editing,
  last,
  onCancelEditing,
  onCommentSaved,
  className,
}: Props) => {
  const theme = useTheme();
  const { data: comment } = useComment(commentId);
  const locale = useLocale();
  const tenantLocales = useAppConfigurationLocales();

  const [commentContent, setCommentContent] = React.useState('');
  const [editableCommentContent, setEditableCommentContent] =
    React.useState('');
  const [translateButtonClicked, setTranslateButtonClicked] =
    React.useState(false);
  const [processing, setProcessing] = React.useState(false);
  const [apiErrors, setApiErrors] = React.useState<CLErrors | null>(null);
  const [textAreaRef, setTextAreaRef] = useState<HTMLTextAreaElement | null>(
    null
  );

  useEffect(() => {
    if (
      !isNilOrError(locale) &&
      !isNilOrError(tenantLocales) &&
      !isNilOrError(comment) &&
      !commentContent
    ) {
      const setNewCommentContent = () => {
        let commentContent = '';

        commentContent = getLocalized(
          comment.data.attributes.body_multiloc,
          locale,
          tenantLocales
        ).replace(
          /<span\sclass="cl-mention-user"[\S\s]*?data-user-id="([\S\s]*?)"[\S\s]*?data-user-slug="([\S\s]*?)"[\S\s]*?>([\S\s]*?)<\/span>/gi,
          '<a class="mention" data-link="/profile/$2" href="/profile/$2">$3</a>'
        );

        setCommentContent(commentContent);
      };

      const setNewEditableCommentContent = () => {
        let editableCommentContent = '';

        editableCommentContent = getLocalized(
          comment.data.attributes.body_multiloc,
          locale,
          tenantLocales
        ).replace(
          /<span\sclass="cl-mention-user"[\S\s]*?data-user-id="([\S\s]*?)"[\S\s]*?data-user-slug="([\S\s]*?)"[\S\s]*?>@([\S\s]*?)<\/span>/gi,
          '@[$3]($2)'
        );

        setEditableCommentContent(editableCommentContent);
      };

      setNewCommentContent();
      setNewEditableCommentContent();
    }
  }, [comment, locale, tenantLocales, commentContent]);

  // componentDidMount() {
  //   this.setCommentContent();
  //   this.setEditableCommentContent();

  //   this.subscriptions = [
  //     commentTranslateButtonClicked$
  //       .pipe(
  //         filter(
  //           ({ eventValue: commentId }) => commentId === this.props.commentId
  //         )
  //       )
  //       .subscribe(() => {
  //         this.setState(({ translateButtonClicked }) => ({
  //           translateButtonClicked: !translateButtonClicked,
  //         }));
  //       }),
  //   ];
  // }

  // componentDidUpdate(prevProps: Props) {
  //   if (prevProps.comment !== this.props.comment) {
  //     this.setCommentContent();
  //     this.setEditableCommentContent();
  //   }
  // }

  // componentWillUnmount() {
  //   this.subscriptions.forEach((subscription) => subscription.unsubscribe());
  // }

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
      const updatedComment: IUpdatedComment = {
        body_multiloc: {
          [locale]: editableCommentContent.replace(
            /@\[(.*?)\]\((.*?)\)/gi,
            '@$2'
          ),
        },
      };

      const authorId = get(comment, 'relationships.author.data.id', false);
      if (authorId) {
        updatedComment.author_id = authorId;
      }
      setProcessing(true);
      setApiErrors(null);

      try {
        await updateComment(commentId, updatedComment);
        onCommentSaved();
      } catch (error) {
        if (isCLErrorJSON(error)) {
          const apiErrors = (error as CLErrorsJSON).json.errors;
          setApiErrors(apiErrors);
        }
      }

      setProcessing(false);
    }
  };

  const cancelEditing = (event: React.MouseEvent) => {
    event.preventDefault();
    setEditableCommentContent('');
    onCancelEditing();
  };

  let content: JSX.Element | null = null;

  if (!isNilOrError(locale)) {
    if (!editing) {
      content = (
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
      );
    } else {
      content = (
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
      );
    }

    return <Container className={className}>{content}</Container>;
  }

  return null;
};

export default CommentBody;
