import React from 'react';

// style
import styled from 'styled-components';
import { colors, isRtl } from 'utils/styleUtils';

// typings
import { ITab } from 'typings';

// components
import FeatureFlag from 'components/FeatureFlag';
import { SectionDescription } from 'components/admin/Section';
import Title from 'components/admin/PageTitle';
import Tab from './Tab';

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

const ContentWrapper = styled.div`
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

interface Props {
  resource: {
    title: string;
    subtitle?: string;
  };
  tabs: ITab[];
  children: React.ReactNode;
  contentWrapper?: boolean;
}

const TabbedResource = ({
  children,
  resource: { title, subtitle },
  tabs,
  contentWrapper = true,
}: Props) => {
  return (
    <>
      <ResourceHeader className="e2e-resource-header">
        <>
          <Title>{title}</Title>
          {subtitle && <SectionDescription>{subtitle}</SectionDescription>}
        </>
      </ResourceHeader>

      {tabs && tabs.length > 0 && (
        <TabbedNav className="e2e-resource-tabs">
          {tabs.map((tab) => {
            return tab.feature ? (
              <FeatureFlag key={tab.url} name={tab.feature}>
                <Tab tab={tab} />
              </FeatureFlag>
            ) : (
              <Tab tab={tab} />
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
