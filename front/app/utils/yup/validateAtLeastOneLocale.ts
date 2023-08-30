import { Multiloc } from 'typings';
import { object, lazy, string } from 'yup';

const validateAtLeastOneLocale = (message: string) => {
  return lazy((multiloc: Multiloc) => {
    const locales = Object.keys(multiloc);

    if (Object.values(multiloc).every((val) => val === '')) {
      return object(
        locales.reduce(
          (acc, locale) => ((acc[locale] = string().required(message)), acc),
          {}
        )
      );
    }
    return object(
      locales.reduce((acc, locale) => ((acc[locale] = string()), acc), {})
    );
  });
};

export default validateAtLeastOneLocale;
