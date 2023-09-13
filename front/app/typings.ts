import { MouseEvent, FC } from 'react';
import { TFieldName } from 'components/UI/Error';
import {
  appGraphqlLocalePairs,
  appLocalePairs,
} from 'containers/App/constants';
import { TableCellProps } from 'semantic-ui-react';
import {
  TAppConfigurationSetting,
  TAppConfigurationSettingWithEnabled,
} from 'api/app_configuration/types';
import { WrappedComponentProps } from 'react-intl';

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
  }
}

export interface IRelationship {
  id: string;
  type: string;
}

export interface IHttpMethod {
  method: 'PUT' | 'POST' | 'GET' | 'PATCH' | 'DELETE';
}

export type ILocationInfo =
  | {
      location_description: string | undefined;
      location_point_geojson: {
        type: 'Point';
        coordinates: number[];
      };
    }
  | {
      location_description: undefined;
      error: 'not_found';
      location_point_geojson: {
        type: 'Point';
        coordinates: number[];
      };
    };

export type IParticipationContextType = 'project' | 'phase';

export interface ITab {
  name: string;
  label: string;
  url: string;
  active?: boolean | ((pathname: string) => boolean);
  feature?: TAppConfigurationSettingWithEnabled;
  statusLabel?: string;
}

export type CellConfiguration<ComponentProps> = {
  name: string;
  onChange?: (event: unknown) => void;
  onClick?: (event: MouseEvent) => void;
  featureFlag?: TAppConfigurationSetting;
  cellProps?: TableCellProps;
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

export type Locale = keyof typeof appLocalePairs;

export type GraphqlLocale = keyof typeof appGraphqlLocalePairs;

export type Multiloc = {
  [key in Locale]?: string;
};

export type GraphqlMultiloc = {
  content: string;
  locale: Locale;
}[];

export type MultilocFormValues = {
  [field: string]: Multiloc | null | undefined;
};

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

export interface CLErrorsJSON {
  json: {
    errors: CLErrors;
  };
}

export type CLErrorsWrapper = CLErrorsJSON['json'];

export type RHFErrors =
  | { message?: string; error?: string; type?: string }
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

export type FormatMessage = WrappedComponentProps['intl']['formatMessage'];
