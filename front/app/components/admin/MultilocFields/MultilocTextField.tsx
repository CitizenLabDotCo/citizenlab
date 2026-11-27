import React, { ReactNode, RefCallback, useContext } from 'react';

import { Multiloc, SupportedLocale } from 'typings';

import TextField from 'design-system/TextField';
import TranslatedField from 'design-system/TranslatedField';

import { appLocalePairs } from 'containers/App/constants';

import LanguageButtonContext from './LanguageButtonContext';
import LanguageGroup from './LanguageGroup';
import LocaleSwitcher from './LocaleSwitcher';
import styles from './MultilocFields.module.css';
import { hasText, LanguageGroupState } from './useLanguageGroup';
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
  // Set when the field is a language group on its own: in the new back office
  // it carries the group's picker, count and missing line.
  group?: LanguageGroupState;
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
// picked in the switcher above it. In the new back office a field on its own
// picks its language inside the field.
const MultilocTextField = (props: Props) => {
  const redesigned = useContext(LanguageButtonContext);
  const {
    group,
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
  } = props;
  const {
    locales,
    selectedLocale: defaultLocale,
    setSelectedLocale,
  } = useSelectedLocale();
  const ownLocale = group ? group.selectedLocale : defaultLocale;
  const selectedLocale = locale ?? ownLocale;

  if (!selectedLocale) return null;

  const name = label === undefined ? ariaLabel : label;

  if (group && !redesigned) {
    return (
      <LanguageGroup group={group} aria-label={name}>
        <MultilocTextField
          {...props}
          group={undefined}
          locale={selectedLocale}
        />
      </LanguageGroup>
    );
  }

  const value = valueMultiloc?.[selectedLocale] ?? '';

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

  if (redesigned && !locale) {
    const fieldLocales = group ? group.locales : locales;
    const translated = {
      id,
      value,
      onChange: handleChange,
      onBlur,
      inputRef,
      placeholder,
      description: help,
      errorMessage,
      languages: group
        ? group.languages
        : fieldLocales.map((option) => ({
            id: option,
            name: appLocalePairs[option],
            done: hasText(valueMultiloc?.[option]),
          })),
      selectedLanguage: selectedLocale,
      onLanguageChange: (id: string) =>
        (group ? group.setSelectedLocale : setSelectedLocale)(
          fieldLocales.find((option) => option === id)
        ),
      hasText: group
        ? group.hasText
        : fieldLocales.some((option) => hasText(valueMultiloc?.[option])),
      blockedMessage: group?.error,
    };

    return label === undefined ? (
      <TranslatedField aria-label={ariaLabel} {...translated} />
    ) : (
      <TranslatedField
        label={label}
        labelTooltip={labelTooltip}
        {...translated}
      />
    );
  }

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
