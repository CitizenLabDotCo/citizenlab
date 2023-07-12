import React from 'react';
import { isEmpty } from 'lodash-es';
import { IPhaseData } from 'api/phases/types';
import { IProjectData } from 'api/projects/types';
import { IIdeaStatusData } from 'api/idea_statuses/types';
import { IInitiativeStatusData } from 'api/initiative_statuses/types';
import { Segment, Menu, Popup } from 'semantic-ui-react';
import PhasesMenu from './FilterSidebarPhases';
import TopicsMenu from './FilterSidebarTopics';
import ProjectsMenu from './FilterSidebarProjects';
import StatusesMenu from './FilterSidebarStatuses';
import messages from '../../messages';
import { Icon } from '@citizenlab/cl2-component-library';
import styled from 'styled-components';
import { colors } from 'utils/styleUtils';
import { ITopicData } from 'api/topics/types';
import { useIntl } from 'utils/cl-intl';
import { ManagerType } from 'components/admin/PostManager';

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
  statuses: IIdeaStatusData[] | IInitiativeStatusData[];
  topics: ITopicData[];
  selectedTopics?: string[] | null;
  selectedPhase?: string | null;
  selectedProject?: string | null;
  selectedStatus?: string | null;
  onChangePhaseFilter?: (arg: string | null) => void;
  onChangeTopicsFilter?: (topics: string[]) => void;
  onChangeProjectFilter?: (projects: string[] | undefined) => void;
  onChangeStatusFilter?: (arg: string) => void;
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
  const { formatMessage } = useIntl();
  const handleItemClick = (_event, data) => {
    onChangeActiveFilterMenu(data.id);
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
      content: (
        <PhasesMenu
          phases={phases}
          selectedPhase={selectedPhase}
          onChangePhaseFilter={onChangePhaseFilter}
        />
      ),
    }),
    topics: () => ({
      name: tabName('topicsTab', selectedTopics, 'topics'),
      key: 'topics',
      content: (
        <TopicsMenu
          selectableTopics={topics}
          selectedTopics={selectedTopics}
          onChangeTopicsFilter={onChangeTopicsFilter}
        />
      ),
    }),
    projects: () => ({
      name: tabName('projectsTab', selectedProject, 'projects'),
      key: 'projects',
      content: (
        <ProjectsMenu
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
        <StatusesMenu
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
