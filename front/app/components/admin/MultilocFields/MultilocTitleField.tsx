import React from 'react';

import { Multiloc, SupportedLocale } from 'typings';

import Banner from 'design-system/Banner';
import TitleField from 'design-system/TitleField';

import LocaleSwitcher from './LocaleSwitcher';
import styles from './MultilocFields.module.css';
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

// A multilingual design-system TitleField, e.g. the name of a new project.
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
  const {
    locales,
    selectedLocale: defaultLocale,
    setSelectedLocale,
  } = useSelectedLocale();
  const selectedLocale = locale ?? defaultLocale;

  if (!selectedLocale) return null;

  const error = errorMultiloc?.[selectedLocale];

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
