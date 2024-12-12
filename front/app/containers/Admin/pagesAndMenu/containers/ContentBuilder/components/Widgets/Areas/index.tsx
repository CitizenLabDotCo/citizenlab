import React from 'react';

import { Multiloc } from 'typings';

import useAreas from 'api/areas/useAreas';
import useProjectsMini from 'api/projects_mini/useProjectsMini';

import useFeatureFlag from 'hooks/useFeatureFlag';
import useLocalize from 'hooks/useLocalize';

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
  const { data, hasNextPage, fetchNextPage } = useProjectsMini({
    endpoint: 'for_areas',
  });

  const projects = data?.pages.map((page) => page.data).flat();

  const { data: areas } = useAreas(
    {
      sort: 'projects_count',
      pageSize: 100,
    },
    {
      // Only fetch areas in this particular situation (see below)
      enabled: projects && projects.length === 0,
    }
  );

  const title = localize(titleMultiloc);

  if (!followEnabled) return null;

  // If no projects yet, show loading skeleton
  if (!projects) {
    return <Skeleton title={title} />;
  }

  // If projects loaded, but no projects:
  if (projects.length === 0) {
    // Wait for areas to load
    if (!areas) return <Skeleton title={title} />;

    const followedAreaIds = areas.data
      .filter((area) => !!area.relationships.user_follower.data?.id)
      .map((area) => area.id);

    const hasFollowPreferences = followedAreaIds.length > 0;

    // If the user has no follow preferences yet,
    // we render an interface to select areas to follow
    if (!hasFollowPreferences) {
      return <AreaSelection title={title} areas={areas} />;
    }

    // If, even after indicating follow preferences,
    // there are no projects, we show the empty state.
    return <EmptyState title={title} areas={areas} />;
  }

  return (
    <ProjectCarrousel
      title={title}
      projects={projects}
      hasMore={!!hasNextPage}
      className="e2e-areas-widget"
      onLoadMore={fetchNextPage}
    />
  );
};

Areas.craft = {
  related: {
    settings: Settings,
  },
};

export const areasTitle = messages.areasTitle;

export default Areas;
