import { createContext } from 'react';
import { CLErrors } from 'typings';
import { ApiErrorGetter } from './typings';
import { MessageDescriptor } from 'utils/cl-intl';

export const APIErrorsContext = createContext<CLErrors | undefined>(undefined);

export const FormContext = createContext<{
  showAllErrors: boolean;
  formSubmitText?: MessageDescriptor;
  inputId: string | undefined;
  getApiErrorMessage: ApiErrorGetter;
  onSubmit?: (formData?: any) => void | Promise<void>;
  setShowAllErrors: (showAllErrors: boolean) => void;
}>({
  showAllErrors: false,
  getApiErrorMessage: () => undefined,
  onSubmit: async () => undefined,
  setShowAllErrors: () => undefined,
  inputId: undefined,
});
