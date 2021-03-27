import React from 'react';
import { ThemeProvider } from 'styled-components';
import { colors, fontSizes, stylingConsts } from 'utils/styleUtils';
import { shallow, mount } from 'enzyme';

export const theme = {
  colors,
  fontSizes,
  fontFamily: 'Public Sans',
  colorMain: '#ef0071',
  colorText: '#e68f51',
  colorSecondary: '#f76901',
  menuStyle: 'light',
  ...stylingConsts,
};

export const mountWithTheme = (children) =>
  mount(<ThemeProvider theme={theme}>{children}</ThemeProvider>);

export const shallowWithTheme = (children) =>
  shallow(<ThemeProvider theme={theme}>{children}</ThemeProvider>);
