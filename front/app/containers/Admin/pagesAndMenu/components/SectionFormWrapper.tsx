import React from 'react';

// components
import { fontSizes } from 'utils/styleUtils';
import styled from 'styled-components';
import { Box } from '@citizenlab/cl2-component-library';
import StickyContainer from './StickyContainer';
import Breadcrumbs, { TBreadcrumbs } from 'components/UI/Breadcrumbs';
import PageWrapper from 'components/admin/PageWrapper';
import { SectionDescription } from 'components/admin/Section';

const PageTitle = styled.h1`
  font-size: ${fontSizes.xxxl}px;
  line-height: 40px;
  font-weight: 600;
  padding: 0;
  margin: 0;
`;

interface Props {
  breadcrumbs?: TBreadcrumbs;
  title?: string | JSX.Element;
  subtitle?: string | JSX.Element;
  children: JSX.Element | JSX.Element[];
  stickyMenuContents?: JSX.Element | JSX.Element[];
  rightSideCTA?: JSX.Element | JSX.Element[];
  flatTopBorder?: boolean;
  badge?: JSX.Element;
}

const SectionFormWrapper = ({
  breadcrumbs,
  title,
  subtitle,
  children,
  stickyMenuContents,
  rightSideCTA,
  flatTopBorder,
  badge,
}: Props) => {
  return (
    <>
      {breadcrumbs && (
        <Box mb="16px">
          <Breadcrumbs breadcrumbs={breadcrumbs} />
        </Box>
      )}
      <Box display="flex" justifyContent="space-between">
        {title && (
          <Box mb="20px">
            <Box display="flex" alignItems="center">
              <PageTitle>{title}</PageTitle>{' '}
              {badge && <Box ml="20px">{badge}</Box>}
            </Box>
            {subtitle && <SectionDescription>{subtitle}</SectionDescription>}
          </Box>
        )}
        {rightSideCTA && <Box ml="60px">{rightSideCTA}</Box>}
      </Box>
      <Box>
        <PageWrapper flatTopBorder={flatTopBorder}>
          {children}
          {stickyMenuContents && (
            <StickyContainer>{stickyMenuContents}</StickyContainer>
          )}
        </PageWrapper>
      </Box>
    </>
  );
};

export default SectionFormWrapper;
