import { Locale } from 'typings';
import { SerializedNode } from '@craftjs/core';

export type ContentBuilderErrors = Record<
  string,
  { hasError: boolean; selectedLocale: Locale }
>;

export type JsonMultiloc = {
  [key in Locale]?: Record<string, SerializedNode>;
};
