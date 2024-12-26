import { CLError } from 'typings';

export type SubmitState = 'disabled' | 'enabled' | 'error' | 'success';
export type ErrorType =
  | Error
  | CLError[]
  | {
      [fieldName: string]: CLError[];
    };

export type ApiErrorType =
  | Error
  | {
      [fieldName: string]: CLError[];
    };
