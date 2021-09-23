import React from 'react';
import { isEmpty, some } from 'lodash-es';
import {
  Form,
  Field,
  InjectedFormikProps,
  FormikErrors,
  FieldProps,
} from 'formik';
import styled from 'styled-components';

// Components
import FormikInput from 'components/UI/FormikInput';
import FormikInputMultiloc from 'components/UI/FormikInputMultilocWithLocaleSwitcher';
import FormikQuillMultiloc from 'components/UI/QuillEditor/FormikQuillMultiloc';
import FormikFileUploader from 'components/UI/FormikFileUploader';
import FormikSubmitWrapper from 'components/admin/FormikSubmitWrapper';
import { Section, SectionField } from 'components/admin/Section';
import ErrorComponent from 'components/UI/Error';
import { Label, IconTooltip } from 'cl2-component-library';

// I18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

// Typings
import { Multiloc, Locale } from 'typings';

// services
import { TPageSlug } from 'services/pages';
import { GetResourceFileObjectsChildProps } from 'resources/GetResourceFileObjects';

const StyledSection = styled(Section)`
  margin-bottom: 30px;
`;

const StyledFormikQuillMultiloc = styled(FormikQuillMultiloc)`
  max-width: 540px;
`;

export interface FormValues {
  title_multiloc: Multiloc;
  body_multiloc: Multiloc;
  slug?: TPageSlug;
  local_page_files: GetResourceFileObjectsChildProps;
}

export interface Props {
  slug?: string;
  mode: 'simple' | 'edit';
  hideTitle?: boolean;
  pageId: string | null;
}

export function validatePageForm(appConfigurationLocales: Locale[]) {
  return function (values: FormValues): FormikErrors<FormValues> {
    const errors: FormikErrors<FormValues> = {};

    const titleMultiloc = Object.fromEntries(
      Object.entries(values.title_multiloc).filter(([locale, _titleMultiloc]) =>
        appConfigurationLocales.includes(locale as Locale)
      )
    );

    const bodyMultiloc = Object.fromEntries(
      Object.entries(values.body_multiloc).filter(([locale, _bodyMultiloc]) =>
        appConfigurationLocales.includes(locale as Locale)
      )
    );

    if (some(titleMultiloc, isEmpty)) {
      errors.title_multiloc = [{ error: 'blank' }] as any;
    }

    if (some(bodyMultiloc, isEmpty)) {
      errors.body_multiloc = [{ error: 'blank' }] as any;
    }

    return errors;
  };
}

const PageForm = ({
  isSubmitting,
  errors,
  isValid,
  touched,
  mode,
  hideTitle,
  status,
  slug,
  pageId,
}: InjectedFormikProps<Props, FormValues>) => {
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

  const renderFileUploader = (props: FieldProps) => {
    return (
      <FormikFileUploader resourceId={pageId} resourceType="page" {...props} />
    );
  };

  return (
    <Form>
      <StyledSection>
        {!hideTitle && (
          <SectionField>
            <Field
              name="title_multiloc"
              component={FormikInputMultiloc}
              label={<FormattedMessage {...messages.pageTitle} />}
            />
            {touched.title_multiloc && (
              <ErrorComponent
                fieldName="title_multiloc"
                apiErrors={errors.title_multiloc as any}
              />
            )}
          </SectionField>
        )}

        <SectionField>
          <Field name="body_multiloc" render={renderQuill} />
          {touched.body_multiloc && (
            <ErrorComponent
              fieldName="body_multiloc"
              apiErrors={errors.body_multiloc as any}
            />
          )}
        </SectionField>

        {mode === 'edit' && (
          <SectionField>
            <Field
              name="slug"
              component={FormikInput}
              label={<FormattedMessage {...messages.pageSlug} />}
            />
            {touched.slug && (
              <ErrorComponent fieldName="slug" apiErrors={errors.slug as any} />
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
    </Form>
  );
};

export default PageForm;
