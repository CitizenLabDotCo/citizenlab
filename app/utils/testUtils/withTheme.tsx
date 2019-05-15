import React from 'react';
import { ThemeProvider } from 'styled-components';
import { colors, fontSizes, stylingConsts } from 'utils/styleUtils';
import { shallow, mount } from 'enzyme';

export const theme = {
  colors,
  fontSizes,
  colorMain: '#ef0071',
  colorText: '#e68f51',
  colorSecondary: '#f76901',
  menuStyle: 'light',
  menuHeight: 74,
  mobileMenuHeight: 72,
  mobileTopBarHeight: 66,
  maxPageWidth: 952,
  ...stylingConsts
};

// export function shallowWithTheme<C extends Component, P = C['props'], S = C['state']>(tree: ReactElement<P>, options?: ShallowRendererProps) {
//   const context = shallow(<ThemeProvider theme={theme} />)
//     .instance()
//     .getChildContext();
//   return shallow(tree, {
//     ...options,
//     context: {
//       ...context,
//       intl
//     }
//   }) as ShallowWrapper<P, S, C>;
// }
//
export const shallowWithTheme = (tree) => {
  const context = (shallow(<ThemeProvider theme={theme} />).instance() as any).getChildContext();
  return shallow(tree, { context });
};

export const mountWithTheme = (tree) => {
  const context = shallow(<ThemeProvider theme={theme} />)
    .instance()
    // @ts-ignore: TODO type this well
    .getChildContext();
  return mount(tree, {
    context,
    childContextTypes: ThemeProvider.childContextTypes,
  });
};
//
// export const mountWithTheme = (children: any) => mount(<ThemeProvider theme={theme}>{children}</ThemeProvider>);
//
// export const shallowWithTheme = (children: any) => shallow(<ThemeProvider theme={theme}>{children}</ThemeProvider>);
