import React from 'react';
import { ThemeProvider } from 'styled-components';
import { getTheme } from '../src/utils/styleUtils';
import GlobalStyle from '../src/global-styles';
import '../src/assets/css/reset.min.css';
import '../src/assets/fonts/fonts.css';
import 'tippy.js/dist/tippy.css';
import 'tippy.js/themes/light.css';

const ThemeDecorator = (storyFn) => (
  <ThemeProvider theme={getTheme(null)}>
    <GlobalStyle />
    {storyFn()}
  </ThemeProvider>
);

export default ThemeDecorator;
