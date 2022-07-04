import React from 'react';

// components
import StickyContainer from './StickyContainer';
import { Box } from '@citizenlab/cl2-component-library';
import Breadcrumbs from 'components/UI/Breadcrumbs';
import PageTitle from 'components/admin/PageTitle';
import PageWrapper from 'components/admin/PageWrapper';

interface Props {
  breadcrumbs: { label: string; linkTo?: string }[];
  title: string;
  children: JSX.Element;
  stickyMenuContents: JSX.Element;
}

const SectionFormWrapper = ({
  breadcrumbs,
  title,
  children,
  stickyMenuContents,
}: Props) => {
  return (
    <>
      <Box mb="16px">
        <Breadcrumbs breadcrumbs={breadcrumbs} />
      </Box>
      <Box mb="20px">
        <PageTitle>{title}</PageTitle>
      </Box>
      <Box>
        <PageWrapper>
          {children}
          <StickyContainer>{stickyMenuContents}</StickyContainer>
        </PageWrapper>
      </Box>
    </>
  );
};

export default SectionFormWrapper;
