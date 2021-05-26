// style
import styled, { css } from 'styled-components';
import { colors, defaultStyles } from 'utils/styleUtils';
import { tabBorderSize } from './tabsStyleConstants';

// components
import Tab from './Tab';
import TabsPageLayout from './TabsPageLayout';

const NavigationTabs = styled.nav`
  ${({ theme }) => css`
    position: fixed;
    width: 100%;
    // TODO : set bg color in component library
    background: #fbfbfb;
    z-index: 1000;
    box-shadow: ${defaultStyles.boxShadow};
    border-radius: ${theme.borderRadius} ${theme.borderRadius} 0 0;
    padding-left: 44px;
    display: flex;
    border: ${tabBorderSize}px solid ${colors.separation};
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
