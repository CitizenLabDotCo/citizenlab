import { Multiloc } from 'typings';
import { object, lazy, string, StringSchema } from 'yup';

interface Props {
  validateEachLocale: (schema: StringSchema) => StringSchema;
}

const validateAtLeastOneLocale = (
  message: string,
  { validateEachLocale }: Props = {
    validateEachLocale: (schema) => schema,
  }
) => {
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
      locales.reduce(
        (acc, locale) => ((acc[locale] = validateEachLocale(string())), acc),
        {}
      )
    );
  });
};

export default validateAtLeastOneLocale;
