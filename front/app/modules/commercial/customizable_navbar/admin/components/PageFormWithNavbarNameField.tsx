import React from 'react';
import { InjectedFormikProps, FormikErrors } from 'formik';

// components
import NavbarTitleField from './NavbarTitleField';
import BasePageForm from 'components/PageForm/BasePageForm';
import PageTitleField from 'components/PageForm/fields/PageTitleField';
import BodyField from 'components/PageForm/fields/BodyField';
import SlugField from 'components/PageForm/fields/SlugField';
import FileUploadField from 'components/PageForm/fields/FileUploadField';

// typings
import { Multiloc, Locale, UploadFile } from 'typings';

// utils
import {
  validateMultiloc,
  validateSlug,
  removeUndefined,
} from 'components/PageForm/fields/validate';

export interface FormValues {
  nav_bar_item_title_multiloc: Multiloc;
  title_multiloc: Multiloc;
  body_multiloc: Multiloc;
  slug?: string;
  local_page_files: UploadFile[] | null;
}

export interface Props {
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

    errors.nav_bar_item_title_multiloc = validateMultiloc(
      nav_bar_item_title_multiloc,
      appConfigurationLocales
    );
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
  pageId,
  ...props
}: InjectedFormikProps<Props, FormValues>) => (
  <BasePageForm values={values} errors={errors} {...props}>
    <NavbarTitleField error={errors.nav_bar_item_title_multiloc} />

    <PageTitleField error={errors.title_multiloc} />

    <BodyField error={errors.body_multiloc} pageId={pageId} />

    <SlugField pageId={pageId} values={values} error={errors.slug} />

    <FileUploadField pageId={pageId} />
  </BasePageForm>
);

export default PageForm;
