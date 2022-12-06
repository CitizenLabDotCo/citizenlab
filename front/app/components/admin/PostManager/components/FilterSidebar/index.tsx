import React from 'react';
import { WrappedComponentProps } from 'react-intl';
import { Segment, Menu, Popup } from 'semantic-ui-react';
import { Icon } from '@citizenlab/cl2-component-library';
import { isEmpty } from 'lodash-es';
import { IIdeaStatusData } from 'services/ideaStatuses';
import { IInitiativeStatusData } from 'services/initiativeStatuses';
import { IPhaseData } from 'services/phases';
import { IProjectData } from 'services/projects';
import { ITopicData } from 'services/topics';
import { injectIntl } from 'utils/cl-intl';
import { colors } from 'utils/styleUtils';
import styled from 'styled-components';
import messages from '../../messages';
import PhasesMenu from './FilterSidebarPhases';
import ProjectsMenu from './FilterSidebarProjects';
import StatusesMenu from './FilterSidebarStatuses';
import TopicsMenu from './FilterSidebarTopics';

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
  onChangePhaseFilter?: (arg: string) => void;
  onChangeTopicsFilter?: (topics: string[]) => void;
  onChangeProjectFilter?: (projects: string[] | undefined) => void;
  onChangeStatusFilter?: (arg: string) => void;
  activeFilterMenu: string | null;
  onChangeActiveFilterMenu: (arg: string) => void;
  visibleFilterMenus: string[];
}

class FilterSidebar extends React.PureComponent<Props & WrappedComponentProps> {
  handleItemClick = (_event, data) => {
    this.props.onChangeActiveFilterMenu(data.id);
  };

  tabName = (
    messageKey: 'statusesTab' | 'timelineTab' | 'topicsTab' | 'projectsTab',
    selection,
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
    const title = this.props.intl.formatMessage(titleMessage);
    const active = this.props.activeFilterMenu === key;
    const selectionSign = isEmpty(selection) ? '' : '*';
    return (
      <>
        {title}
        {selectionSign}&nbsp;
        {active ? (
          <Popup
            content={this.props.intl.formatMessage(tooltipMessage)}
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

  menuItems = {
    phases: () => ({
      name: this.tabName('timelineTab', this.props.selectedPhase, 'phases'),
      key: 'phases',
      content: (
        <PhasesMenu
          phases={this.props.phases}
          selectedPhase={this.props.selectedPhase}
          onChangePhaseFilter={this.props.onChangePhaseFilter}
        />
      ),
    }),
    topics: () => ({
      name: this.tabName('topicsTab', this.props.selectedTopics, 'topics'),
      key: 'topics',
      content: (
        <TopicsMenu
          selectableTopics={this.props.topics}
          selectedTopics={this.props.selectedTopics}
          onChangeTopicsFilter={this.props.onChangeTopicsFilter}
        />
      ),
    }),
    projects: () => ({
      name: this.tabName('projectsTab', this.props.selectedProject, 'projects'),
      key: 'projects',
      content: (
        <ProjectsMenu
          projects={this.props.projects}
          selectedProject={this.props.selectedProject}
          onChangeProjectFilter={this.props.onChangeProjectFilter}
        />
      ),
    }),
    statuses: () => ({
      name: this.tabName('statusesTab', this.props.selectedStatus, 'statuses'),
      key: 'statuses',
      content: (
        <StatusesMenu
          statuses={this.props.statuses}
          selectedStatus={this.props.selectedStatus}
          onChangeStatusFilter={this.props.onChangeStatusFilter}
        />
      ),
    }),
  };

  filteredMenuItems = () => {
    return this.props.visibleFilterMenus.map((menuName) => {
      return this.menuItems[menuName]();
    });
  };

  render() {
    const { activeFilterMenu } = this.props;
    const items = this.filteredMenuItems();
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
              onClick={this.handleItemClick}
              className={`intercom-admin-input-manager-filter-sidebar-${item.key}`}
            >
              {item.name}
            </Menu.Item>
          ))}
        </Menu>
        <Segment attached="bottom">{selectedItem.content}</Segment>
      </>
    );
  }
}

export default injectIntl(FilterSidebar);
