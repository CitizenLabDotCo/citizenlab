import React, { useRef, useEffect } from 'react';

import { Box } from '@citizenlab/cl2-component-library';
import { Multiloc } from 'typings';

import { IAdminPublicationData } from 'api/admin_publications/types';
import { IStatusCountsAll } from 'api/admin_publications_status_counts/types';
import { PublicationStatus } from 'api/projects/types';

import { trackEventByName } from 'utils/analytics';

import EmptyContainer from './components/EmptyContainer';
import Footer from './components/Footer';
import LoadingBox from './components/LoadingBox';
import PublicationStatusTabs from './components/PublicationStatusTabs';
import Topbar from './components/Topbar';
import messages from './messages';
import tracks from './tracks';
import { getAvailableTabs } from './utils';

import { PublicationTab, Props as BaseProps } from '.';

interface Props extends BaseProps {
  statusCounts: IStatusCountsAll;
  showFilters: boolean;
  adminPublications: IAdminPublicationData[];
  statusCountsWithoutFilters: IStatusCountsAll;
  loadingInitial?: boolean;
  loadingMore?: boolean;
  hasMore?: boolean;
  currentlyWorkingOnText?: Multiloc;
  currentTab: PublicationTab;
  onChangeTopics?: (topics: string[]) => void;
  onChangeAreas?: (areas: string[]) => void;
  onChangeSearch?: (search: string | null) => void;
  onChangePublicationStatus?: (publicationStatus: PublicationStatus[]) => void;
  onLoadMore?: () => void;
  onChangeCurrentTab: (tab: PublicationTab) => void;
  searchTerm?: string | null;
}

const ProjectAndFolderCardsInner = ({
  statusCounts,
  showTitle,
  showSearch,
  showFilters,
  layout,
  adminPublications,
  statusCountsWithoutFilters,
  loadingInitial,
  loadingMore,
  hasMore,
  currentlyWorkingOnText,
  currentTab,
  onChangeTopics,
  onChangeAreas,
  onChangeSearch,
  onLoadMore,
  onChangeCurrentTab,
  searchTerm,
}: Props) => {
  const handleChangeSearch = React.useCallback(
    (search: string | null) => {
      onChangeSearch?.(search);
    },
    [onChangeSearch]
  );

  // Focus on the first newly added card when show more are loaded
  const visibileCardsLength = useRef(adminPublications.length);
  useEffect(() => {
    const panel = document.querySelector('[role="tabpanel"].active-tab');
    const cards = panel?.querySelectorAll<HTMLElement>(
      '.e2e-admin-publication-card'
    );
    if (!cards) return;

    // Focus only if new cards were added
    if (adminPublications.length > visibileCardsLength.current) {
      cards[visibileCardsLength.current].focus();
      cards[visibileCardsLength.current].scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }

    // Update previous length (handles tab change or new cards)
    visibileCardsLength.current = adminPublications.length;
  }, [adminPublications, currentTab]);

  // TODO: Fix this the next time the file is edited.
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
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

  // TODO: Fix this the next time the file is edited.
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  const hasPublications = adminPublications && adminPublications.length > 0;

  return (
    <Box id="e2e-projects-container" display="flex" flexDirection="column">
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
          onChangeTab={onChangeCurrentTab}
          currentlyWorkingOnText={currentlyWorkingOnText}
          searchTerm={searchTerm}
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
