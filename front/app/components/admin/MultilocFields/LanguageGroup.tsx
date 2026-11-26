import React, { ReactNode } from 'react';

import LocaleSwitcher from './LocaleSwitcher';
import MissingLanguages from './MissingLanguages';
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

// One Language button above a group of multilingual fields, and the line
// under them naming the languages still to translate.
const LanguageGroup = ({ group, 'aria-label': ariaLabel, children }: Props) => (
  <div className={styles.languageGroup}>
    {group.selectedLocale && group.locales.length > 1 && (
      <div className={styles.localeRow}>
        <LocaleSwitcher
          aria-label={ariaLabel}
          locales={group.locales}
          selectedLocale={group.selectedLocale}
          onChange={group.setSelectedLocale}
          valueMultiloc={group.translations}
        />
      </div>
    )}
    {children}
    <MissingLanguages message={group.error} />
  </div>
);

export default LanguageGroup;
