import React from 'react';

// style
import styled, { css } from 'styled-components';
import { colors, defaultStyles } from 'utils/styleUtils';
import { tabBorderSize } from './styleConfig';

// components
import Tab from './Tab';
import TabPanel from './TabPanel';

const StyledNavigationTabs = styled.nav`
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

const NavigationTabs: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  children,
  ...rest
}) => <StyledNavigationTabs {...rest}>{children}</StyledNavigationTabs>;

export { Tab, TabPanel };
export default NavigationTabs;
