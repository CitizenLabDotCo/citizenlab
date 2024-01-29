import { createContext } from 'react';
import { CLErrors, Locale } from 'typings';
import { ApiErrorGetter, FormData } from './typings';
import { MessageDescriptor } from 'utils/cl-intl';

export const APIErrorsContext = createContext<CLErrors | undefined>(undefined);

export const FormContext = createContext<{
  showAllErrors: boolean;
  getApiErrorMessage: ApiErrorGetter;
  formSubmitText?: MessageDescriptor;
  inputId?: string | undefined;
  onSubmit?: (formData?: FormData) => void | Promise<void>;
  setFormData?: (formData?: FormData) => void;
  setShowAllErrors?: (showAllErrors: boolean) => void;
  locale?: Locale;
}>({
  showAllErrors: false,
  getApiErrorMessage: () => undefined,
  onSubmit: async () => undefined,
  setFormData: async () => undefined,
  setShowAllErrors: () => undefined,
  inputId: undefined,
  locale: undefined,
});
