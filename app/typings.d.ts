import * as Dropzone from 'react-dropzone';
import { EditorState } from 'draft-js';
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

declare interface IOption {
  value: any;
  label: string;
  disabled?: boolean;
}

declare interface Message {
  id: string;
  defaultMessage: string;
}

declare type Locale = 'de' | 'en' | 'fr' | 'nl';

declare interface Multiloc {
  de?: string;
  en?: string;
  fr?: string;
  nl?: string;
  da?: string;
  no?: string;
}

declare interface MultilocEditorState {
  de?: EditorState;
  en?: EditorState;
  fr?: EditorState;
  nl?: EditorState;
  da?: EditorState;
  no?: EditorState;
}

declare interface MultilocStringOrJSX {
  de?: string | JSX.Element;
  en?: string | JSX.Element;
  fr?: string | JSX.Element;
  nl?: string | JSX.Element;
  da?: string | JSX.Element;
  no?: string | JSX.Element;
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
