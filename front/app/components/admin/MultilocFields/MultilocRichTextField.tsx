import React, { ReactNode, RefCallback } from 'react';

import { Multiloc, SupportedLocale } from 'typings';

import LocaleSwitcher from './LocaleSwitcher';
import styles from './MultilocFields.module.css';
import RichTextField from './RichTextField';
import useSelectedLocale from './useSelectedLocale';
import 'design-system/tokens.css';

interface Props {
  id: string;
  // Shown on the left of the locale switcher. It can hold more than words
  // (badges, a tooltip), so the editor and the switcher take aria-label.
  label?: ReactNode;
  'aria-label': string;
  placeholder?: string;
  valueMultiloc: Multiloc | null | undefined;
  onChange: (valueMultiloc: Multiloc, locale: SupportedLocale) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  // Gets the editing element, e.g. for a form library that focuses the first invalid field.
  editorRef?: RefCallback<HTMLElement>;
  errorMessage?: ReactNode;
  noImages?: boolean;
  noVideos?: boolean;
  noLinks?: boolean;
  noAlign?: boolean;
  limitedTextFormatting?: boolean;
  withCTAButton?: boolean;
}

// A multilingual rich text field: the label and the locale switcher on one
// row, the editor for the picked locale under it.
const MultilocRichTextField = ({
  id,
  label,
  'aria-label': ariaLabel,
  placeholder,
  valueMultiloc,
  onChange,
  onFocus,
  onBlur,
  editorRef,
  errorMessage,
  noImages,
  noVideos,
  noLinks,
  noAlign,
  limitedTextFormatting,
  withCTAButton,
}: Props) => {
  const { locales, selectedLocale, setSelectedLocale } = useSelectedLocale();

  if (!selectedLocale) return null;

  const errorId = `${id}-error`;

  return (
    <div id={id} className={styles.field}>
      {(label !== undefined || locales.length > 1) && (
        <div
          className={label === undefined ? styles.localeRow : styles.labelRow}
        >
          {label !== undefined && <span className={styles.label}>{label}</span>}
          <LocaleSwitcher
            aria-label={ariaLabel}
            locales={locales}
            selectedLocale={selectedLocale}
            onChange={setSelectedLocale}
            valueMultiloc={valueMultiloc}
          />
        </div>
      )}
      <RichTextField
        id={`${id}-editor`}
        value={valueMultiloc?.[selectedLocale]}
        onChange={(html) =>
          onChange({ ...valueMultiloc, [selectedLocale]: html }, selectedLocale)
        }
        onFocus={onFocus}
        onBlur={onBlur}
        editorRef={editorRef}
        aria-label={ariaLabel}
        aria-describedby={errorMessage ? errorId : undefined}
        isInvalid={!!errorMessage}
        placeholder={placeholder}
        noImages={noImages}
        noVideos={noVideos}
        noLinks={noLinks}
        noAlign={noAlign}
        limitedTextFormatting={limitedTextFormatting}
        withCTAButton={withCTAButton}
      />
      {errorMessage && (
        <p id={errorId} className={styles.error}>
          {errorMessage}
        </p>
      )}
    </div>
  );
};

export default MultilocRichTextField;
