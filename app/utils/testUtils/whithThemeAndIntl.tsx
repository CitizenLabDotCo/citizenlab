// To render components with both intl and theme
// Never used yet, not sure how well it works
import React from 'react';
import { ThemeProvider } from 'styled-components';
import { colors, fontSizes } from '../styleUtils';

import { shallow } from 'enzyme';

import { shallowWithIntl, mountWithIntl } from 'utils/testUtils/withIntl';
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

export const shallowWithThemeIntl = (tree) => {
  const context = shallow(<ThemeProvider theme={theme} />)
    .instance()
    .getChildContext();
  return shallowWithIntl(tree, { context });
};
export const mountWithThemeIntl = (tree) => {
  const context = shallow(<ThemeProvider theme={theme} />)
    .instance()
    .getChildContext();
  return mountWithIntl(tree, {
    context,
    childContextTypes: ThemeProvider.childContextTypes,
  });
};
