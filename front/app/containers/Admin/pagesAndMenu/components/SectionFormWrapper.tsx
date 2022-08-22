import React from 'react';

// components
import { Box } from '@citizenlab/cl2-component-library';
import StickyContainer from './StickyContainer';
import Breadcrumbs, { TBreadcrumbs } from 'components/UI/Breadcrumbs';
import PageTitle from 'components/admin/PageTitle';
import PageWrapper from 'components/admin/PageWrapper';

interface Props {
  breadcrumbs?: TBreadcrumbs;
  title?: string | JSX.Element;
  children: JSX.Element | JSX.Element[];
  stickyMenuContents?: JSX.Element | JSX.Element[];
  rightSideCTA?: JSX.Element | JSX.Element[];
}

const SectionFormWrapper = ({
  breadcrumbs,
  title,
  children,
  stickyMenuContents,
  rightSideCTA,
}: Props) => {
  return (
    <>
      {breadcrumbs && (
        <Box mb="16px" pb="40px">
          <Breadcrumbs breadcrumbs={breadcrumbs} />
        </Box>
      )}
      <Box display="flex" justifyContent="space-between">
        {title && (
          <Box mb="20px">
            <PageTitle>{title}</PageTitle>
          </Box>
        )}
        {rightSideCTA && <Box ml="auto">{rightSideCTA}</Box>}
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
