import React from 'react';
import Breadcrumbs from 'components/UI/Breadcrumbs';
import PageTitle from 'components/admin/PageTitle';
import { Box } from '@citizenlab/cl2-component-library';

const testBreadcrumbs = [
  { label: 'Pages & Menu', linkTo: 'test' },
  { label: 'Home', linkTo: 'test' },
  { label: 'Hero Banner', linkTo: 'test' },
];

const testTitle = 'Hero Banner';
const testChildren = <div>hello</div>;

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
      <PageTitle>{title}</PageTitle>
      {children}
    </div>
  );
};

export default SectionFormWrapper;
