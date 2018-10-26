import React from 'react';
import styled from 'styled-components';

// components
import Select from 'components/UI/Select';
import Label from 'components/UI/Label';

// typings
import { IOption } from 'typings';

// i18n
import { injectIntl, FormattedMessage } from 'utils/cl-intl';
import messages from '../../messages';
import { InjectedIntlProps } from 'react-intl';

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

const FilterSelector = styled(Select)``;

interface Props {
  currentProjectFilter: string;
  currentGroupFilter: string;
  currentTopicFilter: string;
  projectFilterOptions: IOption[];
  groupFilterOptions: IOption[];
  topicFilterOptions: IOption[];
  onProjectFilter: (filter: IOption) => void;
  onGroupFilter: (filter: IOption) => void;
  onTopicFilter: (filter: IOption) => void;
}

interface State {}

class ChartFilters extends React.PureComponent<Props & InjectedIntlProps, State> {

  constructor(props: Props & InjectedIntlProps) {
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
      onTopicFilter
    } = this.props;

    return(
      <Container>
        <FilterContainer>
          <Label htmlFor="projectFilter">
            <FormattedMessage {...messages.projectFilterLabel} />
          </Label>
          <FilterSelector
            id="projectFilter"
            onChange={onProjectFilter}
            value={currentProjectFilter}
            options={projectFilterOptions}
            clearable={false}
            borderColor="#EAEAEA"
          />
        </FilterContainer>

        <FilterContainer>
          <Label htmlFor="groupFilter">
            <FormattedMessage {...messages.groupFilterLabel} />
          </Label>
          <FilterSelector
            id="groupFilter"
            onChange={onGroupFilter}
            value={currentGroupFilter}
            options={groupFilterOptions}
            clearable={false}
            borderColor="#EAEAEA"
          />
        </FilterContainer>

        <FilterContainer>
          <Label htmlFor="topicFilter">
            <FormattedMessage {...messages.topicFilterLabel} />
          </Label>
          <FilterSelector
            id="topicFilter"
            onChange={onTopicFilter}
            value={currentTopicFilter}
            options={topicFilterOptions}
            clearable={false}
            borderColor="#EAEAEA"
          />
        </FilterContainer>
      </Container>
    );
  }
}

export default injectIntl<Props>(ChartFilters);
