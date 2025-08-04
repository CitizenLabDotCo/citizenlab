import React from 'react';

import { Box, colors } from '@citizenlab/cl2-component-library';
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
    <Box bgColor={colors.white} w="100%" h="100vh" px="51px" py="45px">
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
