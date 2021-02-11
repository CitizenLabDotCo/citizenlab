import React, { memo } from 'react';
import { isNilOrError } from 'utils/helperUtils';
import useAppConfigurationLocales from 'hooks/useTenantLocales';
import { InputMultiloc, InputMultilocProps } from 'cl2-component-library';

export interface Props extends Omit<InputMultilocProps, 'locales'> {}

const InputMultilocWrapper = memo<Props>((props) => {
  const tenantLocales = useAppConfigurationLocales();

  if (!isNilOrError(tenantLocales)) {
    return <InputMultiloc {...props} locales={tenantLocales} />;
  }

  return null;
});

export default InputMultilocWrapper;
