// Libraries
import React, { PureComponent, FormEvent } from 'react';
import { get } from 'lodash-es';
import linkifyHtml from 'linkifyjs/html';
import { Form, Formik, FormikActions } from 'formik';
import { adopt } from 'react-adopt';
import { isNilOrError } from 'utils/helperUtils';

// Router
import Link from 'utils/cl-router/Link';

// Services
import { canModerate } from 'services/permissions/rules/projectPermissions';

// Resources
import GetLocale, { GetLocaleChildProps } from 'resources/GetLocale';
import GetTenantLocales, { GetTenantLocalesChildProps } from 'resources/GetTenantLocales';
import GetComment, { GetCommentChildProps } from 'resources/GetComment';
import GetIdea, { GetIdeaChildProps } from 'resources/GetIdea';
import GetUser, { GetUserChildProps } from 'resources/GetUser';
import GetMachineTranslation from 'resources/GetMachineTranslation';

// i18n
import { getLocalized } from 'utils/i18n';

// Components
import UserName from 'components/UI/UserName';
import MentionsTextArea from 'components/UI/MentionsTextArea';
import Button from 'components/UI/Button';
import Error from 'components/UI/Error';
import QuillEditedContent from 'components/UI/QuillEditedContent';

// Styling
import styled from 'styled-components';
import { darken } from 'polished';
import { colors, media } from 'utils/styleUtils';

// Typings
import { Multiloc, Locale } from 'typings';
import { IUpdatedComment } from 'services/comments';

const Container = styled.div``;

const CommentWrapper = styled.div`
  white-space: pre-line;

  &.child {
    margin-top: 7px;
  }
`;

const StyledLink = styled(Link)`
  display: inline;
  margin-right: 10px;
  text-decoration: none !important;

  ${media.smallerThanMinTablet`
    display: none;
  `}
`;

const StyledUserName = styled(UserName)`
  color: ${({ theme }) => theme.colorText};
  font-weight: 400;
  text-decoration: none !important;
  cursor: pointer;

  &:hover {
    color: ${({ theme }) => darken(0.15, theme.colorText)};
    text-decoration: underline !important;
  }

  &.canModerate {
    color: ${colors.clRed};

    &:hover {
      color: ${darken(0.15, colors.clRed)};
    }
  }
`;

const CommentText = styled.div`
  display: inline;
`;

const StyledForm: any = styled(Form)`
  position: relative;
`;

const ButtonsWrapper = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-top: 1em;

  > * + * {
    margin-left: .5rem;
  }
