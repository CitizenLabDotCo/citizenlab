import { ImageFile } from 'react-dropzone';
import { EditorState } from 'draft-js';
import PlatformLocales from 'platformLocales';

declare module '*.png';

declare module '*.json' {
  const value: any;
  export default value;
}

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

export interface UploadFile extends File {
  base64?: string;
  objectUrl?: string;
  id?: string;
}

declare interface IOption {
  value: any;
  label: string;
  disabled?: boolean;
}

declare interface Message {
  id: string;
  defaultMessage: string;
}

declare type Locale = keyof typeof PlatformLocales;

declare type Multiloc = {
  [key in Locale]?: string
};

declare type MultilocEditorState = {
  [key in Locale]?: EditorState;
};

declare type MultilocStringOrJSX = {
  [key in Locale]?: string | JSX.Element;
};

declare namespace API {
  interface Error {
    error: string;
    value?: string;
    row?: number;
    rows?: number[];
  }

  interface Errors {
    [fieldName: string]: Error[];
  }

  interface ErrorResponse {
    json: {
      errors: Errors
    };
  }

  interface ImageSizes {
    small: string | null;
    medium: string | null;
    large: string | null;
    fb?: string | null;
  }
}

declare namespace Forms {
  interface crudParams {
    loading: boolean;
    errors: API.Errors | null;
    saved: boolean;
  }
}
