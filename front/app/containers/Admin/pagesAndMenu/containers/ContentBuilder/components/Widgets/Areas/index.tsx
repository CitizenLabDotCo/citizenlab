import React from 'react';

import { Multiloc } from 'typings';

import useAreas from 'api/areas/useAreas';
import useProjectsMini from 'api/projects_mini/useProjectsMini';

import useLocalize from 'hooks/useLocalize';

import EmptyState from '../_shared/EmptyState';
import ProjectCarrousel from '../_shared/ProjectCarrousel';
import Skeleton from '../_shared/ProjectCarrousel/Skeleton';

import AreaSelection from './AreaSelection';
import messages from './messages';
import Settings from './Settings';

interface Props {
  titleMultiloc: Multiloc;
}

const Areas = ({ titleMultiloc }: Props) => {
  const localize = useLocalize();
  const { data: areas } = useAreas({
    sort: 'projects_count',
  });

  const followedAreas =
    areas?.data
      .filter((area) => !!area.relationships.user_follower.data?.id)
      .map((area) => area.id) ?? [];

  const hasFollowPreferences = followedAreas.length > 0;

  const { data, hasNextPage, fetchNextPage } = useProjectsMini(
    {
      endpoint: 'for_areas',
      areas: followedAreas,
    },
    {
      enabled: hasFollowPreferences,
    }
  );

  const projects = data?.pages.map((page) => page.data).flat();

  const title = localize(titleMultiloc);

  if (!areas) {
    return <Skeleton title={title} />;
  }

  if (!hasFollowPreferences) {
    return <AreaSelection title={title} areas={areas} />;
  }

  if (!projects) {
    return <Skeleton title={title} />;
  }

  if (projects.length === 0) {
    return (
      <EmptyState titleMultiloc={titleMultiloc} explanation={messages.noData} />
    );
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
