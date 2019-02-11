import React from 'react';
import { ThemeProvider } from 'styled-components';
import { colors, fontSizes } from 'utils/styleUtils';
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
/* TODO: type this right... https://github.com/styled-components/jest-styled-components/issues/217
export function shallowWithTheme<C extends Component, P = C['props'], S = C['state']>(tree: ReactElement<P>, options?: ShallowRendererProps) {
  const context = shallow(<ThemeProvider theme={theme} />)
    .instance()
    .getChildContext();
  return shallow(tree, {
    ...options,
    context: {
      ...context,
      intl
    }
  }) as ShallowWrapper<P, S, C>;
}
*/

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
