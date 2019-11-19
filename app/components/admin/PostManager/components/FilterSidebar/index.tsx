import React from 'react';
import { isEmpty } from 'lodash-es';
import { IPhaseData } from 'services/phases';
import { IProjectData } from 'services/projects';
import { IIdeaStatusData } from 'services/ideaStatuses';
import { Segment, Menu, Popup } from 'semantic-ui-react';
import PhasesMenu from './FilterSidebarPhases';
import TopicsMenu from './FilterSidebarTopics';
import ProjectsMenu from './FilterSidebarProjects';
import StatusesMenu from './FilterSidebarStatuses';
import { InjectedIntlProps } from 'react-intl';
import { injectIntl } from 'utils/cl-intl';
import messages from '../../messages';
import Icon from 'components/UI/Icon';
import styled from 'styled-components';
import { colors } from 'utils/styleUtils';

const InfoIcon = styled(Icon)`
  fill: ${colors.clBlueDarker};
  width: 16px;
  height: 16px;
  cursor: pointer;

  &:hover {
    fill: #000;
  }
`;

interface Props {
  phases?: IPhaseData[];
  projects?: IProjectData[];
  statuses: IIdeaStatusData[];
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

class FilterSidebar extends React.PureComponent<Props & InjectedIntlProps> {
  handleItemClick = (_event, data) => {
    this.props.onChangeActiveFilterMenu(data.id);
  }

  tabName = (message: string, selection, key) => {
    const title = this.props.intl.formatMessage(messages[message]);
    const active = this.props.activeFilterMenu === key;
    const selectionSign = isEmpty(selection) ? '' : '*';
    return (
      <>
        {title}{selectionSign}&nbsp;
        {active ? <Popup content={this.props.intl.formatMessage(messages[`${message}Tooltip`])} trigger={<button><InfoIcon name="info3" /></button>} /> : null}
      </>
    );
  }

  menuItems = {
    phases: () => (
      {
        name: this.tabName('timelineTab', this.props.selectedPhase, 'phases'),
        key: 'phases',
        content: (
          <PhasesMenu
            phases={this.props.phases}
            selectedPhase={this.props.selectedPhase}
            onChangePhaseFilter={this.props.onChangePhaseFilter}
          />
        )
      }
    ),
    topics: () => (
      {
        name: this.tabName('topicsTab', this.props.selectedTopics, 'topics'),
        key: 'topics',
        content: (
          <TopicsMenu
            selectedTopics={this.props.selectedTopics}
            onChangeTopicsFilter={this.props.onChangeTopicsFilter}
          />
        )
      }
    ),
    projects: () => (
      {
        name: this.tabName('projectsTab', this.props.selectedProject, 'projects'),
        key: 'projects',
        content: (
          <ProjectsMenu
            projects={this.props.projects}
            selectedProject={this.props.selectedProject}
            onChangeProjectFilter={this.props.onChangeProjectFilter}
          />
        )
      }
    ),
    statuses: () => (
      {
        name: this.tabName('statusesTab', this.props.selectedStatus, 'statuses'),
        key: 'statuses',
        content: (
          <StatusesMenu
            statuses={this.props.statuses}
            selectedStatus={this.props.selectedStatus}
            onChangeStatusFilter={this.props.onChangeStatusFilter}
          />
        )
      }
    )
  };

  filteredMenuItems = () => {
    return this.props.visibleFilterMenus.map((menuName) => {
      return this.menuItems[menuName]();
    });
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
