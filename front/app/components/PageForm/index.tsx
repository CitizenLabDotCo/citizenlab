import React from 'react';
import { InjectedFormikProps, FormikErrors } from 'formik';
import { validateSlug } from 'utils/textUtils';

// components
import BasePageForm from './BasePageForm';
import PageTitleField from './fields/PageTitleField';
import BodyField from './fields/BodyField';
import SlugField from './fields/SlugField';
import FileUploadField from './fields/FileUploadField';

// typings
import { Multiloc, Locale, UploadFile } from 'typings';

// utils
import { validateMultiloc } from './fields/validate';

export interface FormValues {
  title_multiloc: Multiloc;
  body_multiloc: Multiloc;
  slug?: string;
  local_page_files: UploadFile[] | null;
}

export interface Props {
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

    errors.title_multiloc = validateMultiloc(
      title_multiloc,
      appConfigurationLocales
    );
    errors.body_multiloc = validateMultiloc(
      body_multiloc,
      appConfigurationLocales
    );

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
  errors,
  hideTitle,
  hideSlugInput,
  pageId,
  ...props
}: InjectedFormikProps<Props, FormValues>) => (
  <BasePageForm values={values} errors={errors} {...props}>
    {!hideTitle && <PageTitleField error={errors.title_multiloc} />}

    <BodyField error={errors.body_multiloc} pageId={pageId} />

    {!hideSlugInput && (
      <SlugField pageId={pageId} values={values} error={errors.slug} />
    )}

    <FileUploadField pageId={pageId} />
  </BasePageForm>
);

export default PageForm;
