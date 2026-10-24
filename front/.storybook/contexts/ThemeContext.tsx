import React, { useEffect } from 'react';
import { ThemeProvider } from 'styled-components';
import { getTheme } from '@citizenlab/cl2-component-library';
import GlobalStyle from '../../app/global-styles';
import '../../app/assets/css/reset.min.css';
import '../../app/assets/fonts/fonts.css';
import 'tippy.js/dist/tippy.css';
import 'tippy.js/themes/light.css';
import { CityKey, DEFAULT_CITY, cityOf, cityTenant } from '../cities';
import TenantTokens from './TenantTokens';

// Adds the city's web font stylesheet once; it stays for later stories.
const useFontCss = (href?: string) => {
  useEffect(() => {
    if (!href || document.querySelector(`link[href="${href}"]`)) return;
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    document.head.appendChild(link);
  }, [href]);
};

const ThemeContext = ({
  city = DEFAULT_CITY,
  lang = 'en',
  children,
}: {
  city?: CityKey;
  lang?: string;
  children: React.ReactNode;
}) => {
  const tenant = cityTenant(city);
  useFontCss(cityOf(city).fontCss);
  return (
    <ThemeProvider
      theme={{ ...getTheme(tenant), isRtl: lang.startsWith('ar') }}
    >
      {/* The city also fills the --gv-tenant-* and --gv-font-family slots. */}
      <TenantTokens tenant={tenant} />
      <GlobalStyle />
      {children}
    </ThemeProvider>
  );
};

export default ThemeContext;
