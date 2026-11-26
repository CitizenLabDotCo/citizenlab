import React, { ReactNode, RefCallback } from 'react';

import { Multiloc, SupportedLocale } from 'typings';

import TextField from 'design-system/TextField';

import LocaleSwitcher from './LocaleSwitcher';
import styles from './MultilocFields.module.css';
import useSelectedLocale from './useSelectedLocale';
import 'design-system/tokens.css';

type LabelProps =
  | { label: string; labelTooltip?: string; 'aria-label'?: undefined }
  // Without a visible label (a title) the field needs an aria-label.
  | { label?: undefined; labelTooltip?: undefined; 'aria-label': string };

type Props = LabelProps & {
  id?: string;
  // Set when one switcher above drives a group of fields; the field then has none of its own.
  locale?: SupportedLocale;
  description?: ReactNode;
  placeholder?: string;
  valueMultiloc: Multiloc | null | undefined;
  onChange: (valueMultiloc: Multiloc, locale: SupportedLocale) => void;
  onBlur?: () => void;
  inputRef?: RefCallback<HTMLInputElement>;
  errorMessage?: ReactNode;
  size?: 32;
  // Typing stops at the limit, and the count shows under the field.
  maxCharCount?: number;
};

// A multilingual text field: one design-system TextField, showing the locale
// picked in the switcher above it.
const MultilocTextField = ({
  id,
  locale,
  label,
  labelTooltip,
  'aria-label': ariaLabel,
  description,
  placeholder,
  valueMultiloc,
  onChange,
  onBlur,
  inputRef,
  errorMessage,
  size,
  maxCharCount,
}: Props) => {
  const {
    locales,
    selectedLocale: defaultLocale,
    setSelectedLocale,
  } = useSelectedLocale();
  const selectedLocale = locale ?? defaultLocale;

  if (!selectedLocale) return null;

  const value = valueMultiloc?.[selectedLocale] ?? '';
  const name = label === undefined ? ariaLabel : label;

  const handleChange = (newValue: string) => {
    if (maxCharCount !== undefined && newValue.length > maxCharCount) return;
    onChange({ ...valueMultiloc, [selectedLocale]: newValue }, selectedLocale);
  };

  const help =
    maxCharCount === undefined ? (
      description
    ) : (
      <>
        {description && <span className={styles.block}>{description}</span>}
        {`${value.length}/${maxCharCount}`}
      </>
    );

  const field =
    label === undefined ? (
      <TextField
        id={id}
        aria-label={ariaLabel}
        description={help}
        placeholder={placeholder}
        value={value}
        onChange={handleChange}
        onBlur={onBlur}
        inputRef={inputRef}
        isInvalid={!!errorMessage}
        errorMessage={errorMessage}
        size={size}
      />
    ) : (
      <TextField
        id={id}
        label={label}
        labelTooltip={labelTooltip}
        description={help}
        placeholder={placeholder}
        value={value}
        onChange={handleChange}
        onBlur={onBlur}
        inputRef={inputRef}
        isInvalid={!!errorMessage}
        errorMessage={errorMessage}
        size={size}
      />
    );

  return (
    <div className={styles.field}>
      {!locale && locales.length > 1 && (
        <div className={styles.localeRow}>
          <LocaleSwitcher
            aria-label={name}
            locales={locales}
            selectedLocale={selectedLocale}
            onChange={setSelectedLocale}
            valueMultiloc={valueMultiloc}
          />
        </div>
      )}
      {field}
    </div>
  );
};

export default MultilocTextField;
