import React, { PureComponent } from 'react';
import styled from 'styled-components';

// components
import Select from 'components/UI/Select';
import { HiddenLabel } from 'utils/accessibility';

// typings
import { IOption } from 'typings';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from '../messages';

const Container = styled.div`
  display: flex;
  width: 100%;
  justify-content: space-between;
`;

const FilterContainer = styled.div`
  width: 32%;
`;

interface Props {
  configuration: {
    showProjectFilter: boolean;
    showGroupFilter: boolean;
    showTopicFilter: boolean;
  };
  filters: {
    currentProjectFilter: string | null;
    currentGroupFilter: string | null;
    currentTopicFilter: string | null;
  };
  filterOptions: {
    projectFilterOptions: IOption[] | null;
    groupFilterOptions: IOption[] | null;
    topicFilterOptions: IOption[] | null;
  };
  onFilter: {
    onProjectFilter: ((filter: IOption) => void) | null;
    onGroupFilter: ((filter: IOption) => void) | null;
    onTopicFilter: ((filter: IOption) => void) | null;
  };
}

export default class ChartFilters extends PureComponent<Props> {
  render() {
    const {
      configuration: { showProjectFilter, showGroupFilter, showTopicFilter },
      filters: { currentProjectFilter, currentGroupFilter, currentTopicFilter },
      filterOptions: { projectFilterOptions, groupFilterOptions, topicFilterOptions },
      onFilter: { onProjectFilter, onGroupFilter, onTopicFilter }
    } = this.props;

    return (
      <Container>
        {showProjectFilter && onProjectFilter &&
          <FilterContainer>
            <HiddenLabel>
              <FormattedMessage className="label-text" {...messages.hiddenLabelProjectFilter} />
              <Select
                id="projectFilter"
                onChange={onProjectFilter}
                value={currentProjectFilter || ''}
                options={projectFilterOptions}
                clearable={false}
                borderColor="#EAEAEA"
              />
            </HiddenLabel>
          </FilterContainer>
        }

        {showGroupFilter && onGroupFilter &&
          <FilterContainer>
            <HiddenLabel>
              <FormattedMessage {...messages.hiddenLabelGroupFilter} />
              <Select
                id="groupFilter"
                onChange={onGroupFilter}
                value={currentGroupFilter || ''}
                options={groupFilterOptions}
                clearable={false}
                borderColor="#EAEAEA"
              />
            </HiddenLabel >
          </FilterContainer>
        }

        {showTopicFilter && onTopicFilter &&
          <FilterContainer>
            <HiddenLabel>
              <FormattedMessage {...messages.hiddenLabelTopicFilter} />
              <Select
                id="topicFilter"
                onChange={onTopicFilter}
                value={currentTopicFilter || ''}
                options={topicFilterOptions}
                clearable={false}
                borderColor="#EAEAEA"
              />
            </HiddenLabel>
          </FilterContainer>
        }
      </Container>
    );
  }
}
