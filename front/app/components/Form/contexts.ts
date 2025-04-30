import { createContext } from 'react';

import { CLErrors, SupportedLocale } from 'typings';

import { ApiErrorGetter, FormValues, PageType } from './typings';

export const APIErrorsContext = createContext<CLErrors | undefined>(undefined);

export const FormContext = createContext<{
  showAllErrors?: boolean;
  getApiErrorMessage: ApiErrorGetter;
  inputId?: string | undefined;
  onSubmit?: (
    formData?: { data?: FormValues },
    showErrors?: boolean,
    userPagePath?: PageType[],
    afterSubmitCallBack?: () => void
  ) => void | Promise<any>;
  setFormData?: (formData?: FormValues) => void;
  setShowAllErrors?: (showAllErrors: boolean) => void;
  locale?: SupportedLocale;
}>({
  showAllErrors: false,
  getApiErrorMessage: () => undefined,
  onSubmit: async () => undefined,
  setFormData: async () => undefined,
  setShowAllErrors: () => undefined,
  inputId: undefined,
  locale: undefined,
});
