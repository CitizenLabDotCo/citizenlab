import styled from 'styled-components';

import {
  tabLineHeight,
  tabPadding,
  tabBorderSize,
  activeBorderSize,
  wrapperPadding,
} from './tabsStyleConstants';

const TabsPageLayout = styled.div<{ paddingTop?: number }>`
  width: 100%;
  margin-bottom: 60px;
  padding: ${wrapperPadding}px;
  padding-top: ${({ paddingTop }) =>
    paddingTop !== undefined
      ? `${paddingTop}px`
      : `${
          wrapperPadding +
          tabLineHeight +
          tabPadding +
          tabPadding +
          tabBorderSize +
          activeBorderSize
        }px`};
  max-width: 1400px;
  margin: 0 auto;

  @media print {
    border: none;
    padding: 0;
    margin: 0;
  }
`;

export default TabsPageLayout;
