import * as Dropzone from 'react-dropzone';
import { EditorState } from 'draft-js';

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

declare type Locale = 'de-DE' | 'en' | 'en-GB' | 'en-CA' | 'fr-BE' | 'fr-FR' | 'nl-BE' | 'nl-NL' | 'da-DK' | 'nb-NO' | 'ach';

declare interface Multiloc {
  'de-DE'?: string;
  en?: string;
  'en-GB'?: string;
  'en-CA'?: string;
  'fr-BE'?: string;
  'fr-FR'?: string;
  'nl-BE'?: string;
  'nl-NL'?: string;
  'da-DK'?: string;
  'nb-NO'?: string;
  ach?: string;
}

declare interface MultilocEditorState {
  'de-DE'?: EditorState;
  en?: EditorState;
  'en-GB'?: EditorState;
  'en-CA'?: EditorState;
  'fr-BE'?: EditorState;
  'fr-FR'?: EditorState;
  'nl-BE'?: EditorState;
  'nl-NL'?: EditorState;
  'da-DK'?: EditorState;
  'nb-NO'?: EditorState;
  ach?: EditorState;
}

declare interface MultilocStringOrJSX {
  'de-DE'?: string | JSX.Element;
  en?: string | JSX.Element;
  'en-GB'?: string | JSX.Element;
  'en-CA'?: string | JSX.Element;
  'fr-BE'?: string | JSX.Element;
  'fr-FR'?: string | JSX.Element;
  'nl-BE'?: string | JSX.Element;
  'nl-NL'?: string | JSX.Element;
  'da-DK'?: string | JSX.Element;
  'nb-NO'?: string | JSX.Element;
  ach?: string | JSX.Element;
}

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
