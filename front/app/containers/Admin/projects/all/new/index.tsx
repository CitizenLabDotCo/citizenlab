import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';
import { useSearchParams } from 'react-router-dom';

import Header from '../_shared/Header';

import Folders from './Folders';
import Projects from './Projects';
import Tabs from './Tabs';
import Timeline from './Timeline';

const AdminProjectsListNew = () => {
  const [searchParams] = useSearchParams();
  const tab = searchParams.get('tab');

  return (
    <Box>
      <Header />
      <Tabs />
      <Box mt="32px">
        <Box display={tab === null ? 'block' : 'none'}>
          <Projects />
        </Box>
        <Box display={tab === 'folders' ? 'block' : 'none'}>
          <Folders />
        </Box>
        <Box display={tab === 'timeline' ? 'block' : 'none'}>
          <Timeline />
        </Box>
      </Box>
    </Box>
  );
};

export default AdminProjectsListNew;
