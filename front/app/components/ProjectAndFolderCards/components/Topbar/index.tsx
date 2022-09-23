import { useBreakpoint } from '@citizenlab/cl2-component-library';
import React, { useEffect, useState } from 'react';

// services
import { coreSettings } from 'services/appConfiguration';

// hooks
import useAppConfiguration from 'hooks/useAppConfiguration';
import useAreas from 'hooks/useAreas';
import useLocalize from 'hooks/useLocalize';
import useTopics from 'hooks/useTopics';

// components
import SearchInput from 'components/UI/SearchInput';
import { ScreenReaderOnly } from 'utils/a11y';
import SelectAreas from './SelectAreas';
import SelectTopics from './SelectTopics';
import Tabs from './Tabs';

// styling
import styled from 'styled-components';
import { colors, fontSizes, isRtl, media } from 'utils/styleUtils';

// i18n
import { injectIntl, WrappedComponentProps } from 'react-intl';
import messages from './messages';

// utils
import { useSearchParams } from 'react-router-dom';
import clHistory from 'utils/cl-router/history';
import { isNilOrError } from 'utils/helperUtils';
import { getShowFilters, getShowFiltersLabel } from './show';

// typings
import { IStatusCounts } from 'hooks/useAdminPublicationsStatusCounts';
import { PublicationTab } from '../..';

const Title = styled.h2<{ hasPublications: boolean }>`
  color: ${({ theme }) => theme.colorText};
  font-size: ${fontSizes.xl}px;
  font-weight: 500;
  line-height: normal;
  padding: 0;
  width: 100%;
  text-align: center;
  margin-bottom: 28px;

  ${media.smallerThanMinTablet`
    text-align: left;
    margin-bottom: ${({ hasPublications }) =>
      hasPublications ? '36' : '20'}px;
    margin-left: 4px;
  `}
  ${isRtl`
    direction: rtl;
  `}
`;

const Container = styled.div<{ showFilters: boolean }>`
  width: 100%;
  display: flex;
  flex-direction: row-reverse;
  justify-content: ${({ showFilters }) =>
    showFilters ? 'space-between' : 'start'};
  border-bottom: 1px solid #d1d1d1;

  ${isRtl`
    flex-direction: row-reverse;
  `}

  ${media.xlPhone`
    flex-direction: row;
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

  ${media.smallerThanMinTablet`
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
  color: ${colors.label};
  transform: translateY(-1px);
`;

const MobileFilters = styled.div`
  display: block;
  margin-top: 20px;
`;

interface Props {
  className?: string;
  currentTab: PublicationTab;
  statusCounts: IStatusCounts;
  noAdminPublicationsAtAll: boolean;
  availableTabs: PublicationTab[];
  showTitle: boolean;
  showSearch?: boolean;
  hasPublications: boolean;
  onChangeTopics: (topics: string[]) => void;
  onChangeAreas: (areas: string[]) => void;
  onChangeTab: (tab: PublicationTab) => void;
  onChangeSearch: (search: string | null) => void;
}

const Header = ({
  className,
  currentTab,
  statusCounts,
  noAdminPublicationsAtAll,
  availableTabs,
  showTitle,
  showSearch,
  hasPublications,
  onChangeTopics,
  onChangeAreas,
  onChangeTab,
  onChangeSearch,
  intl: { formatMessage },
}: Props & WrappedComponentProps) => {
  const appConfig = useAppConfiguration();
  const smallerThanXlPhone = useBreakpoint('xlPhone');
  const smallerThanMinTablet = useBreakpoint('smallTablet');
  const topics = useTopics({ forHomepageFilter: true });
  const areas = useAreas({ forHomepageFilter: true });
  const localize = useLocalize();
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [selectedAreas, setSelectedAreas] = useState<string[]>([]);
  const [searchParams] = useSearchParams();
  const [searchInputRef, setSearchInputRef] = useState<HTMLInputElement | null>(
    null
  );

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

  if (isNilOrError(appConfig)) return null;

  const customCurrentlyWorkingOn =
    coreSettings(appConfig).currently_working_on_text;
  const fallback = formatMessage(messages.currentlyWorkingOn, {
    orgName: localize(appConfig.attributes.settings.core.organization_name),
  });
  const currentlyWorkingOnText = localize(customCurrentlyWorkingOn, {
    fallback,
  });

  const showTabs = !noAdminPublicationsAtAll;
  const showFilters = getShowFilters({
    smallerThanXlPhone,
    hasPublications,
    statusCounts,
    selectedTopics,
    selectedAreas,
  });
  const showFiltersLabel = getShowFiltersLabel(
    topics,
    areas,
    smallerThanMinTablet
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

  const shouldShowAreaAndTagFilters = !smallerThanXlPhone && showFilters;

  return (
    <div className={className}>
      {showTitle ? (
        <Title
          hasPublications={hasPublications}
          data-testid="currently-working-on-text"
        >
          {currentlyWorkingOnText}
        </Title>
      ) : (
        <ScreenReaderOnly>{currentlyWorkingOnText}</ScreenReaderOnly>
      )}

      {showSearch && (
        <StyledSearchInput
          onChange={handleOnSearchChange}
          a11y_numberOfSearchResults={statusCounts.all}
          setInputRef={handleSetSearchInputRef}
        />
      )}

      <Container showFilters={shouldShowAreaAndTagFilters}>
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

        {showTabs && (
          <Tabs
            currentTab={currentTab}
            statusCounts={statusCounts}
            availableTabs={availableTabs}
            onChangeTab={onChangeTab}
          />
        )}
      </Container>

      {smallerThanXlPhone && showFilters && (
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

export default injectIntl(Header);
