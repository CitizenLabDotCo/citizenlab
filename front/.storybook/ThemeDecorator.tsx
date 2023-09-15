import React from 'react';
import { ThemeProvider } from 'styled-components';
import { getTheme } from '../app/utils/styleUtils';
import GlobalStyle from '../app/global-styles';
import '../app/assets/css/reset.min.css';
// import '../app/assets/fonts/fonts.css';
import 'tippy.js/dist/tippy.css';
import 'tippy.js/themes/light.css';

const ThemeDecorator = (storyFn) => (
  <ThemeProvider theme={getTheme(null)}>
    <GlobalStyle />
    {storyFn()}
  </ThemeProvider>
);

export default ThemeDecorator;