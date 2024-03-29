import { IntlShape } from 'react-intl';
import { Locale } from 'typings';

export type AllMessages = Record<Locale, Record<string, string>>;
export type IntlShapes = Record<Locale, IntlShape>;
