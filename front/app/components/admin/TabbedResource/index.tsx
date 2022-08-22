import React from 'react';

// routing
import { withRouter, WithRouterProps } from 'utils/cl-router/withRouter';
import Link from 'utils/cl-router/Link';

// style
import styled from 'styled-components';
import { colors, fontSizes, isRtl } from 'utils/styleUtils';

// typings
import { ITab } from 'typings';

// components
import FeatureFlag from 'components/FeatureFlag';
import { SectionDescription } from 'components/admin/Section';
import Title from 'components/admin/PageTitle';
import { StatusLabel } from '@citizenlab/cl2-component-library';

const ResourceHeader = styled.div`
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  margin-bottom: 30px;

  @media print {
    margin-bottom: 10px;
  }

  p {
    margin-right: 40px;
  }
`;

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
  ${isRtl`
    padding-right: 44px;
    padding-left: auto;
    justify-content: flex-end;
 `}
  flex-wrap: wrap;
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
  border: 1px solid ${colors.separation};
  background: ${colors.adminContentBackground};

  @media print {
    border: none;
    padding: 0;
    margin: 0;
  }
`;

const StatusLabelWithMargin = styled(StatusLabel)`
  margin-left: 12px;
`;

interface Props {
  resource: {
    title: string;
    subtitle?: string;
  };
  tabs?: ITab[];
  children?: React.ReactNode;
}

function getRegularExpression(tabUrl: string) {
  return new RegExp(`^/([a-zA-Z]{2,3}(-[a-zA-Z]{2,3})?)(${tabUrl})(/)?$`);
}

const FormattedTabLink = ({
  tab: { url, label, statusLabel },
}: {
  tab: ITab;
}) => {
  if (statusLabel) {
    return (
      <Link to={url}>
        {label}
        <StatusLabelWithMargin
          text={statusLabel}
          backgroundColor={colors.adminBackground}
          variant="outlined"
        />
      </Link>
    );
  }

  return <Link to={url}>{label}</Link>;
};

const TabbedResource = ({
  location: { pathname },
  children,
  resource: { title, subtitle },
  tabs,
}: Props & WithRouterProps) => {
  const activeClassForTab = (tab: ITab) => {
    return (
      typeof tab.active === 'function'
        ? tab.active(pathname)
        : tab.active ||
          (pathname && getRegularExpression(tab.url).test(location.pathname))
    )
      ? 'active'
      : '';
  };

  return (
    <>
      <ResourceHeader className="e2e-resource-header">
        <div>
          <Title>{title}</Title>
          {subtitle && <SectionDescription>{subtitle}</SectionDescription>}
        </div>
      </ResourceHeader>

      {tabs && tabs.length > 0 && (
        <TabbedNav className="e2e-resource-tabs">
          {tabs.map((tab) => {
            if (tab.feature) {
              return (
                <FeatureFlag key={tab.url} name={tab.feature}>
                  <Tab
                    key={tab.url}
                    className={`${tab.name} ${activeClassForTab(tab)}`}
                    data-testid="resource-single-tab"
                  >
                    <FormattedTabLink tab={tab} />
                  </Tab>
                </FeatureFlag>
              );
            }

            // no feature, just return tab with label
            return (
              <Tab
                key={tab.url}
                className={`${tab.name} ${activeClassForTab(tab)}`}
                data-testid="resource-single-tab"
              >
                <FormattedTabLink tab={tab} />
              </Tab>
            );
          })}
        </TabbedNav>
      )}
      <ChildWrapper>{children}</ChildWrapper>

      {true ? <>{children}</> : <ChildWrapper>{children}</ChildWrapper>}
    </>
  );
};

export default withRouter(TabbedResource);
