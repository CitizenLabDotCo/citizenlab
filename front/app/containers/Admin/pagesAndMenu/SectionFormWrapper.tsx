import React from 'react';

// components
import StickyContainer from './StickyContainer';
import { Box, Button } from '@citizenlab/cl2-component-library';
import Breadcrumbs from 'components/UI/Breadcrumbs';
import PageTitle from 'components/admin/PageTitle';
import PageWrapper from 'components/admin/PageWrapper';

// test props for development purposes
const testBreadcrumbs = [
  { label: 'Pages & Menu', linkTo: '/test' },
  { label: 'Home', linkTo: '/test' },
  { label: 'Hero banner', linkTo: '/test' },
];
const TestBox = () => (
  <Box height="100px" mb="10px" border="1px solid black">
    Test Box
  </Box>
);
const testTitle = 'Hero Banner';
const testChildren = (
  <div>
    <TestBox /> <TestBox /> <TestBox /> <TestBox /> <TestBox />
    <TestBox />
    <TestBox />
    <TestBox />
  </div>
);

const SectionFormWrapper = ({
  breadcrumbs = testBreadcrumbs,
  title = testTitle,
  children = testChildren,
}) => {
  return (
    <div>
      <Box mb="16px">
        <Breadcrumbs breadcrumbs={breadcrumbs} />
      </Box>
      <Box mb="20px">
        <PageTitle>{title}</PageTitle>
      </Box>
      <Box>
        <PageWrapper>
          {children}
          <StickyContainer>
            <Button>Save Hero Banner</Button>
          </StickyContainer>
        </PageWrapper>
      </Box>
    </div>
  );
};

export default SectionFormWrapper;
