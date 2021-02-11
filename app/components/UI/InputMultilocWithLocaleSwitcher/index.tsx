import React, { memo } from 'react';
import { isNilOrError } from 'utils/helperUtils';
import useAppConfigurationLocales from 'hooks/useTenantLocales';
import {
  InputMultilocWithLocaleSwitcher,
  InputMultilocWithLocaleSwitcherProps,
} from 'cl2-component-library';

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
