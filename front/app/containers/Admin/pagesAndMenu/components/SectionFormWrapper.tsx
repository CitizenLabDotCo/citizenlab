import React from 'react';

// components
import { Box, Title } from '@citizenlab/cl2-component-library';
import PageWrapper from 'components/admin/PageWrapper';
import { SectionDescription } from 'components/admin/Section';
import Breadcrumbs, { TBreadcrumbs } from 'components/UI/Breadcrumbs';
import StickyContainer from './StickyContainer';

interface Props {
  breadcrumbs?: TBreadcrumbs;
  title?: string | JSX.Element;
  subtitle?: string | JSX.Element;
  children: JSX.Element | JSX.Element[];
  stickyMenuContents?: JSX.Element | JSX.Element[];
  rightSideCTA?: JSX.Element | JSX.Element[] | null;
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
      <Box display="flex" justifyContent="space-between" alignItems="baseline">
        {title && (
          <Box mb="20px">
            <Box display="flex" alignItems="center">
              <Title color="primary">{title}</Title>
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
