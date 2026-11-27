import React from 'react';

import { Multiloc, SupportedLocale } from 'typings';

import NewDot from 'design-system/NewDot';
import ToggleButton from 'design-system/ToggleButton';
import ToggleButtonGroup from 'design-system/ToggleButtonGroup';
import { Key } from 'design-system/types';
import 'design-system/tokens.css';

import styles from './MultilocFields.module.css';

interface Props {
  // Names the group, e.g. the label of the field it switches.
  'aria-label': string;
  locales: SupportedLocale[];
  selectedLocale: SupportedLocale;
  onChange: (locale: SupportedLocale) => void;
  // Marks the locales that have no text yet.
  valueMultiloc?: Multiloc | null;
}

// Picks which locale of a multilingual field is being edited. Hidden when
// the platform has one locale.
const LocaleSwitcher = ({
  'aria-label': ariaLabel,
  locales,
  selectedLocale,
  onChange,
  valueMultiloc,
}: Props) => {
  if (locales.length < 2) return null;

  const handleSelectionChange = (keys: Set<Key>) => {
    const locale = locales.find((option) => keys.has(option));
    if (locale) onChange(locale);
  };

  return (
    <ToggleButtonGroup
      aria-label={ariaLabel}
      selectedKeys={[selectedLocale]}
      onSelectionChange={handleSelectionChange}
    >
      {locales.map((locale) => (
        <ToggleButton key={locale} id={locale}>
          {valueMultiloc && !valueMultiloc[locale] && <NewDot />}
          <span className={styles.localeCode}>{locale}</span>
        </ToggleButton>
      ))}
    </ToggleButtonGroup>
  );
};

export default LocaleSwitcher;
