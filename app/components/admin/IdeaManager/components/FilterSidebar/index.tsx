import React from 'react';
import { findIndex, isEmpty } from 'lodash-es';
import { IPhaseData } from 'services/phases';
import { ITopicData } from 'services/topics';
import { IProjectData } from 'services/projects';
import { IIdeaStatusData } from 'services/ideaStatuses';
import { Segment, Menu } from 'semantic-ui-react';
import PhasesMenu from './FilterSidebarPhases';
import TopicsMenu from './FilterSidebarTopics';
import ProjectsMenu from './FilterSidebarProjects';
import StatusesMenu from './FilterSidebarStatuses';
import { InjectedIntlProps } from 'react-intl';
import { injectIntl } from 'utils/cl-intl';
import messages from '../../messages';
import { isNilOrError } from 'utils/helperUtils';

interface Props {
  project?: IProjectData;
  phases?: IPhaseData[];
  topics?: (ITopicData | Error)[];
  projects?: IProjectData[];
  statuses: IIdeaStatusData[];
  selectedTopics?: string[];
  selectedPhase?: string;
  selectedProject?: string;
  selectedStatus?: string;
  onChangePhaseFilter?: (string) => void;
  onChangeTopicsFilter?: (topics: string[]) => void;
  onChangeProjectFilter?: (string) => void;
  onChangeStatusFilter?: (string) => void;
  activeFilterMenu: string | null;
  onChangeActiveFilterMenu: (string) => void;
  visibleFilterMenus: string[];
}

class FilterSidebar extends React.Component<Props & InjectedIntlProps> {

  handleItemClick = (_event, data) => {
    this.props.onChangeActiveFilterMenu(data.id);
  }

  tabName = (message: ReactIntl.FormattedMessage.MessageDescriptor, selection) => {
    const title = this.props.intl.formatMessage(message);
    const selectionSign = isEmpty(selection) ? '' : '*';
    return `${title}${selectionSign}`;
  }

  menuItems = {
    phases: () => (
      {
        name: this.tabName(messages.timelineTab, this.props.selectedPhase),
        key: 'phases',
        content: (
          <PhasesMenu phases={this.props.phases} selectedPhase={this.props.selectedPhase} onChangePhaseFilter={this.props.onChangePhaseFilter} />
        )
      }
    ),
    topics: () => (
      {
        name: this.tabName(messages.topicsTab, this.props.selectedTopics),
        key: 'topics',
        content: (
          <TopicsMenu
            topics={!isNilOrError(this.props.topics) ? this.props.topics.filter(topic => !isNilOrError(topic)) as ITopicData[] : []}
            selectedTopics={this.props.selectedTopics}
            onChangeTopicsFilter={this.props.onChangeTopicsFilter}
          />
        )
      }
    ),
    projects: () => (
      {
        name: this.tabName(messages.projectsTab, this.props.selectedProject),
        key: 'projects',
        content: (
          <ProjectsMenu projects={this.props.projects} selectedProject={this.props.selectedProject} onChangeProjectFilter={this.props.onChangeProjectFilter} />
        )
      }
    ),
    statuses: () => (
      {
        name: this.tabName(messages.statusesTab, this.props.selectedStatus),
        key: 'statuses',
        content: (
          <StatusesMenu statuses={this.props.statuses} selectedStatus={this.props.selectedStatus} onChangeStatusFilter={this.props.onChangeStatusFilter} />
        )
      }
    )
  };

  filteredMenuItems = () => {
    return this.props.visibleFilterMenus.map((menuName) => {
      return this.menuItems[menuName]();
    });
  }

  activeIndex = (items) => {
    const paneIndex = this.props.activeFilterMenu && findIndex(items as any, { key: this.props.activeFilterMenu });
    if (paneIndex && paneIndex >= 0) {
      return paneIndex;
    } else {
      return 0;
    }
  }

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
        >
          {items.map((item) => (
            <Menu.Item
              key={item.key}
              id={item.key}
              active={activeFilterMenu === item.key}
              onClick={this.handleItemClick}
            >
              {item.name}
            </Menu.Item>
          ))}
        </Menu>
        <Segment attached="bottom">
          {selectedItem.content}
        </Segment>
      </>
    );
  }
}

export default injectIntl(FilterSidebar);
