import React from 'react';

import { Multiloc } from 'typings';

import useAreas from 'api/areas/useAreas';
import useProjectsMini from 'api/projects_mini/useProjectsMini';

import useLocalize from 'hooks/useLocalize';

import EmptyState from '../_shared/EmptyState';

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

  if (!areas) return null; // LOADING

  if (!hasFollowPreferences) {
    return <AreaSelection title={title} areas={areas} />;
  }

  if (!projects) return null; // LOADING

  if (projects.length === 0) {
    return (
      <EmptyState titleMultiloc={titleMultiloc} explanation={messages.noData} />
    );
  }

  // Render the carrousel
  return <>Carrousel!!</>;
};

Areas.craft = {
  related: {
    settings: Settings,
  },
};

export const areasTitle = messages.areasTitle;

export default Areas;
