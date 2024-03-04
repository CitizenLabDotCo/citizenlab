import React, { MouseEvent, forwardRef } from 'react';

import {
  TooltipContentWrapper,
  colors,
  fontSizes,
} from '@citizenlab/cl2-component-library';
import Link from 'utils/cl-router/Link';
import Tippy from '@tippyjs/react';

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
  disableTab?: boolean;
};

// very similar to front/app/components/admin/TabbedResource/Tab.tsx
const Container = styled.div`
  ${({ active, disableTab }: ContainerProps) => css`
    list-style: none;
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
      ${disableTab ? `cursor: not-allowed;` : `cursor: pointer;`}
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
  label: string;
  url: string;
  active: boolean;
  badge?: React.ReactNode;
  handleClick?: (event: MouseEvent<HTMLAnchorElement>) => void;
  disabled?: boolean;
  disabledTooltipText?: string;
};

const Tab = ({
  label,
  url,
  badge,
  handleClick,
  disabled,
  disabledTooltipText,
  ...props
}: TabProps) => (
  <Tippy
    interactive={false}
    placement="bottom"
    theme={''}
    disabled={!disabled}
    maxWidth={350}
    content={
      <TooltipContentWrapper tippytheme="light">
        {disabledTooltipText}
      </TooltipContentWrapper>
    }
  >
    <Container disableTab={disabled} {...props}>
      <Link to={url} onClick={handleClick}>
        {label}
        {badge && <>{badge}</>}
      </Link>
    </Container>
  </Tippy>
);
export default Tab;
