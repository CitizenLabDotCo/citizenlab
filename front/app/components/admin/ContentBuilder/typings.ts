import { Locale } from 'typings';

export type ContentBuilderErrors = Record<
  string,
  { hasError: boolean; selectedLocale: Locale }
>;
