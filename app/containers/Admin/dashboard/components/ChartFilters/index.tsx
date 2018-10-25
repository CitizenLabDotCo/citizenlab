import React from 'react';
import styled from 'styled-components';

// components
import Select from 'components/UI/Select';
import FilterSelector from './FilterSelector';
import Label from 'components/UI/Label';

// typings
import { IOption } from 'typings';

// i18n
import { injectIntl, FormattedMessage } from 'utils/cl-intl';
import { getPageLink } from 'services/pageLink';

const Container = styled.div`
  display: flex;
  width: 100%;

  & > * {
    flex: 1;
  }
`;

const FilterContainer = styled.div`
  margin-right: 10px;

  &:last-of-type {
    margin-right: 0;
  }
`;

const FilterSelector2 = styled(Select)`

`;

interface Props {
  currentProjectFilter: string;
  currentGroupFilter: string;
  currentTopicFilter: string;
  projectFilterOptions: IOption[];
  groupFilterOptions: string[];
  topicFilterOptions: string[];
  onProjectFilter: (filter: IOption) => void;
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
        <FilterContainer>
          <Label htmlFor="projectFilter">
          Projects
            {/* <FormattedMessage {...messages.projectFilterLabel} /> */}
          </Label>
          <FilterSelector2
            id="projectFilter"
            onChange={onProjectFilter}
            value={currentProjectFilter}
            options={projectFilterOptions}
            clearable={false}
            borderColor="#EAEAEA"
          />
        </FilterContainer>

        <FilterSelector2
          onChange={onProjectFilter}
          value={currentProjectFilter}
          options={projectFilterOptions}
          clearable={false}
        />
        <FilterSelector2
          onChange={onProjectFilter}
          value={currentProjectFilter}
          options={projectFilterOptions}
          clearable={false}
        />
        {/* <FilterSelector
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
        /> */}
      </Container>
    );
  }

}
