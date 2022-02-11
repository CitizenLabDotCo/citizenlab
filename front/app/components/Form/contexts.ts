import { createContext } from 'react';
import { CLErrors } from 'typings';
import { ApiErrorGetter } from '.';

export const APIErrorsContext = createContext<CLErrors | undefined>(undefined);

export const FormContext = createContext<{
  showAllErrors: boolean;
  inputId: string | undefined;
  getApiErrorMessage: ApiErrorGetter;
}>({
  showAllErrors: false,
  getApiErrorMessage: () => undefined,
  inputId: undefined,
});
