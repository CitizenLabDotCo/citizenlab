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
}

declare interface Message {
  id: string;
  defaultMessage: string;
}

declare interface Multiloc {
  [key: string]: string;
}
