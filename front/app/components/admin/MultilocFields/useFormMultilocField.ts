import { get } from 'lodash-es';
import { useFormContext } from 'react-hook-form';
import { CLError, Multiloc } from 'typings';

import useAppConfigurationLocales from 'hooks/useAppConfigurationLocales';

import { TFieldName } from 'components/UI/Error';

import useApiErrorText from './useApiErrorText';

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

// handleHookFormSubmissionError stores an API error as the field's error.
const isCLError = (value: unknown): value is CLError =>
  isRecord(value) && typeof value.error === 'string';

const getMessage = (value: unknown) =>
  isRecord(value) && typeof value.message === 'string'
    ? value.message
    : undefined;

// What a multilingual field in a react-hook-form form needs besides its
// Controller: the value every platform locale starts with (so validation sees
// every locale) and the text of its validation or API error. The field name
// also picks field-specific API error messages.
const useFormMultilocField = (name: TFieldName) => {
  const locales = useAppConfigurationLocales();
  const {
    control,
    formState: { errors },
  } = useFormContext();
  const apiErrorText = useApiErrorText();

  const emptyMultiloc: Multiloc = Object.fromEntries(
    (locales ?? []).map((locale) => [locale, ''])
  );

  const getErrorMessage = () => {
    const fieldError: unknown = get(errors, name);
    if (isCLError(fieldError)) return apiErrorText([fieldError], name);
    if (!isRecord(fieldError)) return undefined;

    // Validation errors are per locale; the first one is shown.
    return (
      Object.values(fieldError).map(getMessage).find(Boolean) ??
      getMessage(fieldError)
    );
  };

  return { control, emptyMultiloc, errorMessage: getErrorMessage() };
};

export default useFormMultilocField;
