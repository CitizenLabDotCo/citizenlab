import { CLError } from 'typings';

export type ErrorType =
  | Error
  | CLError[]
  | {
      [fieldName: string]: CLError[];
    };
