import React from 'react';
import { isEmpty, some } from 'lodash-es';
import { Field, InjectedFormikProps, FormikErrors, FieldProps } from 'formik';
import styled from 'styled-components';
import { v4 as uuidv4 } from 'uuid';
import { fontSizes } from 'utils/styleUtils';
import { isNilOrError } from 'utils/helperUtils';

// i18n
import { injectIntl, FormattedMessage } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
import messages from './messages';

// Components
import FormikInput from 'components/UI/FormikInput';
import FormikInputMultilocWithLocaleSwitcher from 'components/UI/FormikInputMultilocWithLocaleSwitcher';
import FormikQuillMultiloc from 'components/UI/QuillEditor/FormikQuillMultiloc';
import FormikFileUploader from 'components/UI/FormikFileUploader';
import FormikSubmitWrapper from 'components/admin/FormikSubmitWrapper';
import { Section, SectionField } from 'components/admin/Section';
import ErrorComponent from 'components/UI/Error';
import Warning from 'components/UI/Warning';
import { Label, IconTooltip } from 'cl2-component-library';

// Typings
import { Multiloc, Locale, UploadFile } from 'typings';

// services
import { TPageSlug } from 'services/pages';

// hooks
import useAppConfiguration from 'hooks/useAppConfiguration';
import useLocale from 'hooks/useLocale';
import { validateSlug } from 'utils/textUtils';

const StyledSection = styled(Section)`
  margin-bottom: 30px;
`;

const StyledFormikInput = styled(FormikInput)`
  margin-bottom: 30px;
`;

const StyledFormikQuillMultiloc = styled(FormikQuillMultiloc)`
  max-width: 540px;
`;

const SlugPreview = styled.div`
  margin-bottom: 20px;
  font-size: ${fontSizes.base}px;
`;

export const StyledWarning = styled(Warning)`
  margin-bottom: 15px;
`;

export interface FormValues {
  title_multiloc: Multiloc;
  body_multiloc: Multiloc;
  slug?: TPageSlug;
  local_page_files: UploadFile[] | null;
}

export interface Props {
  slug?: string;
  hideTitle?: boolean;
  hideSlugInput?: boolean;
  pageId: string | null;
}

export function validatePageForm(appConfigurationLocales: Locale[]) {
  return function ({
    title_multiloc,
    body_multiloc,
    slug,
  }: FormValues): FormikErrors<FormValues> {
    const errors: FormikErrors<FormValues> = {};

    // We need to do the check for relevant locales because the
    // backend populates these multilocs with all possible languages.
    // If we don't check for the locales, the forms can pass the
    // validation while none of the locales on the platform have
    // content.
    const titleMultiloc = Object.fromEntries(
      Object.entries(title_multiloc).filter(([locale, _titleMultiloc]) =>
        appConfigurationLocales.includes(locale as Locale)
      )
    );
    const bodyMultiloc = Object.fromEntries(
      Object.entries(body_multiloc).filter(([locale, _bodyMultiloc]) =>
        appConfigurationLocales.includes(locale as Locale)
      )
    );

    // Empty objects ({}) are valid Multilocs, so we need to check
    // for empty objects as well to make sure these don't pass validation
    function emptyCheckMultiloc(multiloc: Multiloc) {
      return isEmpty(multiloc) || some(multiloc, isEmpty);
    }

    if (emptyCheckMultiloc(titleMultiloc)) {
      errors.title_multiloc = [{ error: 'blank' }] as any;
    }
    if (emptyCheckMultiloc(bodyMultiloc)) {
      errors.body_multiloc = [{ error: 'blank' }] as any;
    }
    if (slug && !validateSlug(slug)) {
      errors.slug = 'invalid_slug';
    }
    // This needs to be after invalid slug
    // because this error should overwrite the invalid_slug error
    if (typeof slug === 'string' && slug.length === 0) {
      errors.slug = 'empty_slug';
    }

    return errors;
  };
}

const PageForm = ({
  values,
  isSubmitting,
  errors,
  isValid,
  touched,
  hideTitle,
  hideSlugInput,
  status,
  slug,
  pageId,
  handleSubmit,
  setTouched,
  intl: { formatMessage },
}: InjectedFormikProps<Props, FormValues> & InjectedIntlProps) => {
  const locale = useLocale();
  const appConfig = useAppConfiguration();
  const renderQuill = (props: FieldProps) => {
    return (
      <StyledFormikQuillMultiloc
        label={<FormattedMessage {...messages.editContent} />}
        id={`${slug}-${props.field.name}`}
        withCTAButton
        valueMultiloc={props.field.value}
        {...props}
      />
    );
  };

  const renderFormikInputMultilocWithLocaleSwitcher = (props: FieldProps) => {
    return (
      <FormikInputMultilocWithLocaleSwitcher
        {...props}
        label={<FormattedMessage {...messages.pageTitle} />}
      />
    );
  };

  const renderFileUploader = (props: FieldProps) => {
    return (
      <FormikFileUploader
        id={uuidv4()}
        resourceId={pageId}
        resourceType="page"
        {...props}
      />
    );
  };

  const handleOnSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    handleSubmit();
    setTouched({});
  };

  return (
    <form onSubmit={handleOnSubmit}>
      <StyledSection>
        {!hideTitle && (
          <SectionField>
            <Field
              name="title_multiloc"
              render={renderFormikInputMultilocWithLocaleSwitcher}
            />
            <ErrorComponent
              fieldName="title_multiloc"
              apiErrors={errors.title_multiloc as any}
            />
          </SectionField>
        )}

        <SectionField>
          <Field name="body_multiloc" render={renderQuill} />
          <ErrorComponent
            fieldName="body_multiloc"
            apiErrors={errors.body_multiloc as any}
          />
        </SectionField>

        {!hideSlugInput && (
          <SectionField>
            <Label>
              <FormattedMessage {...messages.pageUrl} />
              <IconTooltip
                content={<FormattedMessage {...messages.slugLabelTooltip} />}
              />
            </Label>
            <StyledWarning>
              <FormattedMessage {...messages.brokenURLWarning} />
            </StyledWarning>
            <Field name="slug" component={StyledFormikInput} />
            {!isNilOrError(appConfig) && (
              <SlugPreview>
                <b>{formatMessage(messages.resultingPageURL)}</b>:{' '}
                {appConfig.data.attributes.host}/{locale}/pages/
                {values.slug}
              </SlugPreview>
            )}
            {/*
              Very hacky way to have the Formik form deal well with client-side validation.
              Ideally needs the API errors implemented as well.
            */}
            {errors.slug === 'empty_slug' && (
              <ErrorComponent
                fieldName="slug"
                text={formatMessage(messages.emptySlugError)}
              />
            )}
            {errors.slug === 'invalid_slug' && (
              <ErrorComponent
                fieldName="slug"
                text={formatMessage(messages.slugRegexError)}
              />
            )}
          </SectionField>
        )}
        <SectionField>
          <Label>
            <FormattedMessage {...messages.fileUploadLabel} />
            <IconTooltip
              content={
                <FormattedMessage {...messages.fileUploadLabelTooltip} />
              }
            />
          </Label>
          <Field name="local_page_files" render={renderFileUploader} />
        </SectionField>
      </StyledSection>

      <FormikSubmitWrapper {...{ isValid, isSubmitting, status, touched }} />
    </form>
  );
};

export default injectIntl(PageForm);
