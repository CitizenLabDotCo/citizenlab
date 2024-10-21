import React from 'react';

import {
  Box,
  Text,
  Title,
  colors,
  isRtl,
} from '@citizenlab/cl2-component-library';
import styled from 'styled-components';
import { ITab } from 'typings';

import FeatureFlag from 'components/FeatureFlag';

import Tab from './Tab';

const TabbedNav = styled.nav`
  background: #fcfcfc;
  border-radius: ${(props) => props.theme.borderRadius}
    ${(props) => props.theme.borderRadius} 0 0;
  padding-left: 44px;
  display: flex;
  border: 1px solid ${colors.divider};
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

const ContentWrapper = styled.div`
  margin-bottom: 60px;
  padding: 42px;
  border: 1px solid ${colors.divider};
  background: ${colors.white};

  @media print {
    border: none;
    padding: 0;
    margin: 0;
  }
`;

interface Props {
  resource: {
    title: string;
    subtitle?: string;
    rightSideCTA?: JSX.Element | JSX.Element[];
  };
  tabs: ITab[];
  children: React.ReactNode;
  contentWrapper?: boolean;
}

const TabbedResource = ({
  children,
  resource: { title, subtitle, rightSideCTA },
  tabs,
  contentWrapper = true,
}: Props) => {
  return (
    <>
      <Box
        mb="30px"
        width="100%"
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        className="e2e-resource-header"
      >
        <Box>
          <Title color="primary">{title}</Title>
          {subtitle && (
            <Text maxWidth="60em" color="textSecondary">
              {subtitle}
            </Text>
          )}
        </Box>
        {rightSideCTA && <Box ml="60px">{rightSideCTA}</Box>}
      </Box>

      {/* TODO: Fix this the next time the file is edited. */}
      {/* eslint-disable-next-line @typescript-eslint/no-unnecessary-condition */}
      {tabs && tabs.length > 0 && (
        <TabbedNav className="e2e-resource-tabs">
          {tabs.map((tab) => {
            return tab.feature ? (
              <FeatureFlag key={tab.url} name={tab.feature}>
                <Tab tab={tab} className={`intercom-admin-tab-${tab.name}`} />
              </FeatureFlag>
            ) : (
              <Tab
                key={tab.url}
                tab={tab}
                className={`intercom-admin-tab-${tab.name}`}
              />
            );
          })}
        </TabbedNav>
      )}
      {contentWrapper ? (
        <ContentWrapper>{children}</ContentWrapper>
      ) : (
        <>{children}</>
      )}
    </>
  );
};

export default TabbedResource;
