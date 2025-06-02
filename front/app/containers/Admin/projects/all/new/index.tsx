import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';
import { useSearchParams } from 'react-router-dom';

import Header from '../_shared/Header';

import Tabs from './Tabs';

const AdminProjectsListNew = () => {
  const [searchParams] = useSearchParams();
  const tab = searchParams.get('tab');

  return (
    <Box>
      <Header />
      <Tabs />
    </Box>
  );
};

export default AdminProjectsListNew;
