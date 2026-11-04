import { useEffect } from 'react';

import { getTheme } from '@citizenlab/cl2-component-library';

const setOrClear = (name: string, value?: string) => {
  const style = document.documentElement.style;
  if (value) style.setProperty(name, value);
  else style.removeProperty(name);
};

/**
 * Storybook only: writes the city's colours and font into the
 * --gv-tenant-* and --gv-font-family slots of tokens.css, from getTheme, so
 * the workbench's token previews follow the City switch. Renders nothing.
 */
const TenantTokens = ({ tenant }: { tenant: unknown }) => {
  useEffect(() => {
    const { colors, fontFamily } = getTheme(tenant as never);
    setOrClear('--gv-tenant-primary', colors.tenantPrimary);
    setOrClear('--gv-tenant-secondary', colors.tenantSecondary);
    setOrClear('--gv-tenant-text', colors.tenantText);
    setOrClear('--gv-font-family', fontFamily);
  }, [tenant]);

  return null;
};

export default TenantTokens;
