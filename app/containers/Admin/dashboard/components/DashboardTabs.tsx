import React from 'react';

import { withRouter, WithRouterProps } from 'react-router';
import Link from 'utils/cl-router/Link';

// style
import styled from 'styled-components';
import { colors, fontSizes } from 'utils/styleUtils';

// typings
import { Message } from 'typings';

// components
import FeatureFlag from 'components/FeatureFlag';

const TabbedNav = styled.nav`
  background: #fcfcfc;
  border-radius: ${(props: any) => props.theme.borderRadius}
    ${(props: any) => props.theme.borderRadius} 0 0;
  padding-left: 44px;
  display: flex;
  border: 1px solid ${colors.separation};
  border-bottom: 1px solid transparent;
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

const ChildWrapper = styled.div`
  margin-bottom: 60px;
  padding: 42px;
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
      <>
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
      </>
    );
  }
}

export default withRouter(DashboardTabs);
