// Libraries
import React from 'react';
import linkifyHtml from 'linkifyjs/html';
import { Form, Formik, FormikActions } from 'formik';
import { adopt } from 'react-adopt';
import { isNilOrError } from 'utils/helperUtils';

// Utils & Loaders
import GetLocale, { GetLocaleChildProps } from 'resources/GetLocale';
import GetTenantLocales, { GetTenantLocalesChildProps } from 'resources/GetTenantLocales';
import GetMachineTranslation from 'resources/GetMachineTranslation';

import { getLocalized } from 'utils/i18n';

// Components
import MentionsTextArea from 'components/UI/MentionsTextArea';
import Button from 'components/UI/Button';
import Error from 'components/UI/Error';

// Styling
import styled from 'styled-components';
import { transparentize, darken } from 'polished';
import { colors, fontSizes } from 'utils/styleUtils';

const CommentWrapper = styled.div`
  color: ${colors.text};
  font-size: ${fontSizes.base}px;
  line-height: 25px;
  font-weight: 300;
  white-space: pre-line;

  span,
  p {
    margin-bottom: 26px;

    &:last-child {
      margin-bottom: 10px;
    }
  }

  a {
    color: ${colors.clBlueDark};

    &.mention {
      background: ${transparentize(0.9, colors.clBlueDark)};
      padding-left: 4px;
      padding-right: 4px;

      &:hover {
        background: ${transparentize(0.8, colors.clBlueDark)};
      }
    }

    &:not(.mention){
      text-decoration: underline;
      overflow-wrap: break-word;
      word-wrap: break-word;
      word-break: break-all;
      word-break: break-word;
      hyphens: auto;

      &:hover {
        text-decoration: underline;
        color: ${darken(0.15, colors.clBlueDark)};
      }
    }

    &:hover {
      color: ${darken(0.15, colors.clBlueDark)};
    }
  }
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

// Typings
import { Multiloc, Locale } from 'typings';
import { IUpdatedComment } from 'services/comments';

interface InputProps {
  commentBody: Multiloc;
  editionMode: boolean;
  last?: boolean;
  onCommentSave: {(values: IUpdatedComment, formikActions: FormikActions<IUpdatedComment>): void};
  onCancelEdition: {(): void};
  translateButtonClicked: boolean;
  commentId: string;
}

interface DataProps {
  locale: GetLocaleChildProps;
  tenantLocales: GetTenantLocalesChildProps;
}

interface Props extends InputProps, DataProps {}

export interface State {}

class CommentBody extends React.PureComponent<Props, State> {
  getCommentText = (locale: Locale, tenantLocales: Locale[]) => {
    const commentText = getLocalized(this.props.commentBody, locale, tenantLocales);
    const processedCommentText = linkifyHtml(commentText.replace(
      /<span\sclass="cl-mention-user"[\S\s]*?data-user-id="([\S\s]*?)"[\S\s]*?data-user-slug="([\S\s]*?)"[\S\s]*?>([\S\s]*?)<\/span>/gi,
      '<a class="mention" data-link="/profile/$2" href="/profile/$2">$3</a>'
    ));
    return processedCommentText;
  }

  onSaveComment = (values, formikActions) => {
    if (this.props.locale) {
      return this.props.onCommentSave({ body_multiloc: { [this.props.locale]: values.body } }, formikActions);
    }
  }

  createFieldChange = (name, setFieldValue) => (value) => {
    setFieldValue(name, value);
  }

  createFieldTouched = (name, setFieldTouched) => () => {
    setFieldTouched(name, true);
  }

  cancelEdition = (event) => {
    event.preventDefault();
    this.props.onCancelEdition();
  }

  render() {
    const {
      editionMode,
      commentBody,
      locale,
      tenantLocales,
      last,
      translateButtonClicked,
      commentId
    } = this.props;

    if (!isNilOrError(locale) && !isNilOrError(tenantLocales) && !editionMode) {
      return (
        <CommentWrapper className={`e2e-comment-body ${last ? 'last' : ''}`}>
        {translateButtonClicked ?
          <GetMachineTranslation attributeName="body_multiloc" localeTo={locale} commentId={commentId}>
            {translation => {
              return !isNilOrError(translation) ?
                <div dangerouslySetInnerHTML={{ __html: translation.attributes.translation }} />
              :
                null;
            }}
          </GetMachineTranslation>
          :
          <div dangerouslySetInnerHTML={{ __html: this.getCommentText(locale, tenantLocales) }} />
        }
        </CommentWrapper>
      );
    }

    if (!isNilOrError(locale) && !isNilOrError(tenantLocales) && editionMode) {
      return (
        <Formik
          initialValues={{ body: getLocalized(commentBody, locale, tenantLocales) }}
          onSubmit={this.onSaveComment}
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
                {errors && errors.body_multiloc && errors.body_multiloc[locale] && <Error apiErrors={errors.body_multiloc[locale]} />}
                <Button onClick={this.cancelEdition} icon="close2" style="text" circularCorners={false}  />
                <Button icon="send" style="primary" circularCorners={false} processing={isSubmitting} />
              </ButtonsWrapper>
            </StyledForm>
          )}
        </Formik>
      );
    }

    return null;
  }
}

const Data = adopt<DataProps, {}>({
  locale: <GetLocale />,
  tenantLocales: <GetTenantLocales />
});

export default (inputProps: InputProps) => <Data>{dataProps => <CommentBody {...inputProps} {...dataProps} />}</Data>;
