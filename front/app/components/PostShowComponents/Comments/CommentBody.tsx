// Libraries
import React, { PureComponent, FormEvent } from 'react';
import { Subscription } from 'rxjs';
import { get } from 'lodash-es';
import { adopt } from 'react-adopt';
import { isNilOrError } from 'utils/helperUtils';

// Services
import { updateComment, IUpdatedComment } from 'services/comments';

// Resources
import GetLocale, { GetLocaleChildProps } from 'resources/GetLocale';
import GetAppConfigurationLocales, {
  GetAppConfigurationLocalesChildProps,
} from 'resources/GetAppConfigurationLocales';
import GetComment, { GetCommentChildProps } from 'resources/GetComment';

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
import styled, { withTheme } from 'styled-components';

// Typings
import { CLErrorsJSON, CLErrors } from 'typings';
import { isCLErrorJSON } from 'utils/errorUtils';

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

interface InputProps {
  commentId: string;
  commentType: 'parent' | 'child';
  editing: boolean;
  last?: boolean;
  onCommentSaved: () => void;
  onCancelEditing: () => void;
  className?: string;
}

interface DataProps {
  locale: GetLocaleChildProps;
  tenantLocales: GetAppConfigurationLocalesChildProps;
  comment: GetCommentChildProps;
}

interface Props extends InputProps, DataProps {
  theme: any;
}

export interface State {
  commentContent: string;
  editableCommentContent: string;
  processing: boolean;
  apiErrors: CLErrors | null;
  textAreaRef?: HTMLTextAreaElement | null;
}

class CommentBody extends PureComponent<Props, State> {
  subscriptions: Subscription[] = [];
  textAreaRef: HTMLTextAreaElement;

  constructor(props: Props) {
    super(props);
    this.state = {
      commentContent: '',
      editableCommentContent: '',
      processing: false,
      apiErrors: null,
      textAreaRef: null,
    };
  }

  componentDidMount() {
    this.setCommentContent();
    this.setEditableCommentContent();
  }

  componentDidUpdate(prevProps: Props) {
    if (prevProps.comment !== this.props.comment) {
      this.setCommentContent();
      this.setEditableCommentContent();
    }
  }

  componentWillUnmount() {
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
  }

  setCommentContent = () => {
    let commentContent = '';
    const { comment, locale, tenantLocales } = this.props;

    if (
      !isNilOrError(locale) &&
      !isNilOrError(tenantLocales) &&
      !isNilOrError(comment)
    ) {
      commentContent = getLocalized(
        comment.attributes.body_multiloc,
        locale,
        tenantLocales
      ).replace(
        /<span\sclass="cl-mention-user"[\S\s]*?data-user-id="([\S\s]*?)"[\S\s]*?data-user-slug="([\S\s]*?)"[\S\s]*?>([\S\s]*?)<\/span>/gi,
        '<a class="mention" data-link="/profile/$2" href="/profile/$2">$3</a>'
      );
    }

    this.setState({ commentContent });
  };

  setEditableCommentContent = () => {
    let editableCommentContent = '';
    const { comment, locale, tenantLocales } = this.props;

    if (
      !isNilOrError(locale) &&
      !isNilOrError(tenantLocales) &&
      !isNilOrError(comment)
    ) {
      editableCommentContent = getLocalized(
        comment.attributes.body_multiloc,
        locale,
        tenantLocales
      ).replace(
        /<span\sclass="cl-mention-user"[\S\s]*?data-user-id="([\S\s]*?)"[\S\s]*?data-user-slug="([\S\s]*?)"[\S\s]*?>@([\S\s]*?)<\/span>/gi,
        '@[$3]($2)'
      );
    }

    this.setState({ editableCommentContent });
  };

  setTextAreaRef = (ref: HTMLTextAreaElement) => {
    this.textAreaRef = ref;
    this.focusEndOfEditingArea();
  };

  focusEndOfEditingArea = () => {
    if (isNilOrError(this.textAreaRef) || !this.props.editing) return;
    this.textAreaRef.focus();

    // set caret to end if text content exists
    if (!isNilOrError(this.textAreaRef.textContent)) {
      this.textAreaRef.setSelectionRange(
        this.textAreaRef.textContent.length,
        this.textAreaRef.textContent.length
      );
    }
  };

  onEditableCommentContentChange = (editableCommentContent: string) => {
    this.setState({ editableCommentContent });
  };

  onSubmit = async (event: FormEvent<any>) => {
    event.preventDefault();

    const { locale, commentId, comment } = this.props;
    const { editableCommentContent } = this.state;

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

      this.setState({ processing: true, apiErrors: null });

      try {
        await updateComment(commentId, updatedComment);
        this.props.onCommentSaved();
      } catch (error) {
        if (isCLErrorJSON(error)) {
          const apiErrors = (error as CLErrorsJSON).json.errors;
          this.setState({ apiErrors });
        }
      }

      this.setState({ processing: false });
    }
  };

  cancelEditing = (event: React.MouseEvent) => {
    event.preventDefault();
    this.setEditableCommentContent();
    this.props.onCancelEditing();
  };

  render() {
    const { editing, commentType, locale, className, theme } = this.props;

    const { commentContent, editableCommentContent, processing, apiErrors } =
      this.state;

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
                <CommentText
                  dangerouslySetInnerHTML={{ __html: commentContent }}
                />
              </div>
            </QuillEditedContent>
          </CommentWrapper>
        );
      } else {
        content = (
          <StyledForm onSubmit={this.onSubmit}>
            <QuillEditedContent
              fontWeight={400}
              textColor={theme.colors.tenantText}
            >
              <MentionsTextArea
                name="body"
                value={editableCommentContent}
                rows={1}
                onChange={this.onEditableCommentContentChange}
                padding="15px"
                fontWeight="300"
                getTextareaRef={this.setTextAreaRef}
              />
            </QuillEditedContent>
            <ButtonsWrapper>
              {apiErrors &&
                apiErrors.body_multiloc &&
                apiErrors.body_multiloc[locale] && (
                  <Error apiErrors={apiErrors.body_multiloc[locale]} />
                )}
              <Button buttonStyle="secondary" onClick={this.cancelEditing}>
                <FormattedMessage {...messages.cancelCommentEdit} />
              </Button>
              <Button
                buttonStyle="primary"
                processing={processing}
                onClick={this.onSubmit}
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
  }
}

const CommentBodyWithHoC = withTheme(CommentBody);

const Data = adopt<DataProps, InputProps>({
  locale: <GetLocale />,
  tenantLocales: <GetAppConfigurationLocales />,
  comment: ({ commentId, render }) => (
    <GetComment id={commentId}>{render}</GetComment>
  ),
});

export default (inputProps: InputProps) => (
  <Data {...inputProps}>
    {(dataProps) => <CommentBodyWithHoC {...inputProps} {...dataProps} />}
  </Data>
);
