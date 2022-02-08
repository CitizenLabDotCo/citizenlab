import { createContext } from 'react';
import { CLErrors, Message } from 'typings';

export const APIErrorsContext = createContext<CLErrors | undefined>(undefined);

export type ApiErrorGetter = (
  errorKey: string,
  fieldName: string
) => Message | undefined;

export const FormContext = createContext<{
  showAllErrors: boolean;
  getApiErrorMessage: ApiErrorGetter;
}>({ showAllErrors: false, getApiErrorMessage: () => undefined });
