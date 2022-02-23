import React, { useEffect, useMemo } from 'react';

// components
import Topbar from './components/Topbar';
import EmptyContainer from './components/EmptyContainer';
import ProjectsList from './components/ProjectsList';
import LoadingBox from './components/LoadingBox';
import Footer from './components/Footer';

// hooks
import useAdminPublications from 'hooks/useAdminPublications';

// tracking
import { trackEventByName } from 'utils/analytics';
import tracks from './tracks';

// style
import styled from 'styled-components';

// utils
import { isNilOrError } from 'utils/helperUtils';
import { getAvailableTabs } from './utils';

// typings
import { IStatusCounts } from 'hooks/useAdminPublicationsStatusCounts';
import { PublicationTab, Props as BaseProps } from '.';

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
  onChangeAreas: (areas: string[]) => void;
  onChangeTab: (tab: PublicationTab) => void;
}

const ProjectAndFolderCardsInner = ({
  currentTab,
  statusCounts,
  showTitle,
  layout,
  publicationStatusFilter,
  onChangeAreas,
  onChangeTab,
}: Props) => {
  const adminPublications = useAdminPublications({
    pageSize: 6,
    publicationStatusFilter,
    rootLevelOnly: true,
    removeNotAllowedParents: true,
  });

  const publicationStatusesStringified = JSON.stringify(
    publicationStatusFilter
  );

  useEffect(() => {
    adminPublications.onChangePublicationStatus(publicationStatusFilter);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [publicationStatusesStringified]);

  const availableTabs = useMemo(() => {
    return getAvailableTabs(statusCounts);
  }, [statusCounts]);

  const showMore = () => {
    trackEventByName(tracks.clickOnProjectsShowMoreButton);
    adminPublications.onLoadMore();
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
        currentTab={currentTab}
        statusCounts={statusCounts}
        availableTabs={availableTabs}
        hasPublications={hasPublications}
        onChangeAreas={handleChangeAreas}
        onChangeTab={onChangeTab}
      />

      {loadingInitial && <LoadingBox />}

      {!loadingInitial && !hasPublications && <EmptyContainer />}

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
