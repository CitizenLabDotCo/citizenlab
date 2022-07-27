import React from 'react';

// components
import { Box } from '@citizenlab/cl2-component-library';
import StickyContainer from './StickyContainer';
import Breadcrumbs from 'components/UI/Breadcrumbs';
import PageTitle from 'components/admin/PageTitle';
import PageWrapper from 'components/admin/PageWrapper';

interface Props {
  breadcrumbs: { label: string; linkTo?: string }[];
  title?: string;
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
      <Box mb="16px">
        <Breadcrumbs breadcrumbs={breadcrumbs} />
      </Box>
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
