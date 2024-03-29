import { IntlShape } from 'react-intl';
import { CLLocale } from 'typings';

export type AllMessages = Record<CLLocale, Record<string, string>>;
export type IntlShapes = Record<CLLocale, IntlShape>;
