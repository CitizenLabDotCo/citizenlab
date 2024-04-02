import { IntlShape } from 'react-intl';
import { SupportedLocale } from 'typings';

export type AllMessages = Record<SupportedLocale, Record<string, string>>;
export type IntlShapes = Record<SupportedLocale, IntlShape>;
