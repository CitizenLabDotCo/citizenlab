import React, { useEffect } from 'react';
// style
import styled from 'styled-components';
// hooks
import useAdminPublications from 'hooks/useAdminPublications';
import useAdminPublicationsStatusCounts, {
  IStatusCounts,
} from 'hooks/useAdminPublicationsStatusCounts';
import { getAvailableTabs } from './utils';
// tracking
import { trackEventByName } from 'utils/analytics';
// utils
import { isNilOrError } from 'utils/helperUtils';
import EmptyContainer from './components/EmptyContainer';
import Footer from './components/Footer';
import LoadingBox from './components/LoadingBox';
import ProjectsList from './components/ProjectsList';
// components
import Topbar from './components/Topbar';
// typings
import { PublicationTab, Props as BaseProps } from '.';
// i18n
import messages from './messages';
import tracks from './tracks';

const Container = styled.div`
  display: flex;
  flex-direction: column;
`;

const StyledTopbar = styled(Topbar)`
  margin-bottom: 30px;
`;

interface Props extends BaseProps {
  currentTab: PublicationTab;
  statusCounts: IStatusCounts;
  rootLevelOnly: boolean;
  onChangeTopics: (topics: string[]) => void;
  onChangeAreas: (areas: string[]) => void;
  onChangeTab: (tab: PublicationTab) => void;
  onChangeSearch: (search: string | null) => void;
}

const ProjectAndFolderCardsInner = ({
  currentTab,
  statusCounts,
  showTitle,
  showSearch,
  layout,
  publicationStatusFilter,
  onChangeTopics,
  onChangeAreas,
  onChangeTab,
  onChangeSearch,
  rootLevelOnly,
}: Props) => {
  const adminPublications = useAdminPublications({
    pageSize: 6,
    publicationStatusFilter,
    rootLevelOnly,
    removeNotAllowedParents: true,
  });

  const { counts: statusCountsWithoutFilters } =
    useAdminPublicationsStatusCounts({
      publicationStatusFilter,
      rootLevelOnly: true,
      removeNotAllowedParents: true,
    });

  const publicationStatusesForCurrentTab = currentTab
    ? currentTab === 'all'
      ? publicationStatusFilter
      : [currentTab]
    : undefined;

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
      onChangeSearch(search);
      adminPublications.onChangeSearch(search);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [onChangeSearch]
  );

  if (isNilOrError(statusCountsWithoutFilters)) return null;

  const availableTabs = getAvailableTabs(statusCountsWithoutFilters);
  const noAdminPublicationsAtAll = statusCountsWithoutFilters.all === 0;

  const showMore = () => {
    trackEventByName(tracks.clickOnProjectsShowMoreButton);
    adminPublications.onLoadMore();
  };

  const handleChangeTopics = (topics: string[]) => {
    onChangeTopics(topics);
    adminPublications.onChangeTopics(topics);
  };

  const handleChangeAreas = (areas: string[]) => {
    onChangeAreas(areas);
    adminPublications.onChangeAreas(areas);
  };

  const { loadingInitial, loadingMore, hasMore, list } = adminPublications;
  const hasPublications = !isNilOrError(list) && list.length > 0;

  return (
    <Container id="e2e-projects-container">
      <StyledTopbar
        showTitle={showTitle}
        showSearch={showSearch}
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
        <ProjectsList
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
