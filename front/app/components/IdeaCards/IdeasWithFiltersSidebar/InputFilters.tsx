import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';

import { IIdeaQueryParameters } from 'api/ideas/types';
import { IIdeasFilterCounts } from 'api/ideas_filter_counts/types';
import { IdeaSortMethod } from 'api/phases/types';
import usePhase from 'api/phases/usePhase';

import SearchInput from 'components/UI/SearchInput';

import { ScreenReaderOnly } from 'utils/a11y';
import { FormattedMessage } from 'utils/cl-intl';
import { isNilOrError, NilOrError } from 'utils/helperUtils';

import messages from '../messages';
import SortingBox from '../shared/Filters/SortingBox';
import StatusFilterBox from '../shared/Filters/StatusFilterBox';
import TopicFilterBox from '../shared/Filters/TopicFilterBox';

import ResetFiltersButton from './ResetFiltersButton';

export interface InputFiltersProps {
  defaultValue?: string;
  ideasFilterCounts: IIdeasFilterCounts | NilOrError;
  numberOfSearchResults: number;
  ideaQueryParameters: IIdeaQueryParameters;
  onSearch: (searchTerm: string) => void;
  onChangeStatus: (ideaStatus: string | null) => void;
  onChangeTopics: (topics: string[] | null) => void;
  handleSortOnChange: (sort: IdeaSortMethod) => void;
  phaseId?: string;
  projectId?: string;
  showResetButton?: boolean;
  showStatusFilter?: boolean;
  showSearchField?: boolean;
}

const InputFilters = ({
  defaultValue,
  ideasFilterCounts,
  numberOfSearchResults,
  ideaQueryParameters,
  phaseId,
  projectId,
  showResetButton = true,
  showStatusFilter = true,
  showSearchField = true,
  onSearch,
  onChangeStatus,
  onChangeTopics,
  handleSortOnChange,
}: InputFiltersProps) => {
  const { data: phase } = usePhase(phaseId);
  const participationMethod =
    phase?.data.attributes.participation_method || 'ideation'; // Ideation used as fallback here for All Ideas page.
  const isProposalsOrIdeation =
    participationMethod === 'ideation' || participationMethod === 'proposals';
  const isVoting = participationMethod === 'voting';

  return (
    <>
      <ScreenReaderOnly aria-live="polite">
        {!isNilOrError(ideasFilterCounts) && (
          <FormattedMessage
            {...messages.a11y_totalItems}
            values={{ ideasCount: ideasFilterCounts.data.attributes.total }}
          />
        )}
      </ScreenReaderOnly>
      {showSearchField && (
        // mt is here to ensure search input's label still shows when it's lifted up.
        // Needs to be fixed in the SearchInput component.
        <Box mt="8px" mb="20px">
          <SearchInput
            defaultValue={defaultValue}
            onChange={onSearch}
            debounce={1500}
            a11y_numberOfSearchResults={numberOfSearchResults}
          />
        </Box>
      )}
      {!isVoting && (
        <Box mb="20px">
          <SortingBox
            handleSortOnChange={handleSortOnChange}
            phaseId={phaseId}
          />
        </Box>
      )}
      {projectId && (
        <Box mb="20px">
          <TopicFilterBox
            projectId={projectId}
            selectedTopicIds={ideaQueryParameters.input_topics}
            ideaQueryParameters={ideaQueryParameters}
            onChange={onChangeTopics}
          />
        </Box>
      )}
      {showStatusFilter && isProposalsOrIdeation && (
        <StatusFilterBox
          participationMethod={participationMethod}
          selectedStatusId={ideaQueryParameters.idea_status}
          ideaQueryParameters={ideaQueryParameters}
          onChange={onChangeStatus}
          phase={phase}
        />
      )}
      {showResetButton && (
        <Box mt="8px">
          <ResetFiltersButton ideaQueryParameters={ideaQueryParameters} />
        </Box>
      )}
    </>
  );
};

export default InputFilters;
