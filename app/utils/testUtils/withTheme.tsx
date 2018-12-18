/* TODO
import React from 'react';
import { ThemeProvider } from 'styled-components';
import { colors, fontSizes } from '../styleUtils';

import { shallow, mount } from 'enzyme';
const theme = {
  colors,
  fontSizes,
  colorMain: '#ef0071',
  menuStyle: 'light',
  menuHeight: 74,
  mobileMenuHeight: 72,
  mobileTopBarHeight: 66,
  maxPageWidth: 952,
};

export const shallowWithTheme = (tree) => {
  const context = shallow(<ThemeProvider theme={theme} />)
    .instance()
    .getChildContext();
  return shallow(tree, { context });
};
export const mountWithTheme = (tree) => {
  const context = shallow(<ThemeProvider theme={theme} />)
    .instance()
    .getChildContext();
  return mount(tree, {
    context,
    childContextTypes: ThemeProvider.childContextTypes,
  });
};
*/
