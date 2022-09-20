import React from 'react';

// components
import { Box } from '@citizenlab/cl2-component-library';
import StickyContainer from './StickyContainer';
import Breadcrumbs, { TBreadcrumbs } from 'components/UI/Breadcrumbs';
import PageTitle from 'components/admin/PageTitle';
import PageWrapper from 'components/admin/PageWrapper';
import { SectionDescription } from 'components/admin/Section';

interface Props {
  breadcrumbs?: TBreadcrumbs;
  title?: string | JSX.Element;
  subtitle?: string | JSX.Element;
  children: JSX.Element | JSX.Element[];
  stickyMenuContents?: JSX.Element | JSX.Element[];
  rightSideCTA?: JSX.Element | JSX.Element[];
}

const SectionFormWrapper = ({
  breadcrumbs,
  title,
  subtitle,
  children,
  stickyMenuContents,
  rightSideCTA,
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
            <PageTitle>{title}</PageTitle>
            {subtitle && <SectionDescription>{subtitle}</SectionDescription>}
          </Box>
        )}
        {rightSideCTA && <Box ml="60px">{rightSideCTA}</Box>}
      </Box>
      <Box>
        <PageWrapper>
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
