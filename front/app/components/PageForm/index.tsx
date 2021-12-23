import React from 'react';
import { InjectedFormikProps, FormikErrors } from 'formik';

// components
import BasePageForm from './BasePageForm';
import PageTitleField from './fields/PageTitleField';
import BodyField from './fields/BodyField';
import SlugField from './fields/SlugField';
import FileUploadField from './fields/FileUploadField';

// typings
import { Multiloc, Locale, UploadFile } from 'typings';

// utils
import {
  validateMultiloc,
  validateSlug,
  removeUndefined,
} from './fields/validate';

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

export function validatePageForm(
  appConfigurationLocales: Locale[],
  existingSlugs?: Set<string>,
  currentSlug?: string
) {
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
    errors.slug = validateSlug(slug, existingSlugs, currentSlug);

    return removeUndefined(errors);
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
