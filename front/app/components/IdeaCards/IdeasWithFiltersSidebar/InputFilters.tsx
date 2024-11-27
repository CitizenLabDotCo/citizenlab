import React from 'react';

import {
  Box,
  colors,
  fontSizes,
  media,
} from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

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

const FiltersSidebarContainer = styled.div`
  position: relative;
`;

const ClearFiltersText = styled.span`
  color: ${colors.textSecondary};
  font-size: ${fontSizes.s}px;
  font-weight: 400;
  line-height: auto;
`;

const ClearFiltersButton = styled.button`
  height: 28px;
  position: absolute;
  top: 54px;
  right: 0px;
  display: flex;
  align-items: center;
  padding: 0;
  margin: 0;
  cursor: pointer;

  &:hover {
    ${ClearFiltersText} {
      color: #000;
    }
  }
`;

const DesktopSearchInput = styled(SearchInput)`
  margin-bottom: 20px;

  ${media.tablet`
    display: none;
  `}
`;

const StyledIdeasStatusFilter = styled(StatusFilterBox)`
  margin-bottom: 0px;
`;

const StyledIdeasTopicsFilter = styled(TopicFilterBox)`
  margin-bottom: 20px;
`;

export interface Props {
  defaultValue?: string;
  className?: string;
  filtersActive: boolean;
  ideasFilterCounts: IIdeasFilterCounts | NilOrError;
  numberOfSearchResults: number;
  selectedIdeaFilters: Partial<IIdeaQueryParameters>;
  onClearFilters: () => void;
  showClearButton?: boolean;
  onSearch: (searchTerm: string) => void;
  onChangeStatus: (ideaStatus: string | null) => void;
  onChangeTopics: (topics: string[] | null) => void;
  handleSortOnChange: (sort: IdeaSortMethod) => void;
  phaseId?: string;
  hideStatusFilter?: boolean;
}

const InputFilters = ({
  defaultValue,
  className,
  filtersActive,
  ideasFilterCounts,
  numberOfSearchResults,
  selectedIdeaFilters,
  phaseId,
  onClearFilters,
  showClearButton = true,
  hideStatusFilter,
  onSearch,
  onChangeStatus,
  onChangeTopics,
  handleSortOnChange,
}: Props) => {
  return (
    <FiltersSidebarContainer className={className}>
      {filtersActive && showClearButton && (
        <ClearFiltersButton onClick={onClearFilters}>
          <ClearFiltersText>
            <FormattedMessage {...messages.resetFilters} />
          </ClearFiltersText>
        </ClearFiltersButton>
      )}

      <ScreenReaderOnly aria-live="polite">
        {!isNilOrError(ideasFilterCounts) && (
          <FormattedMessage
            {...messages.a11y_totalItems}
            values={{ ideasCount: ideasFilterCounts.data.attributes.total }}
          />
        )}
      </ScreenReaderOnly>

      <Box mt="8px" mb="28px">
        <DesktopSearchInput
          defaultValue={defaultValue}
          onChange={onSearch}
          debounce={1500}
          a11y_numberOfSearchResults={numberOfSearchResults}
        />
      </Box>

      <Box mb="20px">
        <SortingBox handleSortOnChange={handleSortOnChange} phaseId={phaseId} />
      </Box>
      <StyledIdeasTopicsFilter
        selectedTopicIds={selectedIdeaFilters.topics}
        selectedIdeaFilters={selectedIdeaFilters}
        onChange={onChangeTopics}
      />
      {!hideStatusFilter && (
        <StyledIdeasStatusFilter
          selectedStatusId={selectedIdeaFilters.idea_status}
          selectedIdeaFilters={selectedIdeaFilters}
          onChange={onChangeStatus}
        />
      )}
    </FiltersSidebarContainer>
  );
};

export default InputFilters;
