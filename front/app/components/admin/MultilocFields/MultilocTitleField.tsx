import React, { useContext } from 'react';

import { Multiloc, SupportedLocale } from 'typings';

import Banner from 'design-system/Banner';
import TitleField from 'design-system/TitleField';
import TranslatedField from 'design-system/TranslatedField';

import { appLocalePairs } from 'containers/App/constants';

import LanguageButtonContext from './LanguageButtonContext';
import LocaleSwitcher from './LocaleSwitcher';
import styles from './MultilocFields.module.css';
import { hasText } from './useLanguageGroup';
import useSelectedLocale from './useSelectedLocale';
import 'design-system/tokens.css';

interface Props {
  id: string;
  locale?: SupportedLocale;
  'aria-label': string;
  placeholder: string;
  valueMultiloc: Multiloc | null | undefined;
  onChange: (valueMultiloc: Multiloc) => void;
  // One message per locale; the one for the locale shown is displayed.
  errorMultiloc?: Multiloc | null;
  // One message for the whole field, shown under it.
  errorMessage?: string;
}

// A multilingual design-system TitleField, e.g. the name of a new project. In
// the new back office a title on its own picks its language inside the field.
const MultilocTitleField = ({
  id,
  locale,
  'aria-label': ariaLabel,
  placeholder,
  valueMultiloc,
  onChange,
  errorMultiloc,
  errorMessage,
}: Props) => {
  const redesigned = useContext(LanguageButtonContext);
  const {
    locales,
    selectedLocale: defaultLocale,
    setSelectedLocale,
  } = useSelectedLocale();
  const selectedLocale = locale ?? defaultLocale;

  if (!selectedLocale) return null;

  const error = errorMultiloc?.[selectedLocale];

  if (redesigned && !locale) {
    return (
      <TranslatedField
        id={id}
        aria-label={ariaLabel}
        placeholder={placeholder}
        value={valueMultiloc?.[selectedLocale] ?? ''}
        onChange={(text) =>
          onChange({ ...valueMultiloc, [selectedLocale]: text })
        }
        errorMessage={errorMessage ?? error}
        languages={locales.map((option) => ({
          id: option,
          name: appLocalePairs[option],
          done: hasText(valueMultiloc?.[option]),
        }))}
        selectedLanguage={selectedLocale}
        onLanguageChange={(id) =>
          setSelectedLocale(locales.find((option) => option === id))
        }
        hasText={locales.some((option) => hasText(valueMultiloc?.[option]))}
      />
    );
  }

  return (
    <div className={styles.field}>
      {!locale && locales.length > 1 && (
        <div className={styles.localeRow}>
          <LocaleSwitcher
            aria-label={ariaLabel}
            locales={locales}
            selectedLocale={selectedLocale}
            onChange={setSelectedLocale}
            valueMultiloc={valueMultiloc}
          />
        </div>
      )}
      <TitleField
        id={id}
        errorMessage={errorMessage}
        aria-label={ariaLabel}
        placeholder={placeholder}
        value={valueMultiloc?.[selectedLocale] ?? ''}
        onChange={(text) =>
          onChange({ ...valueMultiloc, [selectedLocale]: text })
        }
      />
      {error && <Banner tone="error">{error}</Banner>}
    </div>
  );
};

export default MultilocTitleField;
