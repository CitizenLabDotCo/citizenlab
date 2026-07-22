import { Multiloc } from 'typings';
import { object, lazy, string } from 'yup';

import { measureSms } from './segments';

// Like validateMultilocForEveryLocale, but also caps how many SMS segments each locale's
// body costs. Recipients are sent the message in their own language, so every translation
// is a separate message and is capped independently — one translation can blow the limit
// while the others fit, especially in a language that falls outside GSM-7.
//
// A raw character cap would be the wrong tool: the same 600 characters are 4 segments in
// English and 9 in Arabic.
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
