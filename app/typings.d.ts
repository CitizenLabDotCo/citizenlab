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

  interface ErrorResponse {
    json: {
      errors: {
        [fieldName: string]: Error[]
      }
    }
  }

  interface ImageSizes {
    small: string | null;
    medium: string | null;
    large: string | null;
  }
}
