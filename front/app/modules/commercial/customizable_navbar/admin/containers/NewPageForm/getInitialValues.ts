import { Locale } from 'typings';
import { FormValues } from 'components/PageForm';

const getInitialValues = (appConfigurationLocales: Locale[]): FormValues => {
  const titleMultiloc = {};
  const bodyMultiloc = {};

  appConfigurationLocales.forEach((locale) => {
    titleMultiloc[locale] = '';
    bodyMultiloc[locale] = '';
  });

  return {
    title_multiloc: titleMultiloc,
    body_multiloc: bodyMultiloc,
    local_page_files: null,
    slug: undefined,
  };
};

export default getInitialValues;
