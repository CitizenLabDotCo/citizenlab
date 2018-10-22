import React from 'react';
import styled from 'styled-components';

// components
import FilterSelector from './FilterSelector';

const Container = styled.div`
  display: flex;
`;

interface Props {
  currentProjectFilter: string;
  currentGroupFilter: string;
  currentTopicFilter: string;
  projectFilterOptions: string[];
  groupFilterOptions: string[];
  topicFilterOptions: string[];
  onProjectFilter: (filter: string) => void;
  onGroupFilter: (filter: string) => void;
  onTopicFilter: (filter: string) => void;
}

interface State {}

export default class ChartFilters extends React.PureComponent<Props, State> {

  constructor(props: Props) {
    super(props);
  }

  render() {
    const {
      currentProjectFilter,
      currentGroupFilter,
      currentTopicFilter,
      projectFilterOptions,
      groupFilterOptions,
      topicFilterOptions,
      onProjectFilter,
      onGroupFilter,
      onTopicFilter } = this.props;
    return(
      <Container>
        <FilterSelector
          filterOptions={projectFilterOptions}
          currentFilter={currentProjectFilter}
          onFilter={onProjectFilter}
        />
        <FilterSelector
          filterOptions={groupFilterOptions}
          currentFilter={currentGroupFilter}
          onFilter={onGroupFilter}
        />
        <FilterSelector
          filterOptions={topicFilterOptions}
          currentFilter={currentTopicFilter}
          onFilter={onTopicFilter}
        />
      </Container>
    );
  }

}
