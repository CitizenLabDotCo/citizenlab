import React from 'react';
import { isEmpty, some } from 'lodash-es';
import { InjectedFormikProps, FormikErrors } from 'formik';
import { validateSlug } from 'utils/textUtils';

// components
import BasePageForm from './BasePageForm';
import PageTitleField from './PageTitleField';
import BodyField from './BodyField';
import SlugField from './SlugField';
import FileUploadField from './FileUploadField';

// typings
import { Multiloc, Locale, UploadFile } from 'typings';

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
  errors,
  hideTitle,
  hideSlugInput,
  pageId,
  ...props
}: InjectedFormikProps<Props, FormValues>) => {
  return (
    <BasePageForm values={values} errors={errors} {...props}>
      {!hideTitle && <PageTitleField error={errors.title_multiloc} />}

      <BodyField error={errors.body_multiloc} pageId={pageId} />

      {!hideSlugInput && (
        <SlugField pageId={pageId} values={values} error={errors.slug} />
      )}

      <FileUploadField pageId={pageId} />
    </BasePageForm>
  );
};

export default PageForm;
