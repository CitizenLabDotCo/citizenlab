import React from 'react';

import { withRouter, WithRouterProps } from 'react-router';
import Link from 'utils/cl-router/Link';

// style
import styled from 'styled-components';
import { colors, fontSizes, defaultStyles } from 'utils/styleUtils';

// typings
import { Message } from 'typings';

// components
import FeatureFlag from 'components/FeatureFlag';

const StyledContainer = styled.div`
  --a-font-size: ${fontSizes.base}px;
  --a-line-height: calc(var(--a-font-size) * 1.5);
  --a-padding: var(--a-font-size);
  --wrapper-padding: 42px;
  --tab-border-size: 1px;
  --active-border-size: 3px;
`;

const TabbedNav = styled.nav`
  position: fixed;
  width: 100%;
  background: #fcfcfc;
  z-index: 1000;
  box-shadow: ${defaultStyles.boxShadow};
  border-radius: ${(props: any) => props.theme.borderRadius}
    ${(props: any) => props.theme.borderRadius} 0 0;
  padding-left: 44px;
  display: flex;
  border: var(--tab-border-size) solid ${colors.separation};
  border-bottom: var(--tab-border-size) solid transparent;
  @media print {
    border: none;
    padding: 0;
    margin-bottom: 10px;
  }
`;

const Tab = styled.div`
  list-style: none;
  cursor: pointer;
  display: flex;
  margin-bottom: calc(var(--tab-border-size) * -1);

  &:first-letter {
    text-transform: uppercase;
  }

  &:not(:last-child) {
    margin-right: 40px;
  }

  a {
    color: ${colors.label};
    font-size: var(--a-font-size);
    font-weight: 400;
    line-height: var(--a-line-height);
    padding: 0;
    padding-top: var(--a-padding);
    padding-bottom: var(--a-padding);
    border-bottom: var(--active-border-size) solid transparent;
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

const ChildWrapper = styled.div`
  margin-bottom: 60px;
  padding: var(--wrapper-padding);
  padding-top: calc(
    var(--wrapper-padding) + var(--a-line-height) + var(--a-padding) +
      var(--a-padding) + var(--tab-border-size) + var(--active-border-size)
  );
  max-width: 1400px;
  margin: auto;
  background: ${colors.adminContentBackground};

  @media print {
    border: none;
    padding: 0;
    margin: 0;
  }
`;

export type TabProps = {
  label: string;
  url: string;
  active?: boolean;
  feature?: string;
  name?: string;
};

type Props = {
  resource: {
    title: string;
    publicLink?: string;
    subtitle?: string;
  };
  messages?: {
    viewPublicResource: Message;
  };
  tabs?: TabProps[];
};

type State = {};

function urlMatch(tabUrl: string) {
  return new RegExp(`^\/([a-zA-Z]{2,3}(-[a-zA-Z]{2,3})?)(${tabUrl})(\/)?$`);
}

class DashboardTabs extends React.PureComponent<
  Props & WithRouterProps,
  State
> {
  render() {
    const { children, tabs, location } = this.props;

    return (
      <StyledContainer>
        {tabs && tabs.length > 0 && (
          <TabbedNav className="e2e-resource-tabs">
            {tabs.map((tab) => {
              if (tab.feature) {
                return (
                  <FeatureFlag key={tab.url} name={tab.feature}>
                    <Tab
                      key={tab.url}
                      className={`${tab.name} ${
                        location &&
                        location.pathname &&
                        urlMatch(tab.url).test(location.pathname)
                          ? 'active'
                          : ''
                      }`}
                    >
                      <Link to={tab.url}>{tab.label}</Link>
                    </Tab>
                  </FeatureFlag>
                );
              } else {
                return (
                  <Tab
                    key={tab.url}
                    className={`${tab.name} ${
                      location &&
                      location.pathname &&
                      urlMatch(tab.url).test(location.pathname)
                        ? 'active'
                        : ''
                    }`}
                  >
                    <Link to={tab.url}>{tab.label}</Link>
                  </Tab>
                );
              }
            })}
          </TabbedNav>
        )}

        <ChildWrapper>{children}</ChildWrapper>
      </StyledContainer>
    );
  }
}

export default withRouter(DashboardTabs);
