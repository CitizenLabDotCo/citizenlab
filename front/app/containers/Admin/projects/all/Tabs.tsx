import React from 'react';

import {
  Box,
  Button,
  colors,
  IconNames,
} from '@citizenlab/cl2-component-library';
import { useSearch } from 'utils/router';

import useAuthUser from 'api/me/useAuthUser';
import { HighestRole } from 'api/users/types';

import useFeatureFlag from 'hooks/useFeatureFlag';

import { trackEventByName } from 'utils/analytics';
import { MessageDescriptor, useIntl } from 'utils/cl-intl';
import { removeSearchParams } from 'utils/cl-router/removeSearchParams';
import { updateSearchParams } from 'utils/cl-router/updateSearchParams';
import { isAdmin } from 'utils/permissions/roles';

import { Parameter, PARAMS as PROJECT_PARAMS } from './_shared/params';
import messages from './messages';
import tracks from './tracks';

const FOLDER_PARAMS: Parameter[] = [
  'status',
  'managers',
  'search',
  'space_ids',
];

interface TabProps {
  message: MessageDescriptor;
  active: boolean;
  icon: IconNames;
  dataCy?: string;
  onClick: () => void;
}

const Tab = ({ message, active, icon, dataCy, onClick }: TabProps) => {
  const { formatMessage } = useIntl();

  return (
    <Box
      borderBottom={active ? `2px solid ${colors.primary}` : undefined}
      pb="4px"
      mr="20px"
      data-cy={dataCy}
    >
      <Button
        buttonStyle="text"
        p="0"
        m="0"
        icon={icon}
        iconSize="16px"
        textColor={active ? colors.textPrimary : undefined}
        iconColor={active ? colors.textPrimary : undefined}
        onClick={onClick}
      >
        {formatMessage(message)}
      </Button>
    </Box>
  );
};

const ROLES_THAT_CAN_SEE_SPACES: HighestRole[] = [
  'super_admin',
  'admin',
  'space_moderator',
];

const ROLES_THAT_CAN_SEE_FOLDERS: HighestRole[] = [
  ...ROLES_THAT_CAN_SEE_SPACES,
  'project_folder_moderator',
];

const Tabs = () => {
  const [searchParams] = useSearch({ strict: false });
  const tab = searchParams.get('tab');
  const { data: user } = useAuthUser();
  const spacesEnabled = useFeatureFlag({ name: 'spaces' });

  if (!user) return null;

  const userIsAdmin = isAdmin(user);

  const { highest_role } = user.data.attributes;
  if (!highest_role) return null;

  return (
    <Box
      as="nav"
      display="flex"
      w="100%"
      mt="12px"
      className="intercom-product-tour-project-page-tabs"
    >
      <Tab
        message={messages.projects}
        icon="projects"
        active={tab === null}
        dataCy="projects-overview-projects-tab"
        onClick={() => {
          if (tab === 'folders') {
            removeSearchParams(FOLDER_PARAMS);
          }

          removeSearchParams(['tab']);
          trackEventByName(tracks.setTab, { tab: 'projects' });
        }}
      />
      {ROLES_THAT_CAN_SEE_FOLDERS.includes(highest_role) && (
        <Tab
          message={messages.folders}
          icon="folder-outline"
          active={tab === 'folders'}
          dataCy="projects-overview-folders-tab"
          onClick={() => {
            if ([null, 'calendar'].includes(tab)) {
              removeSearchParams(PROJECT_PARAMS);
            }

            updateSearchParams({ tab: 'folders' });
            trackEventByName(tracks.setTab, { tab: 'folders' });
          }}
        />
      )}
      {ROLES_THAT_CAN_SEE_SPACES.includes(highest_role) && spacesEnabled && (
        <Tab
          message={messages.spaces}
          icon="spaces"
          active={tab === 'spaces'}
          dataCy="projects-overview-spaces-tab"
          onClick={() => {
            removeSearchParams([...PROJECT_PARAMS, ...FOLDER_PARAMS]);
            updateSearchParams({ tab: 'spaces' });
            trackEventByName(tracks.setTab, { tab: 'spaces' });
          }}
        />
      )}
      <Tab
        message={messages.calendar}
        icon="calendar"
        active={tab === 'calendar'}
        dataCy="projects-overview-calendar-tab"
        onClick={() => {
          if (tab === 'folders') {
            removeSearchParams(FOLDER_PARAMS);
          }

          updateSearchParams({ tab: 'calendar' });
          trackEventByName(tracks.setTab, { tab: 'calendar' });
        }}
      />
      {userIsAdmin && (
        <Tab
          message={messages.arrangeProjects}
          icon="drag-handle"
          active={tab === 'ordering'}
          onClick={() => {
            removeSearchParams([...PROJECT_PARAMS, ...FOLDER_PARAMS]);
            updateSearchParams({ tab: 'ordering' });
            trackEventByName(tracks.setTab, { tab: 'ordering' });
          }}
        />
      )}
    </Box>
  );
};

export default Tabs;
