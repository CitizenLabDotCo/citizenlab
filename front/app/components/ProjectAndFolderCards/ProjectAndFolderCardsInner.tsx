import React, { useEffect, useState } from 'react';

import { Box } from '@citizenlab/cl2-component-library';
import { Multiloc } from 'typings';

import { IAdminPublicationData } from 'api/admin_publications/types';
import { IStatusCountsAll } from 'api/admin_publications_status_counts/types';
import { PublicationStatus } from 'api/projects/types';

import { ScreenReaderOnly } from 'utils/a11y';
import { trackEventByName } from 'utils/analytics';
import { useIntl } from 'utils/cl-intl';
import { isNilOrError } from 'utils/helperUtils';

import EmptyContainer from './components/EmptyContainer';
import Footer from './components/Footer';
import LoadingBox from './components/LoadingBox';
import PublicationStatusTabs from './components/PublicationStatusTabs';
import Topbar from './components/Topbar';
import messages from './messages';
import tracks from './tracks';
import { getAvailableTabs, getCurrentTab } from './utils';

import { PublicationTab, Props as BaseProps } from '.';

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
  const { formatMessage } = useIntl();

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
    <Box id="e2e-projects-container" display="flex" flexDirection="column">
      <ScreenReaderOnly aria-live="assertive">
        {formatMessage(messages.a11y_projectsHaveChanged1, {
          numberOfFilteredResults: adminPublications.length,
        })}
      </ScreenReaderOnly>
      <Box mb="30px">
        <Topbar
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
      </Box>

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
    </Box>
  );
};

export default ProjectAndFolderCardsInner;
