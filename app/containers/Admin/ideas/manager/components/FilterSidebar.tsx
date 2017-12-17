import * as React from 'react';
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
}

export default class FilterSidebar extends React.Component<Props> {

  panes = () => (
    [
      { menuItem: 'Phases', render: () => <Tab.Pane><PhasesMenu phases={this.props.phases} selectedPhase={this.props.selectedPhase} onChangePhaseFilter={this.props.onChangePhaseFilter}/></Tab.Pane> },
      { menuItem: 'Topics', render: () => <Tab.Pane><TopicsMenu topics={this.props.topics} selectedTopics={this.props.selectedTopics} onChangeTopicsFilter={this.props.onChangeTopicsFilter} /></Tab.Pane> },
    ]
  )
  render() {
    return (
      <Tab panes={this.panes()} />
    );
  }
}
