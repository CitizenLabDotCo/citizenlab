import React from 'react';

import { StatusLabel } from '@citizenlab/cl2-component-library';

// style
import styled, { css } from 'styled-components';
import { colors, fontSizes } from 'utils/styleUtils';
import {
  tabLineHeight,
  tabPadding,
  tabBorderSize,
  activeBorderSize,
} from './tabsStyleConstants';

export const darkSkyBlue = '#7FBBCA'; // TODO: Use color from component library.

// very similar to front/app/components/admin/TabbedResource/Tab.tsx
const Container = styled.div`
  ${({ active }: TabProps) => css`
    list-style: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    margin-bottom: calc(${tabBorderSize}px * -1);
    border-bottom: ${activeBorderSize}px solid transparent;

    &:first-letter {
      text-transform: uppercase;
    }

    &:not(:last-child) {
      margin-right: 40px;
    }

    a {
      color: ${colors.textSecondary};
      font-size: ${fontSizes.base}px;
      font-weight: 400;
      line-height: ${tabLineHeight}px;
      padding: 0;
      padding-top: ${tabPadding}px;
      padding-bottom: ${tabPadding}px;
      transition: all 100ms ease-out;
    }

    &:hover a {
      color: ${colors.primary};
    }

    ${!active &&
    `&:hover {
      border-color: #ddd;
    }`}

    ${active &&
    `border-color: ${darkSkyBlue};
    // border-color: ${colors.primary}; TODO : set accent color in component library

    a {
        color: ${colors.primary};
    }`}
  `}
`;

const StatusLabelWithMargin = styled(StatusLabel)`
  margin-left: 12px;
`;

type TabProps = {
  active: boolean;
  statusLabel?: string;
} & React.HTMLAttributes<HTMLDivElement>;

const Tab = ({ active, statusLabel, children, ...props }: TabProps) => (
  <Container active={active} {...props}>
    {children}
    {statusLabel && (
      <StatusLabelWithMargin
        text={statusLabel}
        backgroundColor={colors.background}
        variant="outlined"
      />
    )}
  </Container>
);

export default Tab;
