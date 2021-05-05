import React from 'react';
import styled from 'styled-components';
import { colors } from 'utils/styleUtils';
import {
  tabLineHeight,
  tabPadding,
  tabBorderSize,
  activeBorderSize,
  wrapperPadding,
} from './styleConfig';

const StyledTabPanel = styled.div`
  width: 100%;
  margin-bottom: 60px;
  padding: ${wrapperPadding}px;
  padding-top: ${wrapperPadding +
  tabLineHeight +
  tabPadding +
  tabPadding +
  tabBorderSize +
  activeBorderSize}px;
  max-width: 1400px;
  margin: 0 auto;
  background: ${colors.adminContentBackground};

  @media print {
    border: none;
    padding: 0;
    margin: 0;
  }
`;

const TabPanel: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  children,
  ...rest
}) => <StyledTabPanel {...rest}>{children}</StyledTabPanel>;

export default TabPanel;
