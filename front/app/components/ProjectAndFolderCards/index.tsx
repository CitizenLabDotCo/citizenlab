import React from 'react';

// components
import Header from './components/Header';
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

const Container = styled.div`
  display: flex;
  flex-direction: column;
`;

export type TLayout = 'dynamic' | 'threecolumns' | 'twocolumns';

interface Props extends UseAdminPublicationInputProps {
  showTitle: boolean;
  layout: TLayout;
}

const ProjectAndFolderCards = ({
  showTitle,
  layout,
  publicationStatusFilter,
}: Props) => {
  const adminPublications = useAdminPublications({
    pageSize: 6,
    publicationStatusFilter,
    rootLevelOnly: true,
    removeNotAllowedParents: true,
  });

  const showMore = () => {
    trackEventByName(tracks.clickOnProjectsShowMoreButton);
    adminPublications.onLoadMore();
  };

  const { loadingInitial, loadingMore, hasMore, list } = adminPublications;
  const hasPublications = !isNilOrError(list) && list.length > 0;

  return (
    <Container id="e2e-projects-container">
      <Header
        showTitle={showTitle}
        onChangeAreas={adminPublications.onChangeAreas}
      />

      {loadingInitial && <LoadingBox />}

      {!loadingInitial && !hasPublications && <EmptyContainer />}

      {!loadingInitial && hasPublications && list && (
        <ProjectsList list={list} layout={layout} hasMore={hasMore} />
      )}

      {!loadingInitial && hasPublications && hasMore && (
        <Footer loadingMore={loadingMore} onShowMore={showMore} />
      )}
    </Container>
  );
};

export default ProjectAndFolderCards;
