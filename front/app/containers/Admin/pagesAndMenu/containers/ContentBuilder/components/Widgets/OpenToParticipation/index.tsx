import React from 'react';

import { Multiloc } from 'typings';

import useProjectsWithActiveParticipatoryPhase from 'api/projects_mini/useProjectsWithActiveParticipatoryPhase';

import useLocalize from 'hooks/useLocalize';

import messages from './messages';
import ProjectCarrousel from './ProjectCarrousel';
import Settings from './Settings';

interface Props {
  titleMultiloc: Multiloc;
}

const OpenToParticipation = ({ titleMultiloc }: Props) => {
  const localize = useLocalize();
  const { data, hasNextPage, fetchNextPage } =
    useProjectsWithActiveParticipatoryPhase();
  const projects = data?.pages.map((page) => page.data).flat();

  if (!projects) return null;
  if (projects.length === 0) return null;

  return (
    <ProjectCarrousel
      title={localize(titleMultiloc)}
      projects={projects}
      hasMore={!!hasNextPage}
      onLoadMore={fetchNextPage}
    />
  );
};

OpenToParticipation.craft = {
  related: {
    settings: Settings,
  },
  custom: {
    title: messages.openToParticipation,
    noPointerEvents: true,
  },
};

export const openToParticipationTitle = messages.openToParticipation;

export default OpenToParticipation;
