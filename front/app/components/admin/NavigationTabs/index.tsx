import {
  BoxPositionProps,
  BoxPaddingProps,
  colors,
  defaultStyles,
} from '@citizenlab/cl2-component-library';
import styled, { css } from 'styled-components';

import Tab from './Tab';
import TabsPageLayout from './TabsPageLayout';
import { tabBorderSize } from './tabsStyleConstants';

const NavigationTabs = styled.nav<{
  position?: BoxPositionProps['position'];
  paddingLeft?: BoxPaddingProps['paddingLeft'];
  zIndex?: number;
}>`
  ${({ theme, position, paddingLeft, zIndex }) => css`
    position: ${position || 'fixed'};
    width: 100%;
    // TODO : set bg color in component library
    background: #fbfbfb;
    z-index: ${zIndex ?? 1000};
    box-shadow: ${defaultStyles.boxShadow};
    border-radius: ${theme.borderRadius} ${theme.borderRadius} 0 0;
    padding-left: ${paddingLeft || '44px'};
    display: flex;
    border: ${tabBorderSize}px solid ${colors.divider};
    border-bottom: ${tabBorderSize}px solid transparent;
    @media print {
      border: none;
      padding: 0;
      margin-bottom: 10px;
    }
  `}
`;

export { Tab, TabsPageLayout };
export default NavigationTabs;
