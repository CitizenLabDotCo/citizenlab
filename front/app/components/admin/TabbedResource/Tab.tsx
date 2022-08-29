import React from 'react';
import { ITab } from 'typings';
import { useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { colors, fontSizes } from 'utils/styleUtils';
import Link from 'utils/cl-router/Link';
import { StatusLabel } from '@citizenlab/cl2-component-library';

const Container = styled.div`
  list-style: none;
  cursor: pointer;
  display: flex;
  margin-bottom: -1px;

  &:first-letter {
    text-transform: uppercase;
  }

  &:not(:last-child) {
    margin-right: 40px;
  }

  a {
    color: ${colors.label};
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
    color: ${colors.adminTextColor};
    border-color: #ddd;
  }

  &.active a {
    color: ${colors.adminTextColor};
    border-color: ${colors.adminTextColor};
  }
`;

const StatusLabelWithMargin = styled(StatusLabel)`
  margin-left: 12px;
`;

interface Props {
  tab: ITab;
}

const Tab = ({ tab: { url, label, statusLabel, active } }: Props) => {
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
      className={`${name} ${activeClassForTab()}`}
      data-testid="resource-single-tab"
    >
      <Link to={url}>
        {label}
        {statusLabel && (
          <StatusLabelWithMargin
            text={statusLabel}
            backgroundColor={colors.adminBackground}
            variant="outlined"
          />
        )}
      </Link>
    </Container>
  );
};

export default Tab;

function getRegularExpression(tabUrl: string) {
  return new RegExp(`^/([a-zA-Z]{2,3}(-[a-zA-Z]{2,3})?)(${tabUrl})(/)?$`);
}
