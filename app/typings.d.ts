import * as Dropzone from 'react-dropzone';
declare module '*.png';

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

export interface ImageFile extends Dropzone.ImageFile {
  base64?: string;
  objectUrl?: string;
}

interface IOption {
  value: any;
  label: string;
  disabled?: boolean;
}

declare interface Message {
  id: string;
  defaultMessage: string;
}

declare interface Multiloc {
  [key: string]: string;
}

declare namespace API {
  interface Error {
    error: string;
    value?: string;
  }

  interface Errors {
    [fieldName: string]: Error[];
  }

  interface ErrorResponse {
    json: {
      errors: Errors
    }
  }

  interface ImageSizes {
    small: string | null;
    medium: string | null;
    large: string | null;
  }
}

declare namespace Forms {
  interface crudParams {
    loading: boolean;
    errors: API.Errors | null;
    saved: boolean;
  }
}
