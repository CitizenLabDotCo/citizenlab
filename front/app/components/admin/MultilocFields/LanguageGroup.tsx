import React, { ReactNode, useContext } from 'react';

import TranslatedFieldGroup from 'design-system/TranslatedFieldGroup';

import LanguageButtonContext from './LanguageButtonContext';
import LocaleSwitcher from './LocaleSwitcher';
import styles from './MultilocFields.module.css';
import { LanguageGroupState } from './useLanguageGroup';
import 'design-system/tokens.css';

interface Props {
  group: LanguageGroupState;
  // Names what the switcher drives, e.g. "Phase content language".
  'aria-label': string;
  // The fields, each given locale={group.selectedLocale}.
  children: ReactNode;
}

// One language switcher for a group of multilingual fields. In the new back
// office it is the language bar above them, with the line under them naming
// the languages still to translate.
const LanguageGroup = ({ group, 'aria-label': ariaLabel, children }: Props) => {
  const redesigned = useContext(LanguageButtonContext);
  const { locales, selectedLocale, setSelectedLocale } = group;

  if (redesigned && selectedLocale) {
    return (
      <TranslatedFieldGroup
        aria-label={ariaLabel}
        languages={group.languages}
        selectedLanguage={selectedLocale}
        onLanguageChange={(id) =>
          setSelectedLocale(locales.find((locale) => locale === id))
        }
        hasText={group.hasText}
        blockedMessage={group.error}
      >
        {children}
      </TranslatedFieldGroup>
    );
  }

  return (
    <div className={styles.languageGroup}>
      {selectedLocale && locales.length > 1 && (
        <div className={styles.localeRow}>
          <LocaleSwitcher
            aria-label={ariaLabel}
            locales={locales}
            selectedLocale={selectedLocale}
            onChange={setSelectedLocale}
            valueMultiloc={group.translations}
          />
        </div>
      )}
      {children}
    </div>
  );
};

export default LanguageGroup;
