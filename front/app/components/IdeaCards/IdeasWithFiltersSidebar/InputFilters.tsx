import React from 'react';

import {
  Box,
  Button,
  fontSizes,
  useBreakpoint,
} from '@citizenlab/cl2-component-library';

import { IIdeaQueryParameters } from 'api/ideas/types';
import { IIdeasFilterCounts } from 'api/ideas_filter_counts/types';
import { IdeaSortMethod } from 'api/phases/types';

import SearchInput from 'components/UI/SearchInput';

import { ScreenReaderOnly } from 'utils/a11y';
import { FormattedMessage } from 'utils/cl-intl';
import { isNilOrError, NilOrError } from 'utils/helperUtils';

import messages from '../messages';
import SortingBox from '../shared/Filters/SortingBox';
import StatusFilterBox from '../shared/Filters/StatusFilterBox';
import TopicFilterBox from '../shared/Filters/TopicFilterBox';

export interface Props {
  defaultValue?: string;
  filtersActive: boolean;
  ideasFilterCounts: IIdeasFilterCounts | NilOrError;
  numberOfSearchResults: number;
  selectedIdeaFilters: Partial<IIdeaQueryParameters>;
  onClearFilters: () => void;
  onSearch: (searchTerm: string) => void;
  onChangeStatus: (ideaStatus: string | null) => void;
  onChangeTopics: (topics: string[] | null) => void;
  handleSortOnChange: (sort: IdeaSortMethod) => void;
  phaseId?: string;
}

const InputFilters = ({
  defaultValue,
  filtersActive,
  ideasFilterCounts,
  numberOfSearchResults,
  selectedIdeaFilters,
  phaseId,
  onClearFilters,
  onSearch,
  onChangeStatus,
  onChangeTopics,
  handleSortOnChange,
}: Props) => {
  const isSmallerThanTablet = useBreakpoint('tablet');
  // We have a reset filters button in the top bar of the modal on mobile.
  const showResetFiltersButton = !isSmallerThanTablet;

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
      {!isSmallerThanTablet && (
        // mt is here to ensure search input's label still shows when it's lifted up.
        // Needs to be fixed in the SearchInput component.
        <Box mt="8px" mb="0">
          <SearchInput
            defaultValue={defaultValue}
            onChange={onSearch}
            debounce={1500}
            a11y_numberOfSearchResults={numberOfSearchResults}
          />
        </Box>
      )}
      {showResetFiltersButton && (
        <Button
          buttonStyle="text"
          fontSize={`${fontSizes.s}px`}
          onClick={onClearFilters}
          ml="auto"
          disabled={!filtersActive}
        >
          <FormattedMessage {...messages.resetFilters} />
        </Button>
      )}
      <Box mb="20px">
        <SortingBox handleSortOnChange={handleSortOnChange} phaseId={phaseId} />
      </Box>
      <Box mb="20px">
        <TopicFilterBox
          selectedTopicIds={selectedIdeaFilters.topics}
          selectedIdeaFilters={selectedIdeaFilters}
          onChange={onChangeTopics}
        />
      </Box>
      <StatusFilterBox
        selectedStatusId={selectedIdeaFilters.idea_status}
        selectedIdeaFilters={selectedIdeaFilters}
        onChange={onChangeStatus}
      />
    </>
  );
};

export default InputFilters;
