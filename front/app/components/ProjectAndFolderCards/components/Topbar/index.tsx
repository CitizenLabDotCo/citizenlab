import React, { useState, useEffect } from 'react';

import {
  useBreakpoint,
  media,
  isRtl,
  fontSizes,
  colors,
  Title,
} from '@citizenlab/cl2-component-library';
import { useSearch } from 'utils/router';
import styled from 'styled-components';
import { Multiloc } from 'typings';

import { IStatusCountsAll } from 'api/admin_publications_status_counts/types';
import useAppConfiguration from 'api/app_configuration/useAppConfiguration';
import useAreas from 'api/areas/useAreas';
import useGlobalTopics from 'api/global_topics/useGlobalTopics';

import useLocalize from 'hooks/useLocalize';

import SearchInput from 'components/UI/SearchInput';

import { ScreenReaderOnly } from 'utils/a11y';
import { useIntl } from 'utils/cl-intl';
import clHistory from 'utils/cl-router/history';
import { isNilOrError } from 'utils/helperUtils';

import { PublicationTab } from '../..';

import messages from './messages';
import SelectAreas from './SelectAreas';
import SelectTopics from './SelectTopics';
import { getShowFilters, getShowFiltersLabel } from './show';
import Tabs from './Tabs';

const Container = styled.div<{ showFilters: boolean }>`
  width: 100%;
  display: flex;
  justify-content: ${({ showFilters }) =>
    showFilters ? 'space-between' : 'start'};
  border-bottom: 1px solid #d1d1d1;

  ${isRtl`
    flex-direction: row-reverse;
  `}
`;

const DesktopFilters = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-end;

  display: flex;
  align-items: center;

  border-bottom: 3px solid transparent;

  height: 68px;

  ${media.phone`
    height: 52px;
  `}

  ${isRtl`
    justify-content: flex-start;
  `}
`;

const StyledSelectTopics = styled(SelectTopics)`
  margin-right: 13px !important;
`;

const StyledSearchInput = styled(SearchInput)`
  margin-bottom: 20px;
`;

const FiltersLabel = styled.div`
  margin-right: 16px;
  height: 100%;
  display: flex;
  align-items: center;
  font-size: ${fontSizes.base}px;
  color: ${colors.textSecondary};
  transform: translateY(-1px);
`;

const MobileFilters = styled.div`
  display: block;
  margin-top: 20px;
