import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';
import { Multiloc } from 'typings';

import useAuthUser from 'api/me/useAuthUser';
import useProjectsMini from 'api/projects_mini/useProjectsMini';

import useFeatureFlag from 'hooks/useFeatureFlag';
import useLocalize from 'hooks/useLocalize';

import { CarrouselContainer } from '../_shared/BaseCarrousel/Containers';
import CarrouselTitle from '../_shared/CarrouselTitle';
import ProjectCarrousel from '../_shared/ProjectCarrousel';
import Skeleton from '../_shared/ProjectCarrousel/Skeleton';

import ButtonWithFollowAreasModal from './ButtonWithFollowAreasModal';
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

  if (!followEnabled || !authUser) return null;

  const title = localize(titleMultiloc);

  // If no projects yet, show loading skeleton
  if (!projects) {
    return <Skeleton title={title} />;
  }

  // If projects loaded, but no projects:
  if (projects.length === 0) {
    //   // If, even after indicating follow preferences,
    //   // there are no projects, we show the empty state.
    return <EmptyState title={title} />;
  }

  return (
    <CarrouselContainer className="e2e-areas-widget">
      <Box display="flex" alignItems="center">
        <CarrouselTitle>{title}</CarrouselTitle>
        <Box mb="12px">
          <ButtonWithFollowAreasModal />
        </Box>
      </Box>
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
