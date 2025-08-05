import React from 'react';

import { Box, colors } from '@citizenlab/cl2-component-library';
import { useSearchParams } from 'react-router-dom';

import useFeatureFlag from 'hooks/useFeatureFlag';

import { useIntl } from 'utils/cl-intl';

import Search from './_shared/FilterBar/Filters/Search';
import Folders from './Folders';
import Header from './Header';
import messages from './messages';
import Ordering from './Ordering';
import Projects from './Projects';
import Tabs from './Tabs';

const Calendar = React.lazy(() => import('./Calendar'));

const AdminProjectsListNew = () => {
  const [searchParams] = useSearchParams();
  const { formatMessage } = useIntl();
  const tab = searchParams.get('tab');
  const calendarViewEnabled = useFeatureFlag({
    name: 'project_planning_calendar',
  });

  const showProjectSearch =
    tab === null || (tab === 'timeline' && calendarViewEnabled);

  return (
    <Box
      bgColor={colors.white}
      w="100%"
      h="100vh"
      px="51px"
      py="45px"
      maxWidth="1400px"
    >
      <Header />
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        borderBottom={`1px solid ${colors.grey200}`}
        height="44px"
      >
        <Tabs />
        {showProjectSearch && (
          <Search placeholder={formatMessage(messages.searchProjects)} />
        )}
        {tab === 'folders' && (
          <Search placeholder={formatMessage(messages.searchFolders)} />
        )}
      </Box>
      <Box mt="20px">
        {tab === null && <Projects />}
        {tab === 'folders' && <Folders />}
        {tab === 'calendar' && <Calendar />}
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
