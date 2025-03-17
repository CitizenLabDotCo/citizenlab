import React from 'react';

import { Multiloc } from 'typings';

import useAreas from 'api/areas/useAreas';
import useAuthUser from 'api/me/useAuthUser';
import useProjectsMini from 'api/projects_mini/useProjectsMini';

import useFeatureFlag from 'hooks/useFeatureFlag';
import useLocalize from 'hooks/useLocalize';

import { CarrouselContainer } from '../_shared/BaseCarrousel/Containers';
import CarrouselTitle from '../_shared/CarrouselTitle';
import ProjectCarrousel from '../_shared/ProjectCarrousel';
import Skeleton from '../_shared/ProjectCarrousel/Skeleton';

import AreaSelection from './AreaSelection';
import EmptyState from './EmptyState';
import messages from './messages';
import Settings from './Settings';

interface Props {
  titleMultiloc: Multiloc;
}

const Areas = ({ titleMultiloc }: Props) => {
  const localize = useLocalize();
  const followEnabled = useFeatureFlag({ name: 'follow' });
  const {
    data: miniProjects,
    hasNextPage,
    fetchNextPage,
  } = useProjectsMini({
    endpoint: 'for_areas',
  });
  const { data: authUser } = useAuthUser();
  const projects = miniProjects?.pages.map((page) => page.data).flat();
  const { data: areas } = useAreas(
    {
      sort: 'projects_count',
      pageSize: 100,
    },
    {
      // Only fetch areas in this particular situation (see below)
      enabled: projects?.length === 0,
    }
  );

  if (!followEnabled || !authUser) return null;

  const title = localize(titleMultiloc);

  // If no projects yet, show loading skeleton
  if (!projects) {
    return <Skeleton title={title} />;
  }

  // If projects loaded, but no projects:
  if (projects.length === 0) {
    // Wait for areas to load
    if (!areas) return <Skeleton title={title} />;

    const followedAreas = areas.data.filter(
      (area) => !!area.relationships.user_follower?.data?.id
    );
    // If the user has no follow preferences yet,
    // we render an interface to select areas to follow
    if (followedAreas.length === 0) {
      return <AreaSelection title={title} />;
    }

    // If, even after indicating follow preferences,
    // there are no projects, we show the empty state.
    return <EmptyState title={title} />;
  }

  return (
    <CarrouselContainer className="e2e-areas-widget">
      <CarrouselTitle>{title}</CarrouselTitle>
      <ProjectCarrousel
        projects={projects}
        hasMore={!!hasNextPage}
        onLoadMore={fetchNextPage}
      />
    </CarrouselContainer>
  );
};

Areas.craft = {
  related: {
    settings: Settings,
  },
};

export const areasTitle = messages.areasTitle;

export default Areas;
