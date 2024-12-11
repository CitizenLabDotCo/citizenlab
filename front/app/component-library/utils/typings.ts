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

export type IGraphPoint = {
  name: string;
  value: number;
  code: string;
};

export type InputSize = 'small' | 'medium';

export type FontWeight = 'bold' | 'normal' | 'semi-bold';
