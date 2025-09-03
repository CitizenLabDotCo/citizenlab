import { MouseEvent, FC } from 'react';

import { MessageDescriptor } from 'react-intl';
import { RouteType } from 'routes';

import { TAppConfigurationSetting } from 'api/app_configuration/types';

import {
  appGraphqlLocalePairs,
  appLocalePairs,
} from 'containers/App/constants';

import { TFieldName } from 'components/UI/Error';

import { FormatMessageValues } from 'utils/cl-intl/useIntl';

declare global {
  interface Function {
    displayName?: string;
  }
  interface Window {
    Intercom?: any;
    Weglot?: any;
    _paq: any;
    attachEvent?: any;
    dataLayer?: any[];
    googleMaps?: boolean;
    intercomSettings: any;
    satismeter?: any;
    Cypress?: any;
  }
}

export interface IRelationship {
  id: string;
  type: string;
}

export interface ITab {
  name: string;
  label: string;
  url: RouteType;
  active?: boolean | ((pathname: string) => boolean);
  feature?: TAppConfigurationSetting;
  statusLabel?: string;
  className?: string;
}

export type CellConfiguration<ComponentProps> = {
  name: string;
  onChange?: (event: unknown) => void;
  onClick?: (event: MouseEvent) => void;
  featureFlag?: TAppConfigurationSetting;
  width?: number;
  Component: FC<ComponentProps>;
};

export interface InsertConfigurationOptions<T extends { name: string }> {
  configuration: T;
  insertAfterName?: string;
  insertBeforeName?: string;
}

export interface ILinks {
  self: string;
  first: string;
  prev: string | null;
  next: string | null;
  last: string;
}

export interface UploadFile extends File {
  id?: string;
  filename: string;
  base64: string;
  url: string;
  remote: boolean;
  extension?: string;
  error?: string[];
  ordering?: number;
}

export interface IOption {
  value: any;
  label: string;
  disabled?: boolean;
}

export function isIOption(
  maybeOption: {
    value: string;
    label: string;
  } | null
): maybeOption is IOption {
  return maybeOption !== null;
}

export type SupportedLocale = keyof typeof appLocalePairs;

export type GraphqlLocale = keyof typeof appGraphqlLocalePairs;

export type Multiloc = {
  [key in SupportedLocale]?: string;
};

export type GraphqlMultiloc = {
  content: string;
  locale: SupportedLocale;
}[];

export interface CLError {
  error: string;
  value?: string;
  row?: number;
  rows?: number[];
  ideas_count?: number;
  blocked_words?: any;
  payload?: Record<string, any>;
  fragment?: string;
}

export interface CLErrors {
  [fieldName: TFieldName | string]: CLError[];
}

export type CLErrorsWrapper = {
  errors: CLErrors;
};

export type RHFErrors =
  | { error: string; message?: string; type?: string; value?: string }
  | undefined;

export interface ImageSizes {
  small: string | null;
  medium: string | null;
  large: string | null;
  fb?: string | null;
}

export interface CRUDParams {
  loading: boolean;
  errors: CLErrors | null;
  saved: boolean;
}

export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;

export type IGraphPoint = {
  name: string;
  value: number;
  code?: string;
  color?: string;
  ordering?: number;
};

export type IGraphFormat = IGraphPoint[];

export type Override<T, U> = Pick<T, Exclude<keyof T, keyof U>> & U;

export type Percentage = `${number}%`;

export type FormatMessage = (
  messageDescriptor: MessageDescriptor,
  values?: FormatMessageValues
) => string;

export type Pagination = {
  'page[number]'?: number;
  'page[size]'?: number;
};
