import React, { memo, useMemo } from 'react';

import { withRouter, WithRouterProps } from 'react-router';
import Link from 'utils/cl-router/Link';

// style
import styled from 'styled-components';
import { colors, fontSizes, defaultStyles } from 'utils/styleUtils';

// typings
import { Message } from 'typings';

// components
import FeatureFlag from 'components/FeatureFlag';

const aLineHeight = fontSizes.base * 1.5;
const aPadding = fontSizes.base;
const wrapperPadding = 42;
const tabBorderSize = 1;
const activeBorderSize = 3;

const TabbedNav = styled.nav`
  position: fixed;
  width: 100%;
  // TODO : set bg color in component library
  background: #fbfbfb;
  z-index: 1000;
  box-shadow: ${defaultStyles.boxShadow};
  border-radius: ${(props: any) => props.theme.borderRadius}
    ${(props: any) => props.theme.borderRadius} 0 0;
  padding-left: 44px;
  display: flex;
  border: ${tabBorderSize}px solid ${colors.separation};
  border-bottom: ${tabBorderSize}px solid transparent;
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
  margin-bottom: calc(${tabBorderSize}px * -1);

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
    line-height: ${aLineHeight}px;
    padding: 0;
    padding-top: ${aPadding}px;
    padding-bottom: ${aPadding}px;
    border-bottom: ${activeBorderSize}px solid transparent;
    transition: all 100ms ease-out;
  }

  &:not(.active):hover a {
    color: ${colors.adminTextColor};
    border-color: #ddd;
  }

  &.active a {
    color: ${colors.adminTextColor};
    // border-color: ${colors.adminTextColor}; TODO : set accent color in component library
    border-color: #7FBBCA;
  }
`;

const ChildWrapper = styled.div`
  width: 100%;
  margin-bottom: 60px;
  padding: ${wrapperPadding}px;
  padding-top: ${wrapperPadding +
  aLineHeight +
  aPadding +
  aPadding +
  tabBorderSize +
  activeBorderSize}px;
  max-width: 1400px;
  margin: 0 auto;
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

interface Props {
  resource: {
    title: string;
    publicLink?: string;
    subtitle?: string;
  };
  messages?: {
    viewPublicResource: Message;
  };
  tabs?: TabProps[];
}

function getRegularExpression(tabUrl: string) {
  return new RegExp(`^\/([a-zA-Z]{2,3}(-[a-zA-Z]{2,3})?)(${tabUrl})(\/)?$`);
}

const DashboardTabs = memo<Props & WithRouterProps>(
  ({ children, tabs, location }) => {
    return (
      <>
        {tabs &&
          tabs.length > 0 &&
          useMemo(
            () => (
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
                            getRegularExpression(tab.url).test(
                              location.pathname
                            )
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
                          getRegularExpression(tab.url).test(location.pathname)
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
            ),
            [tabs]
          )}

        <ChildWrapper>{children}</ChildWrapper>
      </>
    );
  }
);

export default withRouter(DashboardTabs);
