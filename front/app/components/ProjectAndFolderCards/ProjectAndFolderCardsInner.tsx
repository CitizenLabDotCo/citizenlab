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
import { IUseAdminPublicationsOutput } from 'hooks/useAdminPublications';
import { IStatusCounts } from 'hooks/useAdminPublicationsStatusCounts';

const Container = styled.div`
  display: flex;
  flex-direction: column;
`;

const StyledTopbar = styled(Topbar)`
  margin-bottom: 30px;
`;

interface Props extends BaseProps {
  statusCounts: IStatusCounts | Error | null | undefined;
  onChangeTopics?: (topics: string[]) => void;
  onChangeAreas?: (areas: string[]) => void;
  onChangeSearch?: (search: string | null) => void;
  showFilters: boolean;
  adminPublications: IUseAdminPublicationsOutput;
  statusCountsWithoutFilters: IStatusCounts | undefined | null | Error;
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
}: Props) => {
  const [currentTab, setCurrentTab] = useState<PublicationTab | null>(null);

  useEffect(() => {
    if (isNilOrError(statusCounts) || currentTab) return;
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
    if (!publicationStatusesForCurrentTab) return;
    adminPublications.onChangePublicationStatus(
      publicationStatusesForCurrentTab
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [publicationStatusesForCurrentTabStringified]);

  const handleChangeSearch = React.useCallback(
    (search: string | null) => {
      onChangeSearch?.(search);
      adminPublications.onChangeSearch(search);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [onChangeSearch]
  );

  if (
    isNilOrError(statusCounts) ||
    !currentTab ||
    isNilOrError(statusCountsWithoutFilters)
  ) {
    return null;
  }

  const availableTabs = getAvailableTabs(statusCountsWithoutFilters);
  const noAdminPublicationsAtAll = statusCountsWithoutFilters.all === 0;

  const showMore = () => {
    trackEventByName(tracks.clickOnProjectsShowMoreButton);
    adminPublications.onLoadMore();
  };

  const handleChangeTopics = (topics: string[]) => {
    onChangeTopics?.(topics);
    adminPublications.onChangeTopics(topics);
  };

  const handleChangeAreas = (areas: string[]) => {
    onChangeAreas?.(areas);
    adminPublications.onChangeAreas(areas);
  };

  const { loadingInitial, loadingMore, hasMore, list } = adminPublications;
  const hasPublications = !isNilOrError(list) && list.length > 0;

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
          list={list}
          layout={layout}
          hasMore={hasMore}
        />
      )}

      {!loadingInitial && hasPublications && hasMore && (
        <Footer loadingMore={loadingMore} onShowMore={showMore} />
      )}
    </Container>
  );
};

export default ProjectAndFolderCardsInner;
