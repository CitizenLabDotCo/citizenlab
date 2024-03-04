import React, { memo } from 'react';

import {
  InputMultilocWithLocaleSwitcher,
  InputMultilocWithLocaleSwitcherProps,
} from '@citizenlab/cl2-component-library';

import { isNilOrError } from 'utils/helperUtils';

import useAppConfigurationLocales from 'hooks/useAppConfigurationLocales';

export interface Props
  extends Omit<InputMultilocWithLocaleSwitcherProps, 'locales'> {}

const InputMultilocWithLocaleSwitcherWrapper = memo<Props>((props) => {
  const tenantLocales = useAppConfigurationLocales();

  if (!isNilOrError(tenantLocales)) {
    return (
      <InputMultilocWithLocaleSwitcher {...props} locales={tenantLocales} />
    );
  }

  return null;
});

export default InputMultilocWithLocaleSwitcherWrapper;
