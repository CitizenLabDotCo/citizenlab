import React, { ReactNode, RefCallback, useEffect, useRef } from 'react';

import {
  Group,
  Input,
  TextField as AriaTextField,
} from 'react-aria-components';

import { FieldHelp, FieldLabel, fieldStyles } from '../Field';
import TextField from '../TextField';
import inputStyles from '../TextField/input.module.css';

import LanguageCount from './LanguageCount';
import LanguagePicker from './LanguagePicker';
import styles from './TranslatedField.module.css';
import TranslationGap from './TranslationGap';
import { TranslationLanguage } from './types';
import '../tokens.css';

export type { TranslationLanguage };

type LabelProps =
  | { label: string; 'aria-label'?: undefined }
  // Without a visible label (a title under a section heading) the field needs an aria-label.
  | { label?: undefined; 'aria-label': string };

type Props = LabelProps & {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  labelTooltip?: string;
  description?: ReactNode;
  errorMessage?: ReactNode;
  isDisabled?: boolean;
  inputRef?: RefCallback<HTMLInputElement>;
  languages: TranslationLanguage[];
  selectedLanguage: string;
  onLanguageChange: (id: string) => void;
  // Some language has text, so the count is no longer grey.
  hasText: boolean;
  // Set once a save stopped on a missing language: names what is left, and
  // turns the field and the count red.
  blockedMessage?: string;
};

// One field on its own that is translated: the language picker is the left
// segment of the field and the count of languages done sits on its right. A
// platform with one language gets a plain text field.
const TranslatedField = ({
  label,
  'aria-label': ariaLabel,
  id,
  value,
  onChange,
  onBlur,
  placeholder,
  labelTooltip,
  description,
  errorMessage,
  isDisabled = false,
  inputRef,
  languages,
  selectedLanguage,
  onLanguageChange,
  hasText,
  blockedMessage,
}: Props) => {
  const fieldRef = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLInputElement | null>(null);
  const isBlocked = !!blockedMessage;

  // A blocked save lands in the field, on the language it switched to.
  useEffect(() => {
    if (isBlocked) input.current?.focus();
  }, [isBlocked, selectedLanguage]);

  if (languages.length < 2) {
    const fieldProps = {
      id,
      value,
      onChange,
      onBlur,
      placeholder,
      description,
      errorMessage,
      isInvalid: !!errorMessage,
      isDisabled,
      inputRef,
    };

    return label === undefined ? (
      <TextField aria-label={ariaLabel} {...fieldProps} />
    ) : (
      <TextField label={label} labelTooltip={labelTooltip} {...fieldProps} />
    );
  }

  const setInput = (element: HTMLInputElement | null) => {
    input.current = element;
    inputRef?.(element);
  };

  // Picking a language puts the cursor in the field once the menu has closed.
  const pickLanguage = (language: string) => {
    onLanguageChange(language);
    requestAnimationFrame(() => input.current?.focus());
  };

  return (
    <AriaTextField
      className={inputStyles.field}
      id={id}
      value={value}
      onChange={onChange}
      onBlur={onBlur}
      isInvalid={!!errorMessage}
      isDisabled={isDisabled}
      aria-label={ariaLabel}
    >
      {label !== undefined && (
        <FieldLabel tooltip={labelTooltip}>{label}</FieldLabel>
      )}
      <div className={fieldStyles.control}>
        <Group
          ref={fieldRef}
          className={styles.frame}
          isInvalid={!!errorMessage}
          isDisabled={isDisabled}
          data-blocked={isBlocked || undefined}
        >
          <LanguagePicker
            variant="inline"
            aria-label={label ?? ariaLabel}
            languages={languages}
            selectedLanguage={selectedLanguage}
            onLanguageChange={pickLanguage}
            isDisabled={isDisabled}
            fieldRef={fieldRef}
          />
          <Input
            ref={setInput}
            className={styles.input}
            placeholder={placeholder}
            autoComplete="off"
          />
          <LanguageCount
            languages={languages}
            hasText={hasText}
            isBlocked={isBlocked}
          />
        </Group>
        <FieldHelp description={description} errorMessage={errorMessage} />
      </div>
      {blockedMessage && <TranslationGap message={blockedMessage} />}
    </AriaTextField>
  );
};

export default TranslatedField;
