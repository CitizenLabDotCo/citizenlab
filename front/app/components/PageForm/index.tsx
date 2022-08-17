import React from 'react';
import { FormikProps, FormikErrors } from 'formik';

// components
import BasePageForm from './BasePageForm';
import PageTitleField from './fields/PageTitleField';
import BodyField from './fields/BodyField';
import SlugField from './fields/SlugField';
import FileUploadField from './fields/FileUploadField';
import Outlet from 'components/Outlet';

// typings
import { Multiloc, Locale, UploadFile } from 'typings';

// utils
import {
  validateMultiloc,
  validateSlug,
  removeUndefined,
} from './fields/validate';

export interface FormValues {
  nav_bar_item_title_multiloc: Multiloc;
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
    nav_bar_item_title_multiloc,
    title_multiloc,
    body_multiloc,
    slug,
  }: FormValues): FormikErrors<FormValues> {
    const errors: FormikErrors<FormValues> = {};

    errors.nav_bar_item_title_multiloc = nav_bar_item_title_multiloc
      ? validateMultiloc(nav_bar_item_title_multiloc, appConfigurationLocales)
      : {};
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
}: FormikProps<FormValues> & Props) => (
  <BasePageForm values={values} errors={errors} {...props}>
    <Outlet id="app.components.PageForm.index.top" errors={errors} />
    {!hideTitle && <PageTitleField error={errors.title_multiloc} />}

    <BodyField error={errors.body_multiloc} pageId={pageId} />

    {!hideSlugInput && (
      <SlugField pageId={pageId} values={values} error={errors.slug} />
    )}

    <FileUploadField pageId={pageId} />
  </BasePageForm>
);

export default PageForm;
