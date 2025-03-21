import React from 'react';

import { Multiloc } from 'typings';

import { FinishedOrArchived as FinishedOrArchivedType } from 'api/projects_mini/types';
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
  filterBy: FinishedOrArchivedType['filter_by'];
}

const FinishedOrArchived = ({ titleMultiloc, filterBy }: Props) => {
  const localizeWithFallback = useLocalizeWithFallback();

  const { data, hasNextPage, fetchNextPage, isInitialLoading } =
    useProjectsMini({
      endpoint: 'finished_or_archived',
      filter_by: filterBy,
    });

  const projects = data?.pages.map((page) => page.data).flat();
  const title = localizeWithFallback(titleMultiloc, messages.youSaidWeDid);

  if (isInitialLoading) {
    return <Skeleton title={title} />;
  }
  if (!projects) return null;
  if (projects.length === 0) {
    return <EmptyState title={title} explanation={messages.noData} />;
  }

  return (
    <CarrouselContainer className="e2e-finished-or-archived">
      <CarrouselTitle>{title}</CarrouselTitle>
      <ProjectCarrousel
        projects={projects}
        hasMore={!!hasNextPage}
        onLoadMore={fetchNextPage}
      />
    </CarrouselContainer>
  );
};

FinishedOrArchived.craft = {
  related: {
    settings: Settings,
  },
};

export const finishedOrArchivedTitle = messages.finishedOrArchivedTitle;

export default FinishedOrArchived;
