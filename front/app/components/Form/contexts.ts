import { createContext } from 'react';
import { CLErrors } from 'typings';
import { ApiErrorGetter } from '.';
import { MessageDescriptor } from 'utils/cl-intl';

export const APIErrorsContext = createContext<CLErrors | undefined>(undefined);

export const FormContext = createContext<{
  showAllErrors: boolean;
  formSubmitText?: MessageDescriptor;
  inputId: string | undefined;
  getApiErrorMessage: ApiErrorGetter;
  onSubmit: () => void;
  setShowAllErrors: (showAllErrors: boolean) => void;
  setShowSubmitButton: (showSubmitButton: boolean) => void;
}>({
  showAllErrors: false,
  getApiErrorMessage: () => undefined,
  onSubmit: async () => undefined,
  setShowAllErrors: () => undefined,
  setShowSubmitButton: () => undefined,
  inputId: undefined,
});
