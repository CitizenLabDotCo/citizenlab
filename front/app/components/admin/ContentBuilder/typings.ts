import { Locale } from 'typings';
import { SerializedNode } from '@craftjs/core';

export type ContentBuilderErrors = Record<
  string,
  { hasError: boolean; selectedLocale?: Locale }
>;

export type CraftJson = Record<string, SerializedNode>;

export type ColumnLayout = '1-1' | '2-1' | '1-2';
