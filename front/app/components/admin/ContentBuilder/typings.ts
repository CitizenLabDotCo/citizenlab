import { SerializedNode } from '@craftjs/core';
import { Locale } from 'typings';

export type ContentBuilderErrors = Record<
  string,
  { hasError: boolean; selectedLocale?: Locale }
>;

export type CraftJson = Record<string, SerializedNode>;

export type ColumnLayout = '1-1' | '2-1' | '1-2';
