import {
  appLocalePairs,
  appGraphqlLocalePairs,
} from 'containers/App/constants';

declare global {
  interface Function {
    displayName?: string;
  }
  interface Window {
    googleMaps?: boolean;
    Intercom?: any;
    intercomSettings: any;
    attachEvent?: any;
    satismeter?: any;
    dataLayer?: any[];
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
      location_description: string;
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

export type IPCAction = IProjectAction | IIdeaAction;

export interface ITheme {
  theme: {
    color: {
      main: string;
      menuBg: string;
    };
  };
}

export interface ITab {
  name: string;
  label: string;
  url: string;
  active?: boolean;
  feature?: string;
}

export type CellComponentProps = {
  idea: IIdeaData;
  selection: Set<string>;
  onChange?: (event: unknown) => void;
  onClick?: (event: unknown) => void;
};

export type CellConfiguration = {
  name: string;
  onChange?: (event: unknown) => void;
  onClick?: (event: unknown) => void;
  featureFlag?: string;
  cellProps?: TableCellProps;
  Component: FC<CellComponentProps>;
};

export interface InsertConfigurationOptions<T extends { name: string }> {
  configuration: T;
  insertAfterName?: string;
}

export interface ILinks {
  self: string;
  first: string;
  prev: string;
  next: string;
  last: string;
}

export interface UploadFile extends File {
  filename: string;
  base64: string;
  url: string;
  id?: string;
  remote: boolean;
  extension?: string;
  error?: string[];
}

export interface IOption {
  value: any;
  label: string;
  disabled?: boolean;
}

export interface Message {
  id: string;
  defaultMessage: string;
}

import { Messages } from 'react-intl';
import { IProjectAction } from 'services/projects';
import { IIdeaAction, IIdeaData } from 'services/ideas';
import { FormikActions } from 'formik';
import { FC } from 'react';
import { TableCellProps } from 'semantic-ui-react';
export type MessageDescriptor = Messages['key'];

export type Locale = keyof typeof appLocalePairs;

export type GraphqlLocale = keyof typeof appGraphqlLocalePairs;

export const isLocale = (test: any) => {
  return Object.keys(appLocalePairs).includes(test);
};

export type Multiloc = {
  [key in Locale]?: string;
};

export type GraphqlMultiloc = {
  content: string;
  locale: Locale;
}[];

export type MultilocStringOrJSX = {
  [key in Locale]?: string | JSX.Element;
};

export type MultilocFormValues = {
  [field: string]: Multiloc | null | undefined;
};

export interface CLError {
  error: string;
  value?: string;
  row?: number;
  rows?: number[];
  ideas_count?: number;
  payload?: Object;
}

export interface CLErrors {
  [fieldName: string]: CLError[];
}

export interface CLErrorsJSON {
  json: {
    errors: CLErrors;
  };
}

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
  code: string;
  color?: string;
  ordering?: number;
};

export type ITopicSingleValue = {
  nameMultiloc: Multiloc;
  value: number;
  code: string;
};

export type IParticipationByTopic = ITopicSingleValue[];

export type IGraphFormat = IGraphPoint[];

export type FormikSubmitHandler<V> = (
  values: V,
  actions: FormikActions<V>
) => void;

export type Override<T, U> = Pick<T, Exclude<keyof T, keyof U>> & U;