`;

interface InputProps {
  commentId: string;
  commentType: 'parent' | 'child';
  commentBody: Multiloc;
  editing: boolean;
  last?: boolean;
  onCommentSave: (values: IUpdatedComment, formikActions: FormikActions<IUpdatedComment>) => void;
  onCancelEditing: () => void;
  translateButtonClicked: boolean;
  className?: string;
}

interface DataProps {
  locale: GetLocaleChildProps;
  tenantLocales: GetTenantLocalesChildProps;
  comment: GetCommentChildProps;
  idea: GetIdeaChildProps;
  author: GetUserChildProps;
}

interface Props extends InputProps, DataProps {}

export interface State {}

class CommentBody extends PureComponent<Props, State> {
  getCommentContent = (locale: Locale, tenantLocales: Locale[]) => {
    const commentContent = getLocalized(this.props.commentBody, locale, tenantLocales);
    const linkifiedCommentContent: string = linkifyHtml(commentContent.replace(
      /<span\sclass="cl-mention-user"[\S\s]*?data-user-id="([\S\s]*?)"[\S\s]*?data-user-slug="([\S\s]*?)"[\S\s]*?>([\S\s]*?)<\/span>/gi,
      '<a class="mention" data-link="/profile/$2" href="/profile/$2">$3</a>'
    ));

    return linkifiedCommentContent;
  }

  onCommentSave = async (values, formikActions: FormikActions<IUpdatedComment>) => {
    const { locale } = this.props;

    if (locale) {
      const updatedComment: IUpdatedComment = {
        body_multiloc: {
          [locale]: values.body
        }
      };

      return this.props.onCommentSave(updatedComment, formikActions);
    }
  }

  createFieldChange = (name, setFieldValue) => (value) => {
    setFieldValue(name, value);
  }

  createFieldTouched = (name, setFieldTouched) => () => {
    setFieldTouched(name, true);
  }

  cancelEditing = (event: FormEvent<HTMLButtonElement>) => {
    event.preventDefault();
    this.props.onCancelEditing();
  }

  render() {
    const {
      editing,
      commentBody,
      commentType,
      locale,
      tenantLocales,
      idea,
      author,
      translateButtonClicked,
      commentId,
      className
    } = this.props;
    let content: JSX.Element | null = null;

    if (!isNilOrError(locale) && !isNilOrError(tenantLocales) && !isNilOrError(idea)) {
      const projectId = idea.relationships.project.data.id;
      const authorCanModerate = !isNilOrError(author) && canModerate(projectId, { data: author });

      if (!editing) {
        const CommentBodyContent = ({ text }: { text: string }) => (
          <>
            {commentType === 'child' &&
              <StyledLink to={!isNilOrError(author) ? `/profile/${author.attributes.slug}` : ''}>
                <StyledUserName
                  className={authorCanModerate ? 'canModerate' : ''}
                  user={!isNilOrError(author) ? author : null}
                />
              </StyledLink>
            }
            <CommentText dangerouslySetInnerHTML={{ __html: text }} />
          </>
        );

        content = (
          <CommentWrapper className={`e2e-comment-body ${commentType}`}>
            <QuillEditedContent fontWeight={300}>
              {translateButtonClicked ? (
                <GetMachineTranslation attributeName="body_multiloc" localeTo={locale} commentId={commentId}>
                  {translation => {
                    const text = !isNilOrError(translation) ? translation.attributes.translation : this.getCommentContent(locale, tenantLocales);
                    return <CommentBodyContent text={text} />;
                  }}
                </GetMachineTranslation>
              ) : (
                <CommentBodyContent text={this.getCommentContent(locale, tenantLocales)} />
              )}
            </QuillEditedContent>
          </CommentWrapper>
        );
      } else {
        content = (
          <Formik
            initialValues={{ body: getLocalized(commentBody, locale, tenantLocales) }}
            onSubmit={this.onCommentSave}
          >
            {({ values, errors, handleSubmit, isSubmitting, setFieldValue, setFieldTouched }) => (
              <StyledForm onSubmit={handleSubmit}>
                <MentionsTextArea
                  name="body"
                  value={values.body}
                  rows={1}
                  onBlur={this.createFieldTouched('body', setFieldTouched)}
                  onChange={this.createFieldChange('body', setFieldValue)}
                  padding="1rem"
                />
                <ButtonsWrapper>
                  {errors && errors.body_multiloc && errors.body_multiloc[locale] &&
                    <Error apiErrors={errors.body_multiloc[locale]} />
                  }
                  <Button
                    onClick={this.cancelEditing}
                    icon="close4"
                    style="text"
                  />
                  <Button
                    icon="send"
                    style="primary"
                    processing={isSubmitting}
                  />
                </ButtonsWrapper>
              </StyledForm>
            )}
          </Formik>
        );
      }

      return (
        <Container className={className}>
          {content}
        </Container>
      );
    }

    return null;
  }
}

const Data = adopt<DataProps, InputProps>({
  locale: <GetLocale />,
  tenantLocales: <GetTenantLocales />,
  comment: ({ commentId, render }) => <GetComment id={commentId}>{render}</GetComment>,
  idea: ({ comment, render }) => <GetIdea id={get(comment, 'relationships.idea.data.id')}>{render}</GetIdea>,
  author: ({ comment, render }) => <GetUser id={get(comment, 'relationships.author.data.id')}>{render}</GetUser>
});

export default (inputProps: InputProps) => (
  <Data {...inputProps}>
    {dataProps => <CommentBody {...inputProps} {...dataProps} />}
  </Data>
);
