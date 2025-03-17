import React from 'react';

import { Multiloc } from 'typings';

import useProjectsMini from 'api/projects_mini/useProjectsMini';

import { CarrouselContainer } from '../_shared/BaseCarrousel/Containers';
import CarrouselTitle from '../_shared/CarrouselTitle';
import EmptyState from '../_shared/EmptyState';
import ProjectCarrousel from '../_shared/ProjectCarrousel';
import Skeleton from '../_shared/ProjectCarrousel/Skeleton';
import useLocalizeWithFallback from '../_shared/useLocalizeWithFallback';

import messages from './messages';
import Settings from './Settings';

interface Props {
  titleMultiloc: Multiloc;
}

const OpenToParticipation = ({ titleMultiloc }: Props) => {
  const localizeWithFallback = useLocalizeWithFallback();
  const { data, hasNextPage, fetchNextPage, isInitialLoading } =
    useProjectsMini({
      endpoint: 'with_active_participatory_phase',
    });
  const projects = data?.pages.map((page) => page.data).flat();
  const title = localizeWithFallback(titleMultiloc, openToParticipationTitle);

  if (isInitialLoading) {
    return <Skeleton title={title} />;
  }

  if (!projects) return null;
  if (projects.length === 0) {
    return <EmptyState title={title} explanation={messages.noData} />;
  }

  return (
    <CarrouselContainer className="e2e-open-to-participation">
      <CarrouselTitle>{title}</CarrouselTitle>
      <ProjectCarrousel
        projects={projects}
        hasMore={!!hasNextPage}
        onLoadMore={fetchNextPage}
      />
    </CarrouselContainer>
  );
};

OpenToParticipation.craft = {
  related: {
    settings: Settings,
  },
};

export const openToParticipationTitle = messages.openToParticipation;

export default OpenToParticipation;
