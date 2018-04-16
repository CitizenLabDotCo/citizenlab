import * as React from 'react';
import { findIndex, isEmpty } from 'lodash';
import { IPhaseData } from 'services/phases';
import { ITopicData } from 'services/topics';
import { IProjectData } from 'services/projects';
import { IIdeaStatusData } from 'services/ideaStatuses';

import { Tab } from 'semantic-ui-react';
import PhasesMenu from './FilterSidebarPhases';
import TopicsMenu from './FilterSidebarTopics';
import ProjectsMenu from './FilterSidebarProjects';
import StatusesMenu from './FilterSidebarStatuses';
import { InjectedIntlProps } from 'react-intl';
import { injectIntl } from 'utils/cl-intl';

import messages from '../../messages';

interface Props {
  project?: IProjectData;
  phases?: IPhaseData[];
  topics?: ITopicData[];
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

  handleTabChange = (_event, data) => {
    const newActiveFilterMenu = data.panes[data.activeIndex].id;
    this.props.onChangeActiveFilterMenu(newActiveFilterMenu);
  }

  tabName = (message: ReactIntl.FormattedMessage.MessageDescriptor, selection) => {
    const title = this.props.intl.formatMessage(message);
    const selectionSign = isEmpty(selection) ? '' : '*';
    return `${title}${selectionSign}`;
  }

  menuItems = {
    phases: () => (
      {
        menuItem: this.tabName(messages.timelineTab, this.props.selectedPhase),
        id: 'phases',
        render: () => (
          <Tab.Pane>
            <PhasesMenu phases={this.props.phases} selectedPhase={this.props.selectedPhase} onChangePhaseFilter={this.props.onChangePhaseFilter} />
          </Tab.Pane>
        )
      }
    ),
    topics: () => (
      {
        menuItem: this.tabName(messages.topicsTab, this.props.selectedTopics),
        id: 'topics',
        render: () => (
          <Tab.Pane>
            <TopicsMenu topics={this.props.topics} selectedTopics={this.props.selectedTopics} onChangeTopicsFilter={this.props.onChangeTopicsFilter} />
          </Tab.Pane>
        )
      }
    ),
    projects: () => (
      {
        menuItem: this.tabName(messages.projectsTab, this.props.selectedProject),
        id: 'projects',
        render: () => (
          <Tab.Pane>
            <ProjectsMenu projects={this.props.projects} selectedProject={this.props.selectedProject} onChangeProjectFilter={this.props.onChangeProjectFilter} />
          </Tab.Pane>
        )
      }
    ),
    statuses: () => (
      {
        menuItem: this.tabName(messages.statusesTab, this.props.selectedStatus),
        id: 'statuses',
        render: () => (
          <Tab.Pane>
            <StatusesMenu statuses={this.props.statuses} selectedStatus={this.props.selectedStatus} onChangeStatusFilter={this.props.onChangeStatusFilter} />
          </Tab.Pane>
        )
      }
    )
  };

  panes = () => {
    return this.props.visibleFilterMenus.map((menuName) => {
      return this.menuItems[menuName]();
    });
  }

  activeIndex = (panes) => {
    const paneIndex = this.props.activeFilterMenu && findIndex(panes as any, { id: this.props.activeFilterMenu });
    if (paneIndex && paneIndex >= 0) {
      return paneIndex;
    } else {
      return 0;
    }
  }

  render() {
    const panes = this.panes();
    return (
      <Tab
        panes={panes}
        onTabChange={this.handleTabChange}
        activeIndex={this.activeIndex(panes)}
      />

    );
  }
}

export default injectIntl(FilterSidebar);
