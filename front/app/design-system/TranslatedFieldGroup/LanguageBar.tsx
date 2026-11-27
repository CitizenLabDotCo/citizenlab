import React from 'react';

import LanguageCount from '../TranslatedField/LanguageCount';
import LanguagePicker from '../TranslatedField/LanguagePicker';
import { TranslationLanguage } from '../TranslatedField/types';

import styles from './TranslatedFieldGroup.module.css';
import '../tokens.css';

export type LanguageBarProps = {
  // Names what the picker drives, e.g. "Survey title and button".
  'aria-label': string;
  languages: TranslationLanguage[];
  selectedLanguage: string;
  onLanguageChange: (id: string) => void;
  // Some language has text, so the count is no longer grey.
  hasText: boolean;
  isBlocked?: boolean;
  isDisabled?: boolean;
};

// The count of languages done, then the language picker, on the right above
// the fields they drive. Hidden on a platform with one language.
const LanguageBar = ({
  'aria-label': ariaLabel,
  languages,
  selectedLanguage,
  onLanguageChange,
  hasText,
  isBlocked = false,
  isDisabled,
}: LanguageBarProps) =>
  languages.length < 2 ? null : (
    <div className={styles.bar} data-language-bar>
      <LanguageCount
        languages={languages}
        hasText={hasText}
        isBlocked={isBlocked}
      />
      <LanguagePicker
        variant="bar"
        aria-label={ariaLabel}
        languages={languages}
        selectedLanguage={selectedLanguage}
        onLanguageChange={onLanguageChange}
        isDisabled={isDisabled}
      />
    </div>
  );

export default LanguageBar;
