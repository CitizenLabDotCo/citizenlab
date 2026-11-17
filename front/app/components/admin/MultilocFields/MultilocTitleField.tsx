import React from 'react';

import { Multiloc } from 'typings';

import Banner from 'design-system/Banner';
import TitleField from 'design-system/TitleField';

import LocaleSwitcher from './LocaleSwitcher';
import styles from './MultilocFields.module.css';
import useSelectedLocale from './useSelectedLocale';
import 'design-system/tokens.css';

interface Props {
  id: string;
  'aria-label': string;
  placeholder: string;
  valueMultiloc: Multiloc | null;
  onChange: (valueMultiloc: Multiloc) => void;
  // One message per locale; the one for the locale shown is displayed.
  errorMultiloc?: Multiloc | null;
}

// A multilingual design-system TitleField, e.g. the name of a new project.
const MultilocTitleField = ({
  id,
  'aria-label': ariaLabel,
  placeholder,
  valueMultiloc,
  onChange,
  errorMultiloc,
}: Props) => {
  const { locales, selectedLocale, setSelectedLocale } = useSelectedLocale();

  if (!selectedLocale) return null;

  const error = errorMultiloc?.[selectedLocale];

  return (
    // The design-system TitleField takes no id, so the id sits on its wrapper.
    <div id={id} className={styles.field}>
      {locales.length > 1 && (
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
