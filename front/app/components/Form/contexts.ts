import { createContext } from 'react';

import { CLErrors, Locale } from 'typings';

import { ApiErrorGetter, FormData } from './typings';

export const APIErrorsContext = createContext<CLErrors | undefined>(undefined);

export const FormContext = createContext<{
  showAllErrors: boolean;
  getApiErrorMessage: ApiErrorGetter;
  inputId?: string | undefined;
  onSubmit?: (
    formData?: FormData,
    showErrors?: boolean
  ) => void | Promise<void>;
  setFormData?: (formData?: FormData) => void;
  setShowAllErrors?: (showAllErrors: boolean) => void;
  setCompletionPercentage?: (percentage: number) => void;
  locale?: Locale;
}>({
  showAllErrors: false,
  getApiErrorMessage: () => undefined,
  onSubmit: async () => undefined,
  setFormData: async () => undefined,
  setShowAllErrors: () => undefined,
  setCompletionPercentage: () => undefined,
  inputId: undefined,
  locale: undefined,
});
