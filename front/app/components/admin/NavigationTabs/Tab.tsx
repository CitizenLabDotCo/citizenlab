import React, { MouseEvent } from 'react';

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

type TabContentProps = {
  label: string;
  url: string;
  badge?: React.ReactNode;
  handleClick?: (event: MouseEvent<HTMLAnchorElement>) => void;
};

const TabContent = ({ label, url, badge, handleClick }: TabContentProps) => (
  <Link to={url} onClick={handleClick}>
    {label}
    {badge && <>{badge}</>}
  </Link>
);

type TabProps = TabContentProps & {
  className?: string;
  'data-cy'?: string;
  active: boolean;
  disabled?: boolean;
  disabledTooltip?: string;
};

const Tab = ({
  active,
  disabled,
  disabledTooltip,
  label,
  url,
  badge,
  handleClick,
  ...props
}: TabProps) =>
  disabled ? (
    <Tippy
      interactive={false}
      placement="bottom"
      theme={''}
      maxWidth={350}
      content={
        <TooltipContentWrapper tippytheme="light">
          {disabledTooltip}
        </TooltipContentWrapper>
      }
    >
      <Container active={active} {...props}>
        <TabContent
          label={label}
          url={url}
          badge={badge}
          handleClick={handleClick}
        />
      </Container>
    </Tippy>
  ) : (
    <Container active={active} {...props}>
      <TabContent
        label={label}
        url={url}
        badge={badge}
        handleClick={handleClick}
      />
    </Container>
  );

export default Tab;
