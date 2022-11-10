import { createContext } from 'react';
import { CLErrors } from 'typings';
import { ApiErrorGetter } from '.';

export const APIErrorsContext = createContext<CLErrors | undefined>(undefined);

export const FormContext = createContext<{
  showAllErrors: boolean;
  inputId: string | undefined;
  getApiErrorMessage: ApiErrorGetter;
  onSubmit: () => void;
  setShowSubmitButton: (showSubmitButton: boolean) => void;
}>({
  showAllErrors: false,
  getApiErrorMessage: () => undefined,
  onSubmit: async () => undefined,
  setShowSubmitButton: () => undefined,
  inputId: undefined,
});
