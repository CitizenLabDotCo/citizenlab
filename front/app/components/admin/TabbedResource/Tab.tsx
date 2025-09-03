import React from 'react';

import {
  Box,
  StatusLabel,
  colors,
  fontSizes,
} from '@citizenlab/cl2-component-library';
import { useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { ITab } from 'typings';

import Link from 'utils/cl-router/Link';

// very similar to front/app/components/admin/NavigationTabs/Tab.tsx
const Container = styled.div`
  list-style: none;
  cursor: pointer;
  display: flex;
  margin-bottom: -1px;

  &:first-letter {
    text-transform: uppercase;
  }

  margin-right: 40px;

  a {
    color: ${colors.textSecondary};
    font-size: ${fontSizes.base}px;
    font-weight: 400;
    line-height: 1.5rem;
    padding: 0;
    padding-top: 1em;
    padding-bottom: 1em;
    border-bottom: 3px solid transparent;
    transition: all 100ms ease-out;
  }

  &:not(.active):hover a {
    color: ${colors.primary};
    border-color: #ddd;
  }

  &.active a {
    color: ${colors.primary};
    border-color: ${colors.primary};
  }
`;

interface Props {
  tab: ITab;
  className?: string;
}

const Tab = ({
  tab: { url, label, statusLabel, active },
  className,
}: Props) => {
  const { pathname } = useLocation();

  const activeClassForTab = () => {
    return (
      typeof active === 'function'
        ? active(pathname)
        : active ||
          (pathname && getRegularExpression(url).test(location.pathname))
    )
      ? 'active'
      : '';
  };

  return (
    <Container
      key={url}
      className={`${activeClassForTab()} ${className}`}
      data-testid="resource-single-tab"
    >
      <Link to={url}>
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
};

export default Tab;

function getRegularExpression(tabUrl: string) {
  return new RegExp(`^/([a-zA-Z]{2,3}(-[a-zA-Z]{2,3})?)(${tabUrl})(/)?$`);
}
