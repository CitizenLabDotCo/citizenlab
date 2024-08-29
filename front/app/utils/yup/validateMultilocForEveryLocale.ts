import { Multiloc } from 'typings';
import { object, lazy, string } from 'yup';

// validates that every key passed in (e.g. for a multiloc)
// has a corresponding value. this is based on the input object
// and not the configured locales

const validateMultilocForEveryLocale = (message: string) =>
  lazy((multiloc: Multiloc) => {
    const locales = Object.keys(multiloc);

    return object(
      locales.reduce(
        (acc, locale) => ((acc[locale] = string().required(message)), acc),
        {}
      )
    );
  });

export default validateMultilocForEveryLocale;
