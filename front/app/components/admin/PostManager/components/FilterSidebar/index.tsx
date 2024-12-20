import React from 'react';

import { Icon, colors } from '@citizenlab/cl2-component-library';
import { isEmpty } from 'lodash-es';
import { useParams } from 'react-router-dom';
import { RouteType } from 'routes';
import { Segment, Menu, Popup } from 'semantic-ui-react';
import styled from 'styled-components';

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

const InfoIcon = styled(Icon)`
  fill: ${colors.teal700};
  width: 20px;
  height: 20px;
  cursor: pointer;

  &:hover {
    fill: #000;
  }
`;

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
  const handleItemClick = (_event, data) => {
    onChangeActiveFilterMenu(data.id);
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
          <Popup
            content={formatMessage(tooltipMessage)}
            trigger={
              <button>
                <InfoIcon name="info-solid" />
              </button>
            }
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
      <Menu
        tabular
        attached="top"
        size="tiny"
        className="intercom-admin-input-manager-filter-sidebar"
      >
        {items.map((item) => (
          <Menu.Item
            key={item.key}
            id={item.key}
            active={activeFilterMenu === item.key}
            onClick={handleItemClick}
            className={`intercom-admin-input-manager-filter-sidebar-${item.key}`}
            data-cy={`e2e-admin-post-manager-filter-sidebar-${item.key}`}
          >
            {item.name}
          </Menu.Item>
        ))}
      </Menu>
      <Segment attached="bottom">{selectedItem.content}</Segment>
    </>
  );
};

export default FilterSidebar;
