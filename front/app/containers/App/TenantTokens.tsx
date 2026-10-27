import { useEffect } from 'react';

import { useTheme } from 'styled-components';

const setOrClear = (name: string, value?: string) => {
  const style = document.documentElement.style;
  if (value) style.setProperty(name, value);
  else style.removeProperty(name);
};

/**
 * Writes the city's colours and font from the theme into the
 * --gv-tenant-* and --gv-font-family slots of design-system/tokens/tokens.css,
 * so a token read shows this city's colours instead of the file's defaults.
 * Renders nothing.
 */
const TenantTokens = () => {
  const { colors, fontFamily } = useTheme();
  const { tenantPrimary, tenantSecondary, tenantText } = colors;

  useEffect(() => {
    setOrClear('--gv-tenant-primary', tenantPrimary);
    setOrClear('--gv-tenant-secondary', tenantSecondary);
    setOrClear('--gv-tenant-text', tenantText);
    setOrClear('--gv-font-family', fontFamily);
  }, [tenantPrimary, tenantSecondary, tenantText, fontFamily]);

  return null;
};

export default TenantTokens;
