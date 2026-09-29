import React from 'react';

import { Multiloc } from 'typings';

import useProjectsMini from 'api/projects_mini/useProjectsMini';

import { CarrouselContainer } from 'components/admin/ContentBuilder/Widgets/_shared/BaseCarrousel/Containers';
import CarrouselTitle from 'components/admin/ContentBuilder/Widgets/_shared/CarrouselTitle';
import EmptyState from 'components/admin/ContentBuilder/Widgets/_shared/EmptyState';
import ProjectCarrousel from 'components/admin/ContentBuilder/Widgets/_shared/ProjectCarrousel';
import Skeleton from 'components/admin/ContentBuilder/Widgets/_shared/ProjectCarrousel/Skeleton';
import useLocalizeWithFallback from 'components/admin/ContentBuilder/Widgets/_shared/useLocalizeWithFallback';

import messages from './messages';
import Settings from './Settings';

interface Props {
  titleMultiloc: Multiloc;
}

const OpenToParticipation = ({ titleMultiloc }: Props) => {
  const localizeWithFallback = useLocalizeWithFallback();
  const { data, hasNextPage, fetchNextPage, isLoading } = useProjectsMini({
    endpoint: 'with_active_participatory_phase',
  });
  const projects = data?.pages.map((page) => page.data).flat();
  const title = localizeWithFallback(titleMultiloc, openToParticipationTitle);

  if (isLoading) {
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
