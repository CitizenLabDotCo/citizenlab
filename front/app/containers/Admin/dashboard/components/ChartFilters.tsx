import React from 'react';
import styled from 'styled-components';

// components
import { Box, Select } from '@citizenlab/cl2-component-library';
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

const ChartFilters = ({
  currentProjectFilter,
  currentGroupFilter,
  currentTopicFilter,
  projectFilterOptions,
  groupFilterOptions,
  topicFilterOptions,
  onProjectFilter,
  onGroupFilter,
  onTopicFilter,
}: Props) => {
  return (
    <Container>
      {projectFilterOptions && onProjectFilter && (
        <Box width="32%">
          <HiddenLabel>
            <FormattedMessage {...messages.hiddenLabelProjectFilter} />
            <Select
              id="projectFilter"
              onChange={onProjectFilter}
              value={currentProjectFilter || ''}
              options={projectFilterOptions}
            />
          </HiddenLabel>
        </Box>
      )}

      {groupFilterOptions && onGroupFilter && (
        <Box width="32%">
          <HiddenLabel>
            <FormattedMessage {...messages.hiddenLabelGroupFilter} />
            <Select
              id="groupFilter"
              onChange={onGroupFilter}
              value={currentGroupFilter || ''}
              options={groupFilterOptions}
            />
          </HiddenLabel>
        </Box>
      )}

      {topicFilterOptions && onTopicFilter && (
        <Box width="32%">
          <HiddenLabel>
            <FormattedMessage {...messages.hiddenLabelTopicFilter} />
            <Select
              id="topicFilter"
              onChange={onTopicFilter}
              value={currentTopicFilter || ''}
              options={topicFilterOptions}
            />
          </HiddenLabel>
        </Box>
      )}
    </Container>
  );
};

export default ChartFilters;
