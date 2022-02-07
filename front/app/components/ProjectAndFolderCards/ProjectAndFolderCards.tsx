import React, { useMemo } from 'react';

// components
import Topbar from './components/Topbar';
import EmptyContainer from './components/EmptyContainer';
import ProjectsList from './components/ProjectsList';
import LoadingBox from './components/LoadingBox';
import Footer from './components/Footer';

// hooks
import useAdminPublications, {
  InputProps as UseAdminPublicationInputProps,
} from 'hooks/useAdminPublications';

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
import { PublicationTab } from './';

const Container = styled.div`
  display: flex;
  flex-direction: column;
`;

export type TLayout = 'dynamic' | 'threecolumns' | 'twocolumns';

export interface BaseProps extends UseAdminPublicationInputProps {
  showTitle: boolean;
  layout: TLayout;
}

interface Props extends BaseProps {
  currentTab: PublicationTab;
  statusCounts: IStatusCounts;
  onChangeAreas: (areas: string[]) => void;
  onChangeTab: (tab: PublicationTab) => void;
}

const ProjectAndFolderCards = ({
  currentTab,
  statusCounts,
  showTitle,
  layout,
  publicationStatusFilters,
  onChangeAreas,
  onChangeTab,
}: Props) => {
  const adminPublications = useAdminPublications({
    pageSize: 6,
    publicationStatusFilters,
    rootLevelOnly: true,
    removeNotAllowedParents: true,
  });

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
      <Topbar
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

export default ProjectAndFolderCards;
