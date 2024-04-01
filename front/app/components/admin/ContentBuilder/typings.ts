import { SerializedNode } from '@craftjs/core';
import { SupportedLocale } from 'typings';

export type ContentBuilderErrors = Record<
  string,
  { hasError: boolean; selectedLocale?: SupportedLocale }
>;

export type CraftJson = Record<string, SerializedNode>;

export type ColumnLayout = '1-1' | '2-1' | '1-2';
