import React from 'react';
import { ThemeProvider } from 'styled-components';
import { getTheme } from '../app/utils/styleUtils';
import GlobalStyle from '../app/global-styles';

const ThemeDecorator = storyFn => (
  <ThemeProvider theme={getTheme(null)}>
    <GlobalStyle />
    {storyFn()}
  </ThemeProvider>
)

export default ThemeDecorator;
