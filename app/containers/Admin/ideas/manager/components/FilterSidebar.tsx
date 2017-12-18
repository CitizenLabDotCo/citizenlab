import * as React from 'react';
import { findIndex } from 'lodash';
import { IPhaseData } from 'services/phases';
import { ITopicData } from 'services/topics';
import { IProjectData } from 'services/projects';

import { Tab } from 'semantic-ui-react';
import PhasesMenu from './FilterSidebarPhases';
import TopicsMenu from './FilterSidebarTopics';

interface Props {
  project: IProjectData | null;
  phases: IPhaseData[];
  topics: ITopicData[];
  selectedTopics?: string[];
  selectedPhase?: string;
  onChangePhaseFilter?: (string) => void;
  onChangeTopicsFilter?: (topics: string[]) => void;
  filterMode: string;
  onChangeFilterMode: (string) => void;
}

export default class FilterSidebar extends React.Component<Props> {

  handleTabChange = (event, data) => {
    const newFilterMode = data.panes[data.activeIndex].id;
    this.props.onChangeFilterMode(newFilterMode);
  }

  panes = () => (
    [
      {
        menuItem: 'Phases',
        id: 'phases',
        render: () => (
          <Tab.Pane>
            <PhasesMenu phases={this.props.phases} selectedPhase={this.props.selectedPhase} onChangePhaseFilter={this.props.onChangePhaseFilter}/>
          </Tab.Pane>
        )
      },
      {
        menuItem: 'Topics',
        id: 'topics',
        render: () => (
          <Tab.Pane>
            <TopicsMenu topics={this.props.topics} selectedTopics={this.props.selectedTopics} onChangeTopicsFilter={this.props.onChangeTopicsFilter} />
          </Tab.Pane>
        )
      },
    ]
  )
  render() {
    const panes = this.panes();
    const activeIndex = findIndex(panes, { id: this.props.filterMode });
    return (
      <Tab
        panes={this.panes()}
        onTabChange={this.handleTabChange}
        activeIndex={activeIndex}
      />

    );
  }
}
