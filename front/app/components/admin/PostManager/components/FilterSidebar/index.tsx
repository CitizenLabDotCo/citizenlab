import React from 'react';

import {
  IconTooltip,
  Box,
  colors,
  stylingConsts,
} from '@citizenlab/cl2-component-library';
import { isEmpty } from 'lodash-es';
import { useParams } from 'react-router-dom';
import { RouteType } from 'routes';

import { IIdeaStatusData } from 'api/idea_statuses/types';
import useAuthUser from 'api/me/useAuthUser';
import { IPhaseData } from 'api/phases/types';
import { IProjectData } from 'api/projects/types';
import { ITopicData } from 'api/topics/types';

import { ManagerType } from 'components/admin/PostManager';

import { useIntl } from 'utils/cl-intl';
import { isAdmin } from 'utils/permissions/roles';

import messages from '../../messages';

import FilterSidebarPhases from './phases/FilterSidebarPhases';
import FilterSidebarProjects from './projects/FilterSidebarProjects';
import FilterSidebarStatuses from './statuses/FilterSidebarStatuses';
import FilterSidebarTopics from './topics/FilterSidebarTopics';

interface Props {
  phases?: IPhaseData[];
  projects?: IProjectData[];
  statuses: IIdeaStatusData[];
  topics: ITopicData[];
  selectedTopics?: string[] | null;
  selectedPhase: string | undefined;
  selectedProject?: string | null;
  selectedStatus?: string;
  onChangePhaseFilter?: (arg: string | null) => void;
  onChangeTopicsFilter?: (topics: string[]) => void;
  onChangeProjectFilter?: (projects: string[] | undefined) => void;
  onChangeStatusFilter: (arg: string) => void;
  activeFilterMenu: string | null;
  onChangeActiveFilterMenu: (arg: string) => void;
  visibleFilterMenus: string[];
  type: ManagerType;
}

const BORDER = `1px solid ${colors.divider}`;

const FilterSidebar = ({
  onChangeActiveFilterMenu,
  activeFilterMenu,
  phases,
  projects,
  statuses,
  topics,
  selectedTopics,
  selectedPhase,
  selectedProject,
  selectedStatus,
  onChangePhaseFilter,
  onChangeTopicsFilter,
  onChangeProjectFilter,
  onChangeStatusFilter,
  visibleFilterMenus,
  type,
}: Props) => {
  const { projectId } = useParams();
  const { data: authUser } = useAuthUser();
  const { formatMessage } = useIntl();
  const handleItemClick = (id: string) => {
    onChangeActiveFilterMenu(id);
  };

  if (!authUser) return null;

  const getLinkToTagManager = (): RouteType | null => {
    // https://www.notion.so/citizenlab/Customised-tags-don-t-show-up-as-options-to-add-to-input-9c7c39f6af194c8385088878037cd498?pvs=4
    if (
      (type === 'ProjectIdeas' || type === 'ProjectProposals') &&
      typeof projectId === 'string'
    ) {
      return `/admin/projects/${projectId}/settings/tags`;
    } else if (isAdmin(authUser)) {
      // For admins we show the link to the platform-wide tag manager
      return '/admin/settings/topics';
    } else {
      // Don't show the link to the platform-wide tag manager if the user is not an admin.
      // (i.e. project/folder managers that have access to the general input manager at /admin/ideas,
      // but just for their folders/projects).
      return null;
    }
  };

  const tabName = (
    messageKey: 'statusesTab' | 'timelineTab' | 'topicsTab' | 'projectsTab',
    selection: string | string[] | null | undefined,
    key: 'phases' | 'projects' | 'topics' | 'statuses'
  ) => {
    const titleMessage = {
      statusesTab: messages.statusesTab,
      timelineTab: messages.timelineTab,
      topicsTab: messages.topicsTab,
      projectsTab: messages.projectsTab,
    }[messageKey];
    const tooltipMessage = {
      statusesTab: messages.statusesTabTooltipContent,
      timelineTab: messages.timelineTabTooltipText,
      topicsTab: messages.topicsTabTooltipText,
      projectsTab: messages.projectsTabTooltipContent,
    }[messageKey];
    const title = formatMessage(titleMessage);
    const active = activeFilterMenu === key;
    const selectionSign = isEmpty(selection) ? '' : '*';
    return (
      <>
        {title}
        {selectionSign}&nbsp;
        {active ? (
          <IconTooltip
            content={formatMessage(tooltipMessage)}
            icon="info-solid"
            theme="light"
          />
        ) : null}
      </>
    );
  };

  const menuItems = {
    phases: () => ({
      name: tabName('timelineTab', selectedPhase, 'phases'),
      key: 'phases',
      content:
        phases && onChangePhaseFilter ? (
          <FilterSidebarPhases
            phases={phases}
            selectedPhase={selectedPhase}
            onChangePhaseFilter={onChangePhaseFilter}
          />
        ) : null,
    }),
    topics: () => ({
      name: tabName('topicsTab', selectedTopics, 'topics'),
      key: 'topics',
      content: (
        <FilterSidebarTopics
          selectableTopics={topics}
          selectedTopics={selectedTopics}
          onChangeTopicsFilter={onChangeTopicsFilter}
          linkToTagManager={getLinkToTagManager()}
        />
      ),
    }),
    projects: () => ({
      name: tabName('projectsTab', selectedProject, 'projects'),
      key: 'projects',
      content: (
        <FilterSidebarProjects
          projects={projects}
          selectedProject={selectedProject}
          onChangeProjectFilter={onChangeProjectFilter}
        />
      ),
    }),
    statuses: () => ({
      name: tabName('statusesTab', selectedStatus, 'statuses'),
      key: 'statuses',
      content: (
        <FilterSidebarStatuses
          type={type}
          statuses={statuses}
          selectedStatus={selectedStatus}
          onChangeStatusFilter={onChangeStatusFilter}
        />
      ),
    }),
  };

  const filteredMenuItems = () => {
    return visibleFilterMenus.map((menuName) => {
      return menuItems[menuName]();
    });
  };

  const items = filteredMenuItems();
  const selectedItem = items.find((i) => i.key === activeFilterMenu);
  return (
    <>
      <Box
        display="flex"
        flexDirection="row"
        className="intercom-admin-input-manager-filter-sidebar"
      >
        {items.map((item) => {
          const active = activeFilterMenu === item.key;

          return (
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              w="100%"
              as="button"
              key={item.key}
              id={item.key}
              p="12px"
              className={`intercom-admin-input-manager-filter-sidebar-${item.key}`}
              data-cy={`e2e-admin-post-manager-filter-sidebar-${item.key}`}
              {...getBorders(active)}
              onClick={() => {
                handleItemClick(item.key);
              }}
              cursor="pointer"
            >
              {item.name}
            </Box>
          );
        })}
      </Box>
      <Box
        border={BORDER}
        borderRadius={stylingConsts.border}
        p="12px"
        display="flex"
        flexDirection="column"
        alignItems="center"
        w="100%"
      >
        {selectedItem.content}
      </Box>
    </>
  );
};

const getBorders = (active: boolean) => {
  if (!active) return {};

  return {
    borderRadius: stylingConsts.borderRadius,
    borderLeft: BORDER,
    borderTop: BORDER,
    borderRight: BORDER,
  };
};

export default FilterSidebar;
