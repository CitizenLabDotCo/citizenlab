import React, { useEffect, useState } from 'react';

// components
import Topbar from './components/Topbar';
import EmptyContainer from './components/EmptyContainer';
import PublicationStatusTabs from './components/PublicationStatusTabs';
import LoadingBox from './components/LoadingBox';
import Footer from './components/Footer';

// tracking
import { trackEventByName } from 'utils/analytics';
import tracks from './tracks';

// style
import styled from 'styled-components';

// i18n
import messages from './messages';

// utils
import { isNilOrError } from 'utils/helperUtils';
import { getAvailableTabs, getCurrentTab } from './utils';

// typings
import { PublicationTab, Props as BaseProps } from '.';
import { IAdminPublicationData } from 'api/admin_publications/types';
import { IStatusCountsAll } from 'api/admin_publications_status_counts/types';
import { Multiloc } from 'typings';
import { PublicationStatus } from 'api/projects/types';

const Container = styled.div`
  display: flex;
  flex-direction: column;
`;

const StyledTopbar = styled(Topbar)`
  margin-bottom: 30px;
`;

interface Props extends BaseProps {
  statusCounts: IStatusCountsAll;
  onChangeTopics?: (topics: string[]) => void;
  onChangeAreas?: (areas: string[]) => void;
  onChangeSearch?: (search: string | null) => void;
  showFilters: boolean;
  adminPublications: IAdminPublicationData[];
  statusCountsWithoutFilters: IStatusCountsAll;
  onChangePublicationStatus?: (publicationStatus: PublicationStatus[]) => void;
  onLoadMore?: () => void;
  loadingInitial?: boolean;
  loadingMore?: boolean;
  hasMore?: boolean;
  currentlyWorkingOnText?: Multiloc;
}

const ProjectAndFolderCardsInner = ({
  statusCounts,
  showTitle,
  showSearch,
  showFilters,
  layout,
  publicationStatusFilter,
  onChangeTopics,
  onChangeAreas,
  onChangeSearch,
  adminPublications,
  statusCountsWithoutFilters,
  onChangePublicationStatus,
  onLoadMore,
  loadingInitial,
  loadingMore,
  hasMore,
  currentlyWorkingOnText,
}: Props) => {
  const [currentTab, setCurrentTab] = useState<PublicationTab | null>(null);

  useEffect(() => {
    if (currentTab) return;
    setCurrentTab((currentTab) => getCurrentTab(statusCounts, currentTab));
  }, [statusCounts, currentTab]);

  const onChangeTab = (tab: PublicationTab) => {
    setCurrentTab(tab);
  };

  const publicationStatusesForCurrentTab = currentTab
    ? currentTab === 'all'
      ? publicationStatusFilter
      : [currentTab]
    : null;

  const publicationStatusesForCurrentTabStringified = JSON.stringify(
    publicationStatusesForCurrentTab
  );

  useEffect(() => {
    const publicationStatusesForCurrentTab = JSON.parse(
      publicationStatusesForCurrentTabStringified
    );
    if (!publicationStatusesForCurrentTab) return;
    onChangePublicationStatus &&
      onChangePublicationStatus(publicationStatusesForCurrentTab);
  }, [publicationStatusesForCurrentTabStringified, onChangePublicationStatus]);

  const handleChangeSearch = React.useCallback(
    (search: string | null) => {
      onChangeSearch?.(search);
    },
    [onChangeSearch]
  );

  if (!currentTab) {
    return null;
  }

  const availableTabs = getAvailableTabs(statusCountsWithoutFilters);
  const noAdminPublicationsAtAll = statusCountsWithoutFilters.all === 0;

  const showMore = () => {
    trackEventByName(tracks.clickOnProjectsShowMoreButton);
    onLoadMore && onLoadMore();
  };

  const handleChangeTopics = (topics: string[]) => {
    onChangeTopics?.(topics);
  };

  const handleChangeAreas = (areas: string[]) => {
    onChangeAreas?.(areas);
  };

  const hasPublications =
    !isNilOrError(adminPublications) && adminPublications.length > 0;

  return (
    <Container id="e2e-projects-container">
      <StyledTopbar
        showTitle={showTitle}
        showSearch={showSearch}
        showFilters={showFilters}
        currentTab={currentTab}
        statusCounts={statusCounts}
        noAdminPublicationsAtAll={noAdminPublicationsAtAll}
        availableTabs={availableTabs}
        hasPublications={hasPublications}
        onChangeTopics={handleChangeTopics}
        onChangeAreas={handleChangeAreas}
        onChangeSearch={handleChangeSearch}
        onChangeTab={onChangeTab}
        currentlyWorkingOnText={currentlyWorkingOnText}
      />

      {loadingInitial && <LoadingBox />}

      {!loadingInitial && noAdminPublicationsAtAll && (
        <EmptyContainer
          titleMessage={messages.noProjectYet}
          descriptionMessage={messages.stayTuned}
        />
      )}

      {!loadingInitial && !noAdminPublicationsAtAll && !hasPublications && (
        <EmptyContainer
          titleMessage={messages.noProjectsAvailable}
          descriptionMessage={messages.tryChangingFilters}
        />
      )}

      {!loadingInitial && hasPublications && (
        <PublicationStatusTabs
          currentTab={currentTab}
          availableTabs={availableTabs}
          list={adminPublications}
          layout={layout}
          hasMore={!!hasMore}
        />
      )}

      {!loadingInitial && hasPublications && hasMore && (
        <Footer loadingMore={!!loadingMore} onShowMore={showMore} />
      )}
    </Container>
  );
};

export default ProjectAndFolderCardsInner;
