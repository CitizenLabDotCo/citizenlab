import { SerializedNode } from '@craftjs/core';
import { CLLocale } from 'typings';

export type ContentBuilderErrors = Record<
  string,
  { hasError: boolean; selectedLocale?: CLLocale }
>;

export type CraftJson = Record<string, SerializedNode>;

export type ColumnLayout = '1-1' | '2-1' | '1-2';
