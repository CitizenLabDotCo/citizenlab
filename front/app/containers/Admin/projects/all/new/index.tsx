import React from 'react';

import { Box, colors } from '@citizenlab/cl2-component-library';
import { useSearchParams } from 'react-router-dom';

import { useIntl } from 'utils/cl-intl';

import Search from './_shared/FilterBar/Filters/Search';
import Folders from './Folders';
import Header from './Header';
import messages from './messages';
import Ordering from './Ordering';
import Projects from './Projects';
import Tabs from './Tabs';
import Timeline from './Timeline';

const AdminProjectsListNew = () => {
  const [searchParams] = useSearchParams();
  const { formatMessage } = useIntl();
  const tab = searchParams.get('tab');

  return (
    <Box bgColor={colors.white} w="100%" h="100vh" px="51px" py="45px">
      <Header />
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        borderBottom={`1px solid ${colors.grey200}`}
      >
        <Tabs />
        {[null, 'timeline'].includes(tab) && (
          <Search placeholder={formatMessage(messages.searchProjects)} />
        )}
        {tab === 'folders' && (
          <Search placeholder={formatMessage(messages.searchFolders)} />
        )}
      </Box>
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
