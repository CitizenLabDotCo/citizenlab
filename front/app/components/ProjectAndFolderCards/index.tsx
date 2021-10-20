import React, { useState, useEffect } from 'react';
import { isNilOrError } from 'utils/helperUtils';
import { isEqual, isEmpty, isString } from 'lodash-es';
import { withRouter, WithRouterProps } from 'react-router';
import { stringify } from 'qs';

// components
import Header from './components/Header';
import EmptyContainer from './components/EmptyContainer';
import ProjectsList from './components/ProjectsList';
import LoadingBox from './components/LoadingBox';
import Footer from './components/Footer';

// hooks
import useAdminPublicationPrefetchProjects from 'hooks/useAdminPublicationPrefetchProjects';

// services
import { InputProps as UseAdminPublicationInputProps } from 'hooks/useAdminPublications';

// routing
import { removeLocale } from 'utils/cl-router/updateLocationDescriptor';
import clHistory from 'utils/cl-router/history';

// tracking
import { trackEventByName } from 'utils/analytics';
import tracks from './tracks';

// style
import styled from 'styled-components';

const Container = styled.div`
  display: flex;
  flex-direction: column;
`;

export type TLayout = 'dynamic' | 'threecolumns' | 'twocolumns';

interface Props extends UseAdminPublicationInputProps {
  showTitle: boolean;
  layout: TLayout;
}

export type TCardSize = 'small' | 'medium' | 'large';

const ProjectAndFolderCards = ({
  location,
  showTitle,
  layout,
  publicationStatusFilter,
}: Props & WithRouterProps) => {
  const adminPublications = useAdminPublicationPrefetchProjects({
    pageSize: 6,
    publicationStatusFilter,
    rootLevelOnly: true,
    removeNotAllowedParents: true,
  });

  const [areas, setAreas] = useState<string[]>([]);

  useEffect(() => {
    const { query } = location;

    if (!query.areas || isEmpty(query.areas)) return;
    const newAreas = isString(query.areas) ? [query.areas] : query.areas;

    if (isEqual(areas, newAreas)) return;
    setAreas(newAreas);

    if (isNilOrError(adminPublications)) return;
    adminPublications.onChangeAreas(newAreas);
  }, [location.query.areas, adminPublications]);

  const showMore = () => {
    trackEventByName(tracks.clickOnProjectsShowMoreButton);
    adminPublications.onLoadMore();
  };

  const handleAreasOnChange = (newAreas: string[]) => {
    if (!isEqual(areas, newAreas)) {
      trackEventByName(tracks.clickOnProjectsAreaFilter);
      const { pathname } = removeLocale(location.pathname);
      const query = { ...location.query, areas };
      const search = `?${stringify(query, { indices: false, encode: false })}`;
      clHistory.replace({ pathname, search });
    }
  };

  const { loadingInitial, loadingMore, hasMore, list } = adminPublications;
  const hasPublications = list && list.length > 0;

  return (
    <Container id="e2e-projects-container">
      <Header
        showTitle={showTitle}
        areas={areas}
        onAreasChange={handleAreasOnChange}
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

export default withRouter(ProjectAndFolderCards);
