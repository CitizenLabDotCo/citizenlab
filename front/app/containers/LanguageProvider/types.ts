import { Locale } from 'typings';
import { IntlShape } from 'react-intl';

export type AllMessages = Record<Locale, Record<string, string>>;
export type IntlShapes = Record<Locale, IntlShape>;
