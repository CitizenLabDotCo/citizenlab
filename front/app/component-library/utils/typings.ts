declare global {
  interface Function {
    displayName?: string;
  }
}

export interface IOption {
  value: any;
  label: string;
  disabled?: boolean;
}

export type Locale = string;

export type Multiloc = {
  [key in Locale]?: string;
};

export type MultilocFormValues = {
  [field: string]: Multiloc | null | undefined;
};

export interface CLError {
  error: string;
  raw_error?: string;
  value?: number | string;
  row?: number;
  rows?: number[];
  ideas_count?: number;
}

export type IGraphPoint = {
  name: string;
  value: number;
  code: string;
};

export type InputSize = 'small' | 'medium';
