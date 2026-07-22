import { Multiloc } from 'typings';
import { object, lazy, string } from 'yup';

import { measureSms } from './segments';

// Like validateMultilocForEveryLocale, but also caps each locale's SMS segment count
// independently — each locale is a separate message, and a char cap would ignore encoding.
const validateSmsBodyMultiloc = (
  requiredMessage: string,
  tooManySegmentsMessage: string
) =>
  lazy((multiloc: Multiloc) => {
    const locales = Object.keys(multiloc);

    return object(
      locales.reduce(
        (acc, locale) => (
          (acc[locale] = string()
            .required(requiredMessage)
            .test(
              'within-sms-segment-limit',
              tooManySegmentsMessage,
              (body) => !body || !measureSms(body).exceedsLimit
            )),
          acc
        ),
        {}
      )
    ).required();
  });

export default validateSmsBodyMultiloc;
