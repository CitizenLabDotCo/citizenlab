import React, { Suspense } from 'react';

import { Box, colors } from '@citizenlab/cl2-component-library';

import useFeatureFlag from 'hooks/useFeatureFlag';

import { useIntl } from 'utils/cl-intl';
import { useSearchTanStack } from 'utils/router';

import Search from './_shared/FilterBar/Filters/Search';
import Folders from './Folders';
import Header from './Header';
import messages from './messages';
import Ordering from './Ordering';
import Projects from './Projects';
import Tabs from './Tabs';

const Calendar = React.lazy(() => import('./Calendar'));
const Spaces = React.lazy(() => import('./Spaces'));

const getSearchMessage = (
  tab: string | undefined,
  calendarViewEnabled: boolean,
  spacesEnabled: boolean
) => {
  if (tab === undefined) {
    return messages.searchProjects;
  }

  if (tab === 'calendar' && calendarViewEnabled) {
    return messages.searchProjects;
  }

  if (tab === 'folders') {
    return messages.searchFolders;
  }

  if (tab === 'spaces' && spacesEnabled) {
    return messages.searchSpaces;
  }

  return undefined;
};

const AdminProjectsListNew = () => {
  const searchParams = useSearchTanStack({
    from: '/$locale/admin/projects/',
  });
  const { formatMessage } = useIntl();
  const tab = searchParams.tab;
  const calendarViewEnabled = useFeatureFlag({
    name: 'project_planning_calendar',
  });
  const spacesEnabled = useFeatureFlag({
    name: 'spaces',
  });

  const searchMessage = getSearchMessage(
    tab,
    calendarViewEnabled,
    spacesEnabled
  );

  return (
    <Box
      bgColor={colors.white}
      w="100%"
      h="100vh"
      py="45px"
      display="flex"
      flexDirection="column"
      alignItems="center"
    >
      <Box px="51px" maxWidth="1400px" w="100%">
        <Header />
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          borderBottom={`1px solid ${colors.grey200}`}
          height="44px"
        >
          <Tabs />
          {searchMessage && (
            <Box mb="16px">
              <Search placeholder={formatMessage(searchMessage)} />
            </Box>
          )}
        </Box>
        <Box mt="20px">
          {tab === undefined && <Projects />}
          {tab === 'folders' && <Folders />}
          {tab === 'calendar' && (
            <Suspense>
              <Calendar />
            </Suspense>
          )}
          {tab === 'spaces' && (
            <Suspense>
              <Spaces />
            </Suspense>
          )}
          {tab === 'ordering' && (
            <Box>
              <Ordering />
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default AdminProjectsListNew;
