import { ImageFile } from 'react-dropzone';
import { appLocalePairs } from 'containers/App/constants';

export interface IRelationship {
  id: string;
  type: string;
}

export interface IHttpMethod {
  method: 'PUT' | 'POST' | 'GET' | 'PATCH' | 'DELETE';
}

export interface ITheme {
  theme: {
    color: {
      main: string;
      menuBg: string;
    }
  };
}

export interface ImageFile extends ImageFile {
  base64?: string;
  objectUrl?: string;
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

export type Locale = keyof typeof appLocalePairs;

export type Multiloc = {
  [key in Locale]?: string
};

export type MultilocStringOrJSX = {
  [key in Locale]?: string | JSX.Element;
};

export interface CLError {
  error: string;
  value?: string;
  row?: number;
  rows?: number[];
}

export interface CLErrors {
  [fieldName: string]: CLError[];
}

export interface CLErrorsJSON {
  json: {
    errors: CLErrors
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
