import * as React from 'react';
import { findIndex } from 'lodash';
import { IPhaseData } from 'services/phases';
import { ITopicData } from 'services/topics';
import { IProjectData } from 'services/projects';

import { Tab } from 'semantic-ui-react';
import PhasesMenu from './FilterSidebarPhases';
import TopicsMenu from './FilterSidebarTopics';
import { InjectedIntlProps } from 'react-intl';
import { FormattedMessage, injectIntl } from 'utils/cl-intl';

import messages from '../../messages';

interface Props {
  project: IProjectData | null;
  phases: IPhaseData[];
  topics: ITopicData[];
  selectedTopics?: string[];
  selectedPhase?: string;
  onChangePhaseFilter?: (string) => void;
  onChangeTopicsFilter?: (topics: string[]) => void;
  activeFilterMenu: string | null;
  onChangeActiveFilterMenu: (string) => void;
  visibleFilterMenus: string[];
}

class FilterSidebar extends React.Component<Props & InjectedIntlProps> {

  handleTabChange = (event, data) => {
    const newActiveFilterMenu = data.panes[data.activeIndex].id;
    this.props.onChangeActiveFilterMenu(newActiveFilterMenu);
  }

  menuItems = {
    phases: () => (
      {
        menuItem: this.props.intl.formatMessage(messages.phasesTab),
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
        menuItem: this.props.intl.formatMessage(messages.topicsTab),
        id: 'topics',
        render: () => (
          <Tab.Pane>
            <TopicsMenu topics={this.props.topics} selectedTopics={this.props.selectedTopics} onChangeTopicsFilter={this.props.onChangeTopicsFilter} />
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

  render() {
    const panes = this.panes();
    const activeIndex = this.props.activeFilterMenu ? findIndex(panes as any, { id: this.props.activeFilterMenu }) : 0;
    return (
      <Tab
        panes={this.panes()}
        onTabChange={this.handleTabChange}
        activeIndex={activeIndex}
      />

    );
  }
}

export default injectIntl(FilterSidebar);
