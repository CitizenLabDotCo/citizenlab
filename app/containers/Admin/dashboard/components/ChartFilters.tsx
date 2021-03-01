import React, { PureComponent } from 'react';
import styled from 'styled-components';

// components
import { Select } from 'cl2-component-library';
import { HiddenLabel } from 'utils/a11y';

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
  currentProjectFilter?: string | null;
  currentGroupFilter?: string | null;
  currentTopicFilter?: string | null;

  projectFilterOptions?: IOption[] | null;
  groupFilterOptions?: IOption[] | null;
  topicFilterOptions?: IOption[] | null;

  onProjectFilter?: ((filter: IOption) => void) | null;
  onGroupFilter?: ((filter: IOption) => void) | null;
  onTopicFilter?: ((filter: IOption) => void) | null;
}

export default class ChartFilters extends PureComponent<Props> {
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
      onTopicFilter,
    } = this.props;

    return (
      <Container>
        {projectFilterOptions && onProjectFilter && (
          <FilterContainer>
            <HiddenLabel>
              <FormattedMessage {...messages.hiddenLabelProjectFilter} />
              <Select
                id="projectFilter"
                onChange={onProjectFilter}
                value={currentProjectFilter || ''}
                options={projectFilterOptions}
              />
            </HiddenLabel>
          </FilterContainer>
        )}

        {groupFilterOptions && onGroupFilter && (
          <FilterContainer>
            <HiddenLabel>
              <FormattedMessage {...messages.hiddenLabelGroupFilter} />
              <Select
                id="groupFilter"
                onChange={onGroupFilter}
                value={currentGroupFilter || ''}
                options={groupFilterOptions}
              />
            </HiddenLabel>
          </FilterContainer>
        )}

        {topicFilterOptions && onTopicFilter && (
          <FilterContainer>
            <HiddenLabel>
              <FormattedMessage {...messages.hiddenLabelTopicFilter} />
              <Select
                id="topicFilter"
                onChange={onTopicFilter}
                value={currentTopicFilter || ''}
                options={topicFilterOptions}
              />
            </HiddenLabel>
          </FilterContainer>
        )}
      </Container>
    );
  }
}
