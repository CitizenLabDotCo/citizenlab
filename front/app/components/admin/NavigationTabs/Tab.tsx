import React, { MouseEvent } from 'react';

import {
  Box,
  StatusLabel,
  colors,
  fontSizes,
} from '@citizenlab/cl2-component-library';
import Link from 'utils/cl-router/Link';

// style
import styled, { css } from 'styled-components';
import {
  tabLineHeight,
  tabPadding,
  tabBorderSize,
  activeBorderSize,
} from './tabsStyleConstants';

type ContainerProps = {
  active: boolean;
};

// very similar to front/app/components/admin/TabbedResource/Tab.tsx
const Container = styled.div`
  ${({ active }: ContainerProps) => css`
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
    `border-color: ${colors.teal500};
    // border-color: ${colors.primary}; TODO : set accent color in component library

    a {
        color: ${colors.primary};
    }`}
  `}
`;

type TabProps = {
  label: string;
  url: string;
  active: boolean;
  statusLabel?: string;
  handleClick?: (event: MouseEvent<HTMLAnchorElement>) => void;
} & React.HTMLAttributes<HTMLDivElement>;

const Tab = ({
  label,
  url,
  active,
  statusLabel,
  handleClick,
  ...props
}: TabProps) => (
  <Container active={active} {...props}>
    <Link to={url} onClick={handleClick}>
      {label}
      {statusLabel && (
        <Box ml="12px" display="inline">
          <StatusLabel
            text={statusLabel}
            backgroundColor={colors.background}
            variant="outlined"
          />
        </Box>
      )}
    </Link>
  </Container>
);

export default Tab;
