import React, { MouseEvent } from 'react';

import {
  TooltipContentWrapper,
  colors,
  fontSizes,
  Tooltip,
} from '@citizenlab/cl2-component-library';
import { RouteType } from 'routes';
import styled, { css } from 'styled-components';

import Link from 'utils/cl-router/Link';

import {
  tabLineHeight,
  tabPadding,
  tabBorderSize,
  activeBorderSize,
} from './tabsStyleConstants';

type ContainerProps = {
  active: boolean;
  disable?: boolean;
};

// very similar to front/app/components/admin/TabbedResource/Tab.tsx
const Container = styled.div`
  ${({ active, disable }: ContainerProps) => css`
    list-style: none;
    display: flex;
    align-items: center;
    margin-bottom: calc(${tabBorderSize}px * -1);
    border-bottom: ${activeBorderSize}px solid transparent;

    &:first-letter {
      text-transform: uppercase;
    }

    margin-right: 40px;

    ${disable ? 'cursor: not-allowed;' : 'cursor: pointer;'}

    a {
      ${disable ? 'pointer-events: none;' : ''}
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
  className?: string;
  'data-cy'?: string;
  label: string | React.ReactNode;
  url: RouteType;
  active: boolean;
  badge?: React.ReactNode;
  handleClick?: (event: MouseEvent<HTMLAnchorElement>) => void;
  disabledTooltipText?: string;
};

const Tab = ({
  label,
  url,
  badge,
  handleClick,
  disabledTooltipText,
  className,
  ...props
}: TabProps) => (
  <Tooltip
    placement="bottom"
    theme={''}
    disabled={!disabledTooltipText}
    maxWidth={350}
    content={
      <TooltipContentWrapper tippytheme="light">
        {disabledTooltipText}
      </TooltipContentWrapper>
    }
  >
    <Container disable={!!disabledTooltipText} {...props}>
      <Link
        to={url}
        onClick={handleClick}
        className={className ? `intercom-phase-${className}-tab` : ' '}
      >
        {label}
        {badge && <>{badge}</>}
      </Link>
    </Container>
  </Tooltip>
);
export default Tab;
