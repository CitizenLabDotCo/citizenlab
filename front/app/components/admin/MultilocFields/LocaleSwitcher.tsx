import React, { useContext } from 'react';

import { Multiloc, SupportedLocale } from 'typings';

import LanguageSwitcher from 'design-system/LanguageSwitcher';
import NewDot from 'design-system/NewDot';
import ToggleButton from 'design-system/ToggleButton';
import ToggleButtonGroup from 'design-system/ToggleButtonGroup';
import { Key } from 'design-system/types';
import 'design-system/tokens.css';

import { appLocalePairs } from 'containers/App/constants';

import LanguageButtonContext from './LanguageButtonContext';
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
// the platform has one locale. The new back office uses the compact Language
// button; the current back office keeps the segmented switcher.
const LocaleSwitcher = ({
  'aria-label': ariaLabel,
  locales,
  selectedLocale,
  onChange,
  valueMultiloc,
}: Props) => {
  const redesigned = useContext(LanguageButtonContext);

  if (locales.length < 2) return null;

  if (redesigned) {
    return (
      <LanguageSwitcher
        aria-label={ariaLabel}
        languages={locales.map((locale) => ({
          id: locale,
          name: appLocalePairs[locale],
          done: !valueMultiloc || !!valueMultiloc[locale],
        }))}
        selectedId={selectedLocale}
        onChange={(id) => {
          const locale = locales.find((option) => option === id);
          if (locale) onChange(locale);
        }}
      />
    );
  }

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