`;

interface Props {
  className?: string;
  currentTab: PublicationTab;
  statusCounts: IStatusCountsAll;
  noAdminPublicationsAtAll: boolean;
  availableTabs: PublicationTab[];
  showTitle: boolean;
  showSearch?: boolean;
  showFilters: boolean;
  hasPublications: boolean;
  onChangeTopics: (topics: string[]) => void;
  onChangeAreas: (areas: string[]) => void;
  onChangeTab: (tab: PublicationTab) => void;
  onChangeSearch: (search: string | null) => void;
  currentlyWorkingOnText?: Multiloc;
  searchTerm?: string | null;
}

const Header = ({
  className,
  currentTab,
  statusCounts,
  noAdminPublicationsAtAll,
  availableTabs,
  showTitle,
  showSearch,
  showFilters,
  hasPublications,
  onChangeTopics,
  onChangeAreas,
  onChangeTab,
  onChangeSearch,
  currentlyWorkingOnText,
  searchTerm,
}: Props) => {
  const { data: appConfiguration } = useAppConfiguration();
  const isSmallerThanPhone = useBreakpoint('phone');
  const isSmallerThanTablet = useBreakpoint('tablet');
  const { data: topics } = useGlobalTopics({ forHomepageFilter: true });
  const { data: areas } = useAreas({ forHomepageFilter: true });
  const localize = useLocalize();
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [selectedAreas, setSelectedAreas] = useState<string[]>([]);
  const [searchParams] = useSearch({ strict: false });
  const [searchInputRef, setSearchInputRef] = useState<HTMLInputElement | null>(
    null
  );
  const { formatMessage } = useIntl();

  useEffect(() => {
    const focusSearch = searchParams.get('focusSearch');
    // the value from the query param is a string, not a boolean
    if (focusSearch === 'true' && searchInputRef) {
      searchInputRef.focus();
      clHistory.replace('/projects');
    }
  }, [searchParams, searchInputRef]);

  const handleOnSearchChange = React.useCallback(
    (search: string | null) => {
      onChangeSearch(search);
    },
    [onChangeSearch]
  );

  if (isNilOrError(appConfiguration)) return null;

  const fallback = formatMessage(messages.currentlyWorkingOn);
  const currentlyWorkingOn = localize(currentlyWorkingOnText, {
    fallback,
  });

  const showTabs = !noAdminPublicationsAtAll;
  const displayFilters =
    showFilters &&
    getShowFilters({
      isSmallerThanPhone,
      hasPublications,
      statusCounts,
      selectedTopics,
      selectedAreas,
    });
  const showFiltersLabel = getShowFiltersLabel(
    topics?.data,
    areas?.data,
    isSmallerThanTablet
  );

  const handleOnChangeTopics = (selectedTopics: string[]) => {
    setSelectedTopics(selectedTopics);
    onChangeTopics(selectedTopics);
  };

  const handleOnChangeAreas = (selectedAreas: string[]) => {
    setSelectedAreas(selectedAreas);
    onChangeAreas(selectedAreas);
  };

  const handleSetSearchInputRef = (ref: HTMLInputElement | null) => {
    setSearchInputRef(ref);
  };

  const shouldShowAreaAndTagFilters = !isSmallerThanPhone && displayFilters;

  const filtersAppliedCount =
    (selectedTopics.length || 0) + (selectedAreas.length || 0);

  return (
    <div className={className}>
      {showTitle ? (
        <Title
          variant="h2"
          data-testid="currently-working-on-text"
          color="tenantText"
          m="0"
          mb={isSmallerThanPhone ? (hasPublications ? '36px' : '20px') : '20px'}
          ml={isSmallerThanPhone ? '4px' : '0'}
        >
          {currentlyWorkingOn}
        </Title>
      ) : (
        <ScreenReaderOnly>{currentlyWorkingOn}</ScreenReaderOnly>
      )}

      {showSearch && (
        <StyledSearchInput
          onChange={handleOnSearchChange}
          a11y_numberOfSearchResults={statusCounts.all}
          a11y_searchQuery={searchTerm ?? ''}
          a11y_filtersAppliedCount={filtersAppliedCount}
          setInputRef={handleSetSearchInputRef}
        />
      )}

      <Container showFilters={shouldShowAreaAndTagFilters}>
        {showTabs && (
          <Tabs
            currentTab={currentTab}
            statusCounts={statusCounts}
            availableTabs={availableTabs}
            onChangeTab={onChangeTab}
          />
        )}

        {shouldShowAreaAndTagFilters && (
          <DesktopFilters>
            {showFiltersLabel && (
              <FiltersLabel>{formatMessage(messages.filterBy)}</FiltersLabel>
            )}
            <StyledSelectTopics
              selectedTopics={selectedTopics}
              onChangeTopics={handleOnChangeTopics}
            />
            <SelectAreas
              selectedAreas={selectedAreas}
              onChangeAreas={handleOnChangeAreas}
            />
          </DesktopFilters>
        )}
      </Container>

      {isSmallerThanPhone && displayFilters && (
        <MobileFilters>
          <StyledSelectTopics
            selectedTopics={selectedTopics}
            onChangeTopics={handleOnChangeTopics}
          />
          <SelectAreas
            selectedAreas={selectedAreas}
            onChangeAreas={handleOnChangeAreas}
          />
        </MobileFilters>
      )}
    </div>
  );
};

export default Header;
