import React from 'react';

// components
import StatusFilterBox from '../shared/Filters/StatusFilterBox';
import TopicFilterBox from '../shared/Filters/TopicFilterBox';
import { ScreenReaderOnly } from 'utils/a11y';
import SearchInput from 'components/UI/SearchInput';

// styling
import styled from 'styled-components';
import { colors, fontSizes, media } from 'utils/styleUtils';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from '../messages';
import { IQueryParameters } from 'api/ideas/types';

// utils
import { isNilOrError, NilOrError } from 'utils/helperUtils';
import { IIdeasFilterCounts } from 'services/ideas';

const FiltersSidebarContainer = styled.div`
  position: relative;
`;

const ClearFiltersText = styled.span`
  color: ${colors.textSecondary};
  font-size: ${fontSizes.base}px;
  font-weight: 400;
  line-height: auto;
`;

const ClearFiltersButton = styled.button`
  height: 32px;
  position: absolute;
  top: -48px;
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
  margin-bottom: 20px;
`;

const StyledIdeasTopicsFilter = styled(TopicFilterBox)`
  margin-bottom: 0px;
`;

export interface Props {
  className?: string;
  filtersActive: boolean;
  ideasFilterCounts: IIdeasFilterCounts | NilOrError;
  numberOfSearchResults: number;
  selectedIdeaFilters: Partial<IQueryParameters>;
  onClearFilters: () => void;
  onSearch: (searchTerm: string) => void;
  onChangeStatus: (ideaStatus: string | null) => void;
  onChangeTopics: (topics: string[] | null) => void;
}

const FiltersSideBar = ({
  className,
  filtersActive,
  ideasFilterCounts,
  numberOfSearchResults,
  selectedIdeaFilters,
  onClearFilters,
  onSearch,
  onChangeStatus,
  onChangeTopics,
}: Props) => {
  return (
    <FiltersSidebarContainer className={className}>
      {filtersActive && (
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

      <DesktopSearchInput
        onChange={onSearch}
        debounce={1500}
        a11y_numberOfSearchResults={numberOfSearchResults}
      />
      <StyledIdeasStatusFilter
        selectedStatusId={selectedIdeaFilters.idea_status}
        selectedIdeaFilters={selectedIdeaFilters}
        onChange={onChangeStatus}
      />
      <StyledIdeasTopicsFilter
        selectedTopicIds={selectedIdeaFilters.topics}
        onChange={onChangeTopics}
      />
    </FiltersSidebarContainer>
  );
};

export default FiltersSideBar;
