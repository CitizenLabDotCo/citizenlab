import { useEffect } from 'react';

import { getTheme } from '@citizenlab/cl2-component-library';

import { IAppConfiguration } from 'api/app_configuration/types';

interface Props {
  appConfiguration?: IAppConfiguration | null;
}

const setOrClear = (name: string, value?: string) => {
  const style = document.documentElement.style;
  if (value) style.setProperty(name, value);
  else style.removeProperty(name);
};

/**
 * Writes the city's colours and font into the --gv-tenant-* and
 * --gv-font-family variables. Values come from getTheme, so the fallbacks are
 * the same ones styled-components sees. Renders nothing.
 */
const ModeProvider = ({ appConfiguration }: Props) => {
  useEffect(() => {
    const { colors, fontFamily } = getTheme(appConfiguration);
    setOrClear('--gv-tenant-primary', colors.tenantPrimary);
    setOrClear('--gv-tenant-secondary', colors.tenantSecondary);
    setOrClear('--gv-tenant-text', colors.tenantText);
    setOrClear('--gv-font-family', fontFamily);
  }, [appConfiguration]);

  return null;
};

export default ModeProvider;
