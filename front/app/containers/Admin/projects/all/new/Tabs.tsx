import React from 'react';

import {
  Box,
  Button,
  colors,
  IconNames,
} from '@citizenlab/cl2-component-library';
import { useSearchParams } from 'react-router-dom';

import useAuthUser from 'api/me/useAuthUser';

import NewLabel from 'components/UI/NewLabel';

import { trackEventByName } from 'utils/analytics';
import { MessageDescriptor, useIntl } from 'utils/cl-intl';
import { removeSearchParams } from 'utils/cl-router/removeSearchParams';
import { updateSearchParams } from 'utils/cl-router/updateSearchParams';
import { isAdmin } from 'utils/permissions/roles';

import { Parameter, PARAMS as PROJECT_PARAMS } from './_shared/params';
import messages from './messages';
import tracks from './tracks';

const FOLDER_PARAMS: Parameter[] = ['status', 'managers', 'search'];

interface TabProps {
  message: MessageDescriptor;
  active: boolean;
  icon: IconNames;
  onClick: () => void;
}

const Tab = ({ message, active, icon, onClick }: TabProps) => {
  const { formatMessage } = useIntl();

  return (
    <Box
      borderBottom={active ? `2px solid ${colors.primary}` : undefined}
      pb="4px"
      mr="20px"
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

const Tabs = () => {
  const [searchParams] = useSearchParams();
  const tab = searchParams.get('tab');
  const { data: user } = useAuthUser();
  const { formatMessage } = useIntl();
  if (!user) return null;

  const userIsAdmin = isAdmin(user);

  const { highest_role } = user.data.attributes;

  return (
    <Box as="nav" display="flex" w="100%" mt="12px">
      <Tab
        message={messages.projects}
        icon="projects"
        active={tab === null}
        onClick={() => {
          if (tab === 'folders') {
            removeSearchParams(FOLDER_PARAMS);
          }

          removeSearchParams(['tab']);
          trackEventByName(tracks.setTab, { tab: 'projects' });
        }}
      />
      {highest_role !== 'project_moderator' && (
        <Tab
          message={messages.folders}
          icon="folder-outline"
          active={tab === 'folders'}
          onClick={() => {
            if ([null, 'calendar'].includes(tab)) {
              removeSearchParams(PROJECT_PARAMS);
            }

            updateSearchParams({ tab: 'folders' });
            trackEventByName(tracks.setTab, { tab: 'folders' });
          }}
        />
      )}
      <Box
        borderBottom={
          tab === 'calendar' ? `2px solid ${colors.primary}` : undefined
        }
        pb="4px"
        mr="20px"
        display="flex"
        alignItems="center"
      >
        <Button
          buttonStyle="text"
          p="0"
          m="0"
          icon="calendar"
          iconSize="16px"
          textColor={tab === 'calendar' ? colors.textPrimary : undefined}
          iconColor={tab === 'calendar' ? colors.textPrimary : undefined}
          onClick={() => {
            if (tab === 'folders') {
              removeSearchParams(FOLDER_PARAMS);
            }

            updateSearchParams({ tab: 'calendar' });
            trackEventByName(tracks.setTab, { tab: 'calendar' });
          }}
        >
          {formatMessage(messages.calendar)}
        </Button>
        <NewLabel ml="4px" />
      </Box>
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
