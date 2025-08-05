import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';
import { useSearchParams } from 'react-router-dom';

import Header from '../_shared/Header';

import Folders from './Folders';
import Ordering from './Ordering';
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
      <Box mt="20px">
        {tab === null && <Projects />}
        {tab === 'folders' && <Folders />}
        {tab === 'timeline' && <Timeline />}
        {tab === 'ordering' && (
          <Box>
            <Ordering />
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default AdminProjectsListNew;
