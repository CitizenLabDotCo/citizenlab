import React from 'react';

import { get } from 'lodash-es';
import { Controller, useFormContext } from 'react-hook-form';
import { CLError, Multiloc } from 'typings';

import useAppConfigurationLocales from 'hooks/useAppConfigurationLocales';

import LocaleSwitcher from 'components/admin/MultilocFields/LocaleSwitcher';
import MultilocTextField from 'components/admin/MultilocFields/MultilocTextField';
import useApiErrorText from 'components/admin/MultilocFields/useApiErrorText';
import useSelectedLocale from 'components/admin/MultilocFields/useSelectedLocale';

import TextArea from 'design-system/TextArea';

import styles from './IdeaOfficialFeedbackModal.module.css';
import 'design-system/tokens.css';

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

// handleHookFormSubmissionError stores an API error as the field's error.
const isCLError = (value: unknown): value is CLError =>
  isRecord(value) && typeof value.error === 'string';

const getMessage = (value: unknown) =>
  isRecord(value) && typeof value.message === 'string'
    ? value.message
    : undefined;

interface Props {
  // Not every name here is a TFieldName, so this field reads its own errors
  // instead of using useFormMultilocField.
  name: 'body_multiloc' | 'author_multiloc';
  label: string;
  placeholder?: string;
  multiline?: boolean;
}

// A multilingual design-system field bound to the surrounding
// react-hook-form form.
const FormMultilocField = ({ name, label, placeholder, multiline }: Props) => {
  const platformLocales = useAppConfigurationLocales();
  const {
    control,
    formState: { errors },
  } = useFormContext();
  const apiErrorText = useApiErrorText();
  const { locales, selectedLocale, setSelectedLocale } = useSelectedLocale();

  // Every platform locale starts empty so validation sees every locale.
  const emptyMultiloc: Multiloc = Object.fromEntries(
    (platformLocales ?? []).map((locale) => [locale, ''])
  );

  const getErrorMessage = () => {
    const fieldError: unknown = get(errors, name);
    if (isCLError(fieldError)) return apiErrorText([fieldError]);
    if (!isRecord(fieldError)) return undefined;

    // Validation errors are per locale; the first one is shown.
    return (
      Object.values(fieldError).map(getMessage).find(Boolean) ??
      getMessage(fieldError)
    );
  };
  const errorMessage = getErrorMessage();

  if (!selectedLocale) return null;

  return (
    <Controller
      name={name}
      control={control}
      defaultValue={emptyMultiloc}
      render={({ field }) => {
        const valueMultiloc: Multiloc = { ...emptyMultiloc, ...field.value };

        if (!multiline) {
          return (
            <MultilocTextField
              id={name}
              label={label}
              placeholder={placeholder}
              valueMultiloc={valueMultiloc}
              onChange={field.onChange}
              onBlur={field.onBlur}
              inputRef={field.ref}
              errorMessage={errorMessage}
            />
          );
        }

        return (
          <div className={styles.field}>
            {locales.length > 1 && (
              <div className={styles.localeRow}>
                <LocaleSwitcher
                  aria-label={label}
                  locales={locales}
                  selectedLocale={selectedLocale}
                  onChange={setSelectedLocale}
                  valueMultiloc={valueMultiloc}
                />
              </div>
            )}
            <TextArea
              id={name}
              label={label}
              placeholder={placeholder}
              value={valueMultiloc[selectedLocale] ?? ''}
              onChange={(value) =>
                field.onChange({ ...valueMultiloc, [selectedLocale]: value })
              }
              onBlur={field.onBlur}
              inputRef={field.ref}
              isInvalid={!!errorMessage}
              errorMessage={errorMessage}
            />
          </div>
        );
      }}
    />
  );
};

export default FormMultilocField;
