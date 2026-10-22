import React from 'react';
import { ThemeProvider } from 'styled-components';
import { getTheme } from '@citizenlab/cl2-component-library';
import GlobalStyle from '../../app/global-styles';
import '../../app/assets/css/reset.min.css';
// import '../../app/assets/fonts/fonts.css';
import 'tippy.js/dist/tippy.css';
import 'tippy.js/themes/light.css';
import { CityKey, cityTenant } from '../cities';

const ThemeContext = ({
  city = 'default',
  lang = 'en',
  children,
}: {
  city?: CityKey;
  lang?: string;
  children: React.ReactNode;
}) => (
  <ThemeProvider
    theme={{ ...getTheme(cityTenant(city)), isRtl: lang.startsWith('ar') }}
  >
    <GlobalStyle />
    {children}
  </ThemeProvider>
);

export default ThemeContext;
