import React, { memo } from 'react';

import {
  InputMultilocWithLocaleSwitcher,
  InputMultilocWithLocaleSwitcherProps,
} from '@citizenlab/cl2-component-library';

import useAppConfigurationLocales from 'hooks/useAppConfigurationLocales';

import MultilocTranslationStatus from 'components/UI/MultilocTranslation/MultilocTranslationStatus';
import useMultilocTranslation from 'components/UI/MultilocTranslation/useMultilocTranslation';

import { isNilOrError } from 'utils/helperUtils';

export interface Props
  extends Omit<InputMultilocWithLocaleSwitcherProps, 'locales'> {}

const InputMultilocWithLocaleSwitcherWrapper = memo<Props>((props) => {
  const tenantLocales = useAppConfigurationLocales();
  const translation = useMultilocTranslation({
    valueMultiloc: props.valueMultiloc,
    onChange: (multiloc) => props.onChange?.(multiloc),
  });

  if (!isNilOrError(tenantLocales)) {
    return (
      <InputMultilocWithLocaleSwitcher
        {...props}
        locales={tenantLocales}
        localeStates={translation.localeStates}
        localeStateLabels={translation.localeStateLabels}
        renderBelowInput={(selectedLocale) => (
          <MultilocTranslationStatus
            translation={translation}
            selectedLocale={selectedLocale}
          />
        )}
      />
    );
  }

  return null;
});

export default InputMultilocWithLocaleSwitcherWrapper;
