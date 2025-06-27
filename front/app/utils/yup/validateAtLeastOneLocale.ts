import { Multiloc } from 'typings';
import { object, lazy, string, StringSchema } from 'yup';

interface Props {
  validateEachNonEmptyLocale: (schema: StringSchema) => StringSchema;
}

const validateAtLeastOneLocale = (
  message: string,
  { validateEachNonEmptyLocale }: Props = {
    validateEachNonEmptyLocale: (schema) => schema,
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
      locales.reduce((acc, locale) => {
        acc[locale] =
          multiloc[locale] && multiloc[locale].trim() !== ''
            ? validateEachNonEmptyLocale(string())
            : string();
        return acc;
      }, {})
    );
  });
};

export default validateAtLeastOneLocale;
