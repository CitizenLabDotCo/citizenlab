import React from 'react';

import { Multiloc } from 'typings';

import useProjectsMini from 'api/projects_mini/useProjectsMini';

import useLocalize from 'hooks/useLocalize';

import EmptyState from '../_shared/EmptyState';
import ProjectCarrousel from '../_shared/ProjectCarrousel';
import Skeleton from '../_shared/ProjectCarrousel/Skeleton';

import messages from './messages';
import Settings from './Settings';

interface Props {
  titleMultiloc: Multiloc;
}

const OpenToParticipation = ({ titleMultiloc }: Props) => {
  const localize = useLocalize();
  const { data, hasNextPage, fetchNextPage, isInitialLoading } =
    useProjectsMini({
      endpoint: 'with_active_participatory_phase',
    });
  const projects = data?.pages.map((page) => page.data).flat();

  if (isInitialLoading) {
    return <Skeleton />;
  }

  if (!projects) return null;
  if (projects.length === 0) {
    return (
      <EmptyState titleMultiloc={titleMultiloc} explanation={messages.noData} />
    );
  }

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
};

export const openToParticipationTitle = messages.openToParticipation;

export default OpenToParticipation;
