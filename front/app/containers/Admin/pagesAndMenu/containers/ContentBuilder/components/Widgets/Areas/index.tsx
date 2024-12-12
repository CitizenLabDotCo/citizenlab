import React, { useState } from 'react';

import { Multiloc } from 'typings';

import useAreas from 'api/areas/useAreas';
import useProjectsMini from 'api/projects_mini/useProjectsMini';

import useFeatureFlag from 'hooks/useFeatureFlag';
import useLocalize from 'hooks/useLocalize';

import ProjectCarrousel from '../_shared/ProjectCarrousel';
import Skeleton from '../_shared/ProjectCarrousel/Skeleton';

import AreaSelection from './AreaSelection';
import DropdownSelect from './DropdownSelect';
import EmptyState from './EmptyState';
import messages from './messages';
import Settings from './Settings';

interface Props {
  titleMultiloc: Multiloc;
}

const Areas = ({ titleMultiloc }: Props) => {
  const localize = useLocalize();
  const followEnabled = useFeatureFlag({ name: 'follow' });
  const { data: areas } = useAreas({
    sort: 'projects_count',
    pageSize: 100,
  });
  const [selectedAreaId, setSelectedAreaId] = useState<string>();

  const followedAreaIds =
    areas?.data
      .filter((area) => !!area.relationships.user_follower.data?.id)
      .map((area) => area.id) ?? [];

  const hasFollowPreferences = followedAreaIds.length > 0;

  const { data, hasNextPage, fetchNextPage } = useProjectsMini(
    {
      endpoint: 'for_areas',
      areas: selectedAreaId ? [selectedAreaId] : followedAreaIds,
    },
    {
      enabled: hasFollowPreferences,
    }
  );

  const projects = data?.pages.map((page) => page.data).flat();

  const title = localize(titleMultiloc);

  if (!followEnabled) return null;

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
    return <EmptyState title={title} areas={areas} />;
  }

  return (
    <ProjectCarrousel
      title={title}
      projects={projects}
      hasMore={!!hasNextPage}
      className="e2e-areas-widget"
      dropDownSelect={
        <DropdownSelect
          selectedAreaId={selectedAreaId}
          areas={areas}
          onSelectArea={setSelectedAreaId}
        />
      }
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
