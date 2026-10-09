import React from 'react';

import {
  Box,
  Button,
  colors,
  fontSizes,
  IconNames,
} from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

import useAuthUser from 'api/me/useAuthUser';
import { HighestRole } from 'api/users/types';

import useFeatureFlag from 'hooks/useFeatureFlag';

import NewLabel from 'components/UI/NewLabel';

import { trackEventByName } from 'utils/analytics';
import { MessageDescriptor, useIntl } from 'utils/cl-intl';
import { removeSearchParams } from 'utils/cl-router/removeSearchParams';
import { updateSearchParams } from 'utils/cl-router/updateSearchParams';
import { isAdmin } from 'utils/permissions/roles';
import { useSearch } from 'utils/router';

import { countActiveFilters } from './_shared/activeFilters';
import {
  Parameter,
  PARAMS as PROJECT_PARAMS,
  useParams,
} from './_shared/params';
import messages from './messages';
import tracks from './tracks';

const FOLDER_PARAMS: Parameter[] = [
  'status',
  'managers',
  'search',
  'space_ids',
];

const FilterCountBadge = styled.span`
  padding: 0 6px;
  height: 16px;
  font-size: ${fontSizes.xs}px;
  font-weight: 500;
  border-radius: 3px;
  margin-left: 6px;
  display: flex;
  align-items: center;
  white-space: nowrap;
  color: ${colors.white};
  background: ${colors.primary};
`;

interface TabProps {
  message: MessageDescriptor;
  active: boolean;
  icon: IconNames;
  dataCy?: string;
  activeFilterCount?: number;
  onClick: () => void;
}

const Tab = ({
  message,
  active,
  icon,
  dataCy,
  activeFilterCount = 0,
  onClick,
}: TabProps) => {
  const { formatMessage } = useIntl();

  return (
    <Box
      display="flex"
      alignItems="center"
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
      {activeFilterCount > 0 && (
        <FilterCountBadge data-cy="projects-overview-active-filter-count">
          {formatMessage(messages.filterCount, { count: activeFilterCount })}
        </FilterCountBadge>
      )}
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

// Spaces shipped in August 2026. Stop flagging the tab as new six months on.
const SPACES_NEW_LABEL_EXPIRY = new Date('2027-02-10');

const Tabs = () => {
  const searchParams = useSearch({
    from: '/$locale/admin/projects/',
  });
  const tab = searchParams.tab;
  const params = useParams();
  const { data: user } = useAuthUser();
  const spacesEnabled = useFeatureFlag({ name: 'spaces' });

  if (!user) return null;

  const userIsAdmin = isAdmin(user);
  const activeFilterCount = countActiveFilters(params, tab);

  const { highest_role } = user.data.attributes;
  if (!highest_role) return null;

  return (
    <Box
      as="nav"
      display="flex"
      alignItems="center"
      w="100%"
      mt="12px"
      className="intercom-product-tour-project-page-tabs"
    >
      <Tab
        message={messages.projects}
        icon="projects"
        active={tab === undefined}
        activeFilterCount={tab === undefined ? activeFilterCount : 0}
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
          activeFilterCount={tab === 'folders' ? activeFilterCount : 0}
          dataCy="projects-overview-folders-tab"
          onClick={() => {
            if (tab === undefined || tab === 'calendar') {
              removeSearchParams(PROJECT_PARAMS);
            }

            updateSearchParams({ tab: 'folders' });
            trackEventByName(tracks.setTab, { tab: 'folders' });
          }}
        />
      )}
      {ROLES_THAT_CAN_SEE_SPACES.includes(highest_role) && spacesEnabled && (
        <>
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
          <NewLabel
            expiryDate={SPACES_NEW_LABEL_EXPIRY}
            ml="-12px"
            mt="-8px"
            mr="20px"
          />
        </>
      )}
      <Tab
        message={messages.calendar}
        icon="calendar"
        active={tab === 'calendar'}
        activeFilterCount={tab === 'calendar' ? activeFilterCount : 0}
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
